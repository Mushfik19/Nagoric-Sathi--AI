import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ServiceCatalog(BaseModel):
    __tablename__ = "service_catalog"
    
    service_code = Column(String(50), unique=True, nullable=False, index=True)
    title_bn = Column(String(200), nullable=False)
    title_en = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # waste, drain, road, street_light, certificate, license
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    description_bn = Column(Text, nullable=False)
    description_en = Column(Text, nullable=True)
    official_portal_url = Column(String(255), nullable=True)
    fee_amount = Column(Float, default=0.0, nullable=False)
    sla_hours = Column(Integer, default=72, nullable=False)
    required_documents = Column(JSON, default=list)  # list of {"name_bn": "...", "is_mandatory": true}
    is_active = Column(Boolean, default=True, nullable=False)

class ServiceDocument(BaseModel):
    __tablename__ = "service_documents"
    
    document_title_bn = Column(String(255), nullable=False)
    document_title_en = Column(String(255), nullable=False)
    source_agency = Column(String(150), nullable=False)  # e.g., "Chattogram City Corporation Citizen Charter"
    applicable_area = Column(String(150), default="All Wards", nullable=False)
    document_type = Column(String(50), default="citizen_charter", nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_verified_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    file_url = Column(String(255), nullable=True)
    
    chunks = relationship("ServiceDocumentChunk", back_populates="document", cascade="all, delete-orphan")

class ServiceDocumentChunk(BaseModel):
    __tablename__ = "service_document_chunks"
    
    document_id = Column(String(36), ForeignKey("service_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content_bn = Column(Text, nullable=False)
    content_en = Column(Text, nullable=True)
    section_title = Column(String(200), nullable=True)
    keywords = Column(JSON, default=list)
    embedding_vector = Column(JSON, nullable=True)  # List of floats for cosine similarity calculation
    
    document = relationship("ServiceDocument", back_populates="chunks")

class ResponsibilityRule(BaseModel):
    __tablename__ = "responsibility_rules"
    
    rule_code = Column(String(50), unique=True, nullable=False, index=True)
    name_bn = Column(String(200), nullable=False)
    problem_category = Column(String(50), nullable=False, index=True)  # waste, drain, road, street_light
    target_asset_type = Column(String(50), nullable=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    priority_level_default = Column(String(20), default="medium", nullable=False)
    lead_rule_description_bn = Column(Text, nullable=False)
    supporting_departments = Column(JSON, default=list)  # list of department codes
    default_task_sequence = Column(JSON, default=list)    # ordered task templates
    is_active = Column(Boolean, default=True, nullable=False)
    
    department = relationship("Department", back_populates="responsibility_rules")
