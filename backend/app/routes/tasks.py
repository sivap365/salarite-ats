from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.activity import activity_manager
from app.db import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskResponse, TaskSummary, TaskUpdateStatus

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).order_by(Task.created_at.desc()).all()


@router.post("/", response_model=TaskResponse)
async def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        assignee=payload.assignee,
        status="Assigned",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    await activity_manager.publish(
        "task_created",
        f"Task '{task.title}' assigned to {task.assignee} with {task.priority} priority.",
        {"task_id": task.id},
    )
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(task_id: int, payload: TaskUpdateStatus, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == "Completed":
        raise HTTPException(status_code=400, detail="Completed tasks cannot be changed")

    task.status = payload.status
    if payload.status == "Completed":
        task.completed_at = datetime.now(timezone.utc)
    else:
        task.completed_at = None

    db.add(task)
    db.commit()
    db.refresh(task)

    event_type = "task_in_progress" if task.status == "In Progress" else "task_completed"
    await activity_manager.publish(
        event_type,
        f"Task '{task.title}' marked as {task.status}.",
        {"task_id": task.id},
    )

    return task


@router.get("/summary", response_model=TaskSummary)
def task_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Task.id)).scalar() or 0
    assigned = db.query(func.count(Task.id)).filter(Task.status == "Assigned").scalar() or 0
    in_progress = db.query(func.count(Task.id)).filter(Task.status == "In Progress").scalar() or 0
    completed = db.query(func.count(Task.id)).filter(Task.status == "Completed").scalar() or 0
    high_priority = db.query(func.count(Task.id)).filter(Task.priority == "High").scalar() or 0

    return TaskSummary(
        total=total,
        assigned=assigned,
        in_progress=in_progress,
        completed=completed,
        high_priority=high_priority,
    )


@router.delete("/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_title = task.title
    db.delete(task)
    db.commit()

    await activity_manager.publish(
        "task_deleted",
        f"Task '{task_title}' was deleted.",
        {"task_id": task_id},
    )
    return {"message": "Task deleted successfully", "task_id": task_id}
