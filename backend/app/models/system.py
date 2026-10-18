import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from app.models.base import BaseModel

class SystemConfig(BaseModel):
    __tablename__ = "system_config"
    
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value_json = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)
    updated_by_user_id = Column(String(36), nullable=True)

class ApprovalStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ApprovalRequest(BaseModel):
    __tablename__ = "approval_requests"
    
    request_type = Column(String(50), nullable=False) # e.g. "LOWER_CONFIDENCE_GATE", "CHANGE_ROUTING_RULE"
    proposed_payload = Column(JSON, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    
    initiator_user_id = Column(String(36), nullable=False)
    second_approver_user_id = Column(String(36), nullable=True)
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)
