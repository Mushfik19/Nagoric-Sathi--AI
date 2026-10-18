import datetime
from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, DateTime
from app.models.base import BaseModel

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    actor_user_id = Column(String(36), nullable=True, index=True)
    actor_role = Column(String(50), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True) # e.g. "CASE_CREATE", "VERIFY_RESPONSIBILITY", "OVERRIDE_PRIORITY", "APPROVE_GATE_CHANGE", "VIEW_CASE_SENSITIVE"
    resource_type = Column(String(50), nullable=False, index=True)
    resource_id = Column(String(36), nullable=True, index=True)
    
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    # Tamper-Evident SHA-256 Hash Chaining
    previous_hash = Column(String(64), nullable=True)
    current_hash = Column(String(64), nullable=False, unique=True)
