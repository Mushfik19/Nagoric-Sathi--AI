import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class EvidenceTypeEnum(str, enum.Enum):
    BEFORE = "before"
    DURING = "during"
    AFTER = "after"

class CaseEvidence(BaseModel):
    __tablename__ = "case_evidence"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    uploaded_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploader_role = Column(String(50), nullable=False) # citizen, dept_officer, ward_desk, coordinator
    
    evidence_type = Column(SQLEnum(EvidenceTypeEnum), nullable=False, index=True)
    media_url = Column(String(255), nullable=False)
    thumbnail_url = Column(String(255), nullable=True)
    media_format = Column(String(50), default="image/jpeg", nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # Redaction / Privacy Protection
    is_masked = Column(Boolean, default=False, nullable=False)
    masked_regions = Column(JSON, default=list) # face, license_plate, house_no coordinates
    
    # Review
    is_verified_by_staff = Column(Boolean, default=False, nullable=False)
    verified_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    staff_notes = Column(Text, nullable=True)
    
    case = relationship("Case", back_populates="evidence_items")
    task = relationship("CaseTask", back_populates="evidence")

class CaseFeedback(BaseModel):
    __tablename__ = "case_feedback"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_satisfied = Column(Boolean, nullable=False) # True = "Solved", False = "Not Solved"
    rating_stars = Column(Integer, default=5, nullable=True)
    comments_bn = Column(Text, nullable=True)
    
    case = relationship("Case", back_populates="feedback_entries")

class CaseObjection(BaseModel):
    __tablename__ = "case_objections"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reopened_task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="SET NULL"), nullable=True)
    objection_reason_bn = Column(Text, nullable=False)
    attached_evidence_url = Column(String(255), nullable=True)
    review_status = Column(String(50), default="pending_review", nullable=False) # pending_review, accepted, rejected
    reviewer_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_decision_notes = Column(Text, nullable=True)
    
    case = relationship("Case", back_populates="objections")
