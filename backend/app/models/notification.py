import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, JSON, DateTime
from app.models.base import BaseModel

class Consent(BaseModel):
    __tablename__ = "consents"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    purpose = Column(String(100), nullable=False) # e.g. "sms_updates", "location_pinning", "push_notifications"
    is_granted = Column(Boolean, default=True, nullable=False)
    granted_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True, index=True)
    title_bn = Column(String(200), nullable=False)
    message_bn = Column(Text, nullable=False)
    channel = Column(String(50), default="in_app", nullable=False) # in_app, web_push, sms_mock, email
    is_read = Column(Boolean, default=False, nullable=False)
    metadata_json = Column(JSON, default=dict)

class SMSMockLog(BaseModel):
    __tablename__ = "sms_mock_logs"
    
    recipient_phone = Column(String(32), nullable=False, index=True)
    message_text_bn = Column(Text, nullable=False)
    case_tracking_number = Column(String(50), nullable=True)
    is_simulated = Column(Boolean, default=True, nullable=False)
    gateway_response = Column(String(100), default="SIMULATED_SUCCESS_200", nullable=False)
