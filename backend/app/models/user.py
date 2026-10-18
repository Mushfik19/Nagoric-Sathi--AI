import datetime
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class UserRoleEnum(str, enum.Enum):
    CITIZEN = "citizen"
    WARD_DESK = "ward_desk"
    DEPT_OFFICER = "dept_officer"
    COORDINATOR = "coordinator"
    ADMIN = "admin"

class User(BaseModel):
    __tablename__ = "users"
    
    phone = Column(String(32), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRoleEnum), default=UserRoleEnum.CITIZEN, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    preferred_language = Column(String(10), default="bn", nullable=False)
    accessibility_mode = Column(JSON, default=lambda: {"large_text": False, "high_contrast": False, "read_aloud": False})
    
    # Scopes
    scopes = relationship("UserScope", back_populates="user", cascade="all, delete-orphan")
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserScope(BaseModel):
    __tablename__ = "user_scopes"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    jurisdiction_zone = Column(String(100), nullable=True)
    
    user = relationship("User", back_populates="scopes")

class CitizenProfile(BaseModel):
    __tablename__ = "citizen_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    nid_number_hash = Column(String(64), nullable=True)
    address_line = Column(String(255), nullable=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)
    
    user = relationship("User", back_populates="citizen_profile")

class StaffProfile(BaseModel):
    __tablename__ = "staff_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String(150), nullable=False)
    official_phone = Column(String(50), nullable=False)
    official_email = Column(String(255), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)
    zone_code = Column(String(50), nullable=True)
    
    user = relationship("User", back_populates="staff_profile")
