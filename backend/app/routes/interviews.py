from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.activity import activity_manager
from app.db import get_db
from app.models import Interview
from app.schemas import InterviewCreate, InterviewResponse

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.get("/", response_model=list[InterviewResponse])
def list_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).order_by(Interview.scheduled_at.asc()).all()


@router.post("/", response_model=InterviewResponse)
async def create_interview(payload: InterviewCreate, db: Session = Depends(get_db)):
    interview = Interview(
        candidate_name=payload.candidate_name,
        scheduled_at=payload.scheduled_at,
        mode=payload.mode,
        call_room_url="/call-room/pending",
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    interview.call_room_url = f"/call-room/{interview.id}"
    db.add(interview)
    db.commit()
    db.refresh(interview)

    await activity_manager.publish(
        "interview_scheduled",
        f"Interview scheduled for {interview.candidate_name} ({interview.mode}).",
        {"interview_id": interview.id},
    )

    return interview


@router.delete("/{interview_id}")
async def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    candidate_name = interview.candidate_name
    db.delete(interview)
    db.commit()

    await activity_manager.publish(
        "interview_deleted",
        f"Interview for {candidate_name} was deleted.",
        {"interview_id": interview_id},
    )
    return {"message": "Interview deleted successfully", "interview_id": interview_id}
