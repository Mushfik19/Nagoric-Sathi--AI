import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class AIJobStatusEnum(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    FALLBACK_MANUAL = "fallback_manual"

class AIJob(BaseModel):
    __tablename__ = "ai_jobs"
    
    job_type = Column(String(50), nullable=False, index=True)  # intake_analysis, asr_transcribe, duplicate_check, hotspot_analysis
    status = Column(SQLEnum(AIJobStatusEnum), default=AIJobStatusEnum.QUEUED, nullable=False, index=True)
    input_payload = Column(JSON, nullable=False)
    result_payload = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    provider_name = Column(String(50), default="bangla_baseline_v1", nullable=False)
    model_version = Column(String(50), default="1.0.0", nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True, index=True)
    predictions = relationship("AIPrediction", back_populates="job", cascade="all, delete-orphan")

class AIPrediction(BaseModel):
    __tablename__ = "ai_predictions"
    
    job_id = Column(String(36), ForeignKey("ai_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    task_name = Column(String(50), nullable=False) # category_classification, priority_triage, responsibility_routing
    predicted_label = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False) # 0.0 to 1.0
    passed_confidence_gate = Column(Boolean, default=False, nullable=False)
    explanation_bn = Column(Text, nullable=True)
    feature_contributions = Column(JSON, default=dict)
    
    job = relationship("AIJob", back_populates="predictions")
