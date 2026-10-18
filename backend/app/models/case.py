import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class CaseStatusEnum(str, enum.Enum):
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    UNDER_INSPECTION = "under_inspection"
    IN_PROGRESS = "in_progress"
    RESOLVED_PROOF_UPLOADED = "resolved_proof_uploaded"
    CLOSED = "closed"
    RE_OPENED = "re_opened"
    MERGED = "merged"

class PriorityEnum(str, enum.Enum):
    EMERGENCY = "emergency"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Case(BaseModel):
    __tablename__ = "cases"
    
    tracking_number = Column(String(50), unique=True, nullable=False, index=True) # e.g. "NS-2026-W05-00124"
    title_bn = Column(String(255), nullable=False)
    description_bn = Column(Text, nullable=False)
    primary_category = Column(String(50), nullable=False, index=True)  # waste, drain, road, street_light
    secondary_categories = Column(JSON, default=list)  # list of other categories if compound problem
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address_text = Column(String(255), nullable=True)
    landmark = Column(String(255), nullable=True)
    is_public_property = Column(Boolean, default=True, nullable=False)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Status & Triage
    status = Column(SQLEnum(CaseStatusEnum), default=CaseStatusEnum.SUBMITTED, nullable=False, index=True)
    priority = Column(SQLEnum(PriorityEnum), default=PriorityEnum.MEDIUM, nullable=False, index=True)
    ai_proposed_priority = Column(SQLEnum(PriorityEnum), nullable=True)
    priority_override_reason = Column(Text, nullable=True)
    is_hazard = Column(Boolean, default=False, nullable=False)
    
    # Responsibility
    lead_department_id = Column(String(36), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=True, index=True)
    lead_officer_id = Column(String(36), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_rule_id = Column(String(36), ForeignKey("responsibility_rules.id", ondelete="SET NULL"), nullable=True)
    responsibility_reason_bn = Column(Text, nullable=True)
    responsibility_confidence = Column(Float, default=0.0, nullable=False)
    requires_staff_verification = Column(Boolean, default=True, nullable=False)
    
    # Complainant Info (Hidden from Public & Field Staff)
    citizen_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    intake_channel = Column(String(30), default="web_pwa", nullable=False)  # web_pwa, voice, ward_desk, sms, helpline_333
    is_anonymous = Column(Boolean, default=False, nullable=False)
    
    # Duplicate Merge Linkage
    merged_into_case_id = Column(String(36), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    is_master_case = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    ward = relationship("Ward", backref="cases")
    asset = relationship("Asset", backref="cases")
    lead_department = relationship("Department", foreign_keys=[lead_department_id])
    lead_officer = relationship("Officer", foreign_keys=[lead_officer_id])
    assigned_rule = relationship("ResponsibilityRule")
    citizen_user = relationship("User", foreign_keys=[citizen_user_id])
    
    reports = relationship("CaseReport", back_populates="case", cascade="all, delete-orphan")
    tasks = relationship("CaseTask", back_populates="case", cascade="all, delete-orphan", order_by="CaseTask.sequence_order")
    status_history = relationship("CaseStatusHistory", back_populates="case", cascade="all, delete-orphan", order_by="CaseStatusHistory.created_at")
    priority_history = relationship("CasePriorityHistory", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("CaseEvidence", back_populates="case", cascade="all, delete-orphan")
    feedback_entries = relationship("CaseFeedback", back_populates="case", cascade="all, delete-orphan")
    objections = relationship("CaseObjection", back_populates="case", cascade="all, delete-orphan")

class CaseReport(BaseModel):
    __tablename__ = "case_reports"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    raw_text_bn = Column(Text, nullable=False)
    normalized_text_bn = Column(Text, nullable=True)
    voice_audio_url = Column(String(255), nullable=True)
    voice_transcript_bn = Column(Text, nullable=True)
    extracted_entities = Column(JSON, default=dict)
    reported_channel = Column(String(50), default="web_pwa", nullable=False)
    
    case = relationship("Case", back_populates="reports")

class TaskStatusEnum(str, enum.Enum):
    PENDING = "pending"
    WAITING_PREREQUISITE = "waiting_prerequisite"
    IN_PROGRESS = "in_progress"
    COMPLETED_AWAITING_REVIEW = "completed_awaiting_review"
    VERIFIED_COMPLETED = "verified_completed"
    REOPENED = "reopened"
    CANCELLED = "cancelled"

class CaseTask(BaseModel):
    __tablename__ = "case_tasks"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_officer_id = Column(String(36), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True)
    title_bn = Column(String(200), nullable=False)
    description_bn = Column(Text, nullable=False)
    sequence_order = Column(Integer, default=1, nullable=False)
    is_lead_task = Column(Boolean, default=False, nullable=False)
    status = Column(SQLEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False, index=True)
    acceptance_status = Column(String(50), default="accepted", nullable=False, index=True)  # pending_acceptance, accepted, rejected
    rejection_reason_bn = Column(Text, nullable=True)
    waiting_reason_bn = Column(String(255), nullable=True)  # visible reason why work is waiting
    sla_hours = Column(Integer, default=48, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    assigned_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    case = relationship("Case", back_populates="tasks")
    department = relationship("Department")
    assigned_officer = relationship("Officer")
    prerequisites = relationship("TaskDependency", foreign_keys="TaskDependency.dependent_task_id", back_populates="dependent_task", cascade="all, delete-orphan")
    evidence = relationship("CaseEvidence", back_populates="task")

class TaskDependency(BaseModel):
    __tablename__ = "task_dependencies"
    
    dependent_task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_task_id = Column(String(36), ForeignKey("case_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    dependency_reason_bn = Column(String(255), nullable=True)
    
    dependent_task = relationship("CaseTask", foreign_keys=[dependent_task_id], back_populates="prerequisites")
    prerequisite_task = relationship("CaseTask", foreign_keys=[prerequisite_task_id])

class CaseStatusHistory(BaseModel):
    __tablename__ = "case_status_history"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(SQLEnum(CaseStatusEnum), nullable=True)
    to_status = Column(SQLEnum(CaseStatusEnum), nullable=False)
    changed_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_role = Column(String(50), nullable=False)
    reason_bn = Column(Text, nullable=True)
    
    case = relationship("Case", back_populates="status_history")

class CasePriorityHistory(BaseModel):
    __tablename__ = "case_priority_history"
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    from_priority = Column(SQLEnum(PriorityEnum), nullable=True)
    to_priority = Column(SQLEnum(PriorityEnum), nullable=False)
    changed_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    
    case = relationship("Case", back_populates="priority_history")
