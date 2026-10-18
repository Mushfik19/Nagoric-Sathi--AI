import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class TaskAssignmentHistory(BaseModel):
    __tablename__ = "task_assignment_history"
    
    task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_officer_id = Column(String(36), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True)
    new_officer_id = Column(String(36), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True)
    assigned_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignment_type = Column(String(50), default="manual", nullable=False)  # manual, recommended, auto_dispatch, reassignment
    reason_bn = Column(Text, nullable=True)
    
    task = relationship("CaseTask")
    previous_officer = relationship("Officer", foreign_keys=[previous_officer_id])
    new_officer = relationship("Officer", foreign_keys=[new_officer_id])
    assigned_by = relationship("User")

class TaskWaitingQueue(BaseModel):
    __tablename__ = "task_waiting_queue"
    
    task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    priority = Column(String(50), default="medium", nullable=False, index=True)  # emergency, high, medium, low
    sla_deadline = Column(DateTime, nullable=True, index=True)
    queue_entry_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    prerequisite_status = Column(String(50), default="ready", nullable=False)  # ready, pending_prerequisite
    eligibility_state = Column(String(50), default="eligible", nullable=False)  # eligible, blocked, at_capacity
    waiting_reason_bn = Column(Text, nullable=True)
    assignment_attempts = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="queued", nullable=False, index=True)  # queued, dispatched, blocked, cancelled
    
    task = relationship("CaseTask")
    case = relationship("Case")
    department = relationship("Department")
