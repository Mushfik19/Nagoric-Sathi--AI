import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class DuplicateCandidate(BaseModel):
    __tablename__ = "duplicate_candidates"
    
    source_case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    target_case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)  # 0.0 to 1.0
    distance_meters = Column(Float, nullable=False)
    time_difference_hours = Column(Float, nullable=False)
    matching_category = Column(String(50), nullable=False)
    is_confirmed_by_staff = Column(Boolean, default=False, nullable=False)
    is_rejected_by_staff = Column(Boolean, default=False, nullable=False)
    reviewed_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes = Column(Text, nullable=True)

class DuplicateLink(BaseModel):
    __tablename__ = "duplicate_links"
    
    master_case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    linked_case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    linked_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False) # Supports reversible unmerging!
    unlinked_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    unlinked_reason = Column(Text, nullable=True)

class Hotspot(BaseModel):
    __tablename__ = "hotspots"
    
    zone_code = Column(String(50), nullable=False, index=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(50), nullable=False, index=True)
    
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    radius_meters = Column(Float, default=200.0, nullable=False)
    incident_count_last_90_days = Column(Integer, default=0, nullable=False)
    
    severity_level = Column(String(20), default="high", nullable=False) # moderate, high, chronic
    advisory_review_note_bn = Column(Text, nullable=False) # AI-generated engineering review note
    suggested_alternative_solutions = Column(JSON, default=list) # e.g. ["Increase pipe diameter from 12in to 24in", "Bi-weekly desilting schedule"]
    
    is_reviewed_by_engineer = Column(Boolean, default=False, nullable=False)
    engineer_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    engineer_feedback = Column(Text, nullable=True)
