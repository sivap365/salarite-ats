from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


TaskPriority = Literal["Low", "Medium", "High"]
TaskStatus = Literal["Assigned", "In Progress", "Completed"]
TaskProgressStatus = Literal["In Progress", "Completed"]
InterviewMode = Literal["Voice Call", "Video Call", "Chat Interview"]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = "Medium"
    assignee: str = "Virtual HR"


class TaskUpdateStatus(BaseModel):
    status: TaskProgressStatus


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    assignee: str
    status: TaskStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskSummary(BaseModel):
    total: int
    assigned: int
    in_progress: int
    completed: int
    high_priority: int


class InterviewCreate(BaseModel):
    candidate_name: str
    scheduled_at: datetime
    mode: InterviewMode


class InterviewResponse(BaseModel):
    id: int
    candidate_name: str
    scheduled_at: datetime
    mode: InterviewMode
    call_room_url: str
    created_at: datetime

    class Config:
        from_attributes = True
