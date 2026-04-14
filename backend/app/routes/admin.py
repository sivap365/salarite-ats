from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.activity import activity_manager
from app.db import get_db
from app.models import Interview, Task

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/reset")
async def reset_demo_data(db: Session = Depends(get_db)):
    deleted_tasks = db.query(Task).delete()
    deleted_interviews = db.query(Interview).delete()
    db.commit()

    await activity_manager.publish(
        "demo_reset",
        "All tasks and interviews were reset for a fresh demo run.",
        {"deleted_tasks": deleted_tasks, "deleted_interviews": deleted_interviews},
    )
    return {
        "message": "Demo data reset successfully",
        "deleted_tasks": deleted_tasks,
        "deleted_interviews": deleted_interviews,
    }
