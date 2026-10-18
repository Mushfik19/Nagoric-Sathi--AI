import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum, DateTime
from app.models.base import BaseModel
from app.models.case import PriorityEnum

class SLAStepEnum(str, enum.Enum):
    NORMAL = "normal"
    REMINDER = "reminder"
    ESCALATION_1 = "escalation_1"
    ESCALATION_2 = "escalation_2"
    EMERGENCY_ALERT = "emergency_alert"

class SLAPolicy(BaseModel):
    __tablename__ = "sla_policies"
    
    priority = Column(SQLEnum(PriorityEnum), unique=True, nullable=False, index=True)
    response_target_hours = Column(Integer, nullable=False)   # e.g., Emergency: 2h, High: 12h, Med: 48h, Low: 120h
    resolution_target_hours = Column(Integer, nullable=False) # e.g., Emergency: 6h, High: 24h, Med: 72h, Low: 168h
    reminder_lead_hours = Column(Integer, default=2, nullable=False)
    escalation_1_hours = Column(Integer, nullable=False)
    escalation_2_hours = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class SLAEvent(BaseModel):
    __tablename__ = "sla_events"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # started, paused, resumed, reminder, escalation_1, escalation_2, breached, completed
    step = Column(SQLEnum(SLAStepEnum), default=SLAStepEnum.NORMAL, nullable=False)
    
    timer_started_at = Column(DateTime, nullable=True)
    paused_at = Column(DateTime, nullable=True)
    resumed_at = Column(DateTime, nullable=True)
    pause_reason_bn = Column(String(255), nullable=True)
    
    escalated_to_role = Column(String(50), nullable=True)
    escalated_to_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
