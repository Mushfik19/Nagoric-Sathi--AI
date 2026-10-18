import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Department(BaseModel):
    __tablename__ = "departments"
    
    code = Column(String(50), unique=True, nullable=False, index=True)  # waste, drain, road, electrical
    name_bn = Column(String(150), nullable=False)
    name_en = Column(String(150), nullable=False)
    description = Column(String(255), nullable=True)
    head_officer_name = Column(String(150), nullable=True)
    hotline_number = Column(String(50), nullable=True)
    official_email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    officers = relationship("Officer", back_populates="department")
    assets = relationship("Asset", back_populates="department")
    responsibility_rules = relationship("ResponsibilityRule", back_populates="department")

class Officer(BaseModel):
    __tablename__ = "officers"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name_bn = Column(String(150), nullable=False)
    name_en = Column(String(150), nullable=False)
    designation = Column(String(150), nullable=False)  # e.g., "সহকারী প্রকৌশলী (ড্রেনেজ)"
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True, index=True)
    zone_code = Column(String(50), nullable=True)
    official_phone = Column(String(50), nullable=False)
    official_email = Column(String(255), nullable=False)
    backup_officer_id = Column(String(36), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    availability_status = Column(String(50), default="available", nullable=False)  # available, busy, on_leave, offline, inactive
    max_concurrent_tasks = Column(Integer, default=4, nullable=False)
    current_active_tasks = Column(Integer, default=0, nullable=False)
    skills = Column(JSON, default=list, nullable=True)
    shift_schedule = Column(JSON, default=dict, nullable=True)
    valid_from = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    valid_until = Column(DateTime, nullable=True)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    department = relationship("Department", back_populates="officers")
    ward = relationship("Ward", back_populates="officers")
