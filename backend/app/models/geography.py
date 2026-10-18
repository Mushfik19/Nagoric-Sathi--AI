import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Ward(BaseModel):
    __tablename__ = "wards"
    
    ward_number = Column(Integer, unique=True, nullable=False, index=True)
    ward_name_bn = Column(String(100), nullable=False)
    ward_name_en = Column(String(100), nullable=False)
    zone_code = Column(String(50), nullable=False, index=True)
    city_corporation = Column(String(100), default="Chattogram City Corporation", nullable=False)
    councillor_name = Column(String(150), nullable=True)
    ward_office_address = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    boundary_geojson = Column(JSON, nullable=True)  # GeoJSON polygon for spatial boundary checks
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    
    assets = relationship("Asset", back_populates="ward")
    officers = relationship("Officer", back_populates="ward")

class AssetTypeEnum(str, enum.Enum):
    DRAIN = "drain"
    ROAD = "road"
    STREET_LIGHT = "street_light"
    WASTE_BIN = "waste_bin"
    MANHOLE = "manhole"
    CULVERT = "culvert"

class Asset(BaseModel):
    __tablename__ = "assets"
    
    asset_code = Column(String(50), unique=True, nullable=False, index=True)
    name_bn = Column(String(150), nullable=False)
    name_en = Column(String(150), nullable=False)
    asset_type = Column(String(50), nullable=False, index=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_description = Column(String(255), nullable=True)
    geometry_geojson = Column(JSON, nullable=True)  # GeoJSON Point, LineString, etc.
    last_inspected_at = Column(DateTime, nullable=True)
    health_status = Column(String(50), default="operational", nullable=False)
    
    ward = relationship("Ward", back_populates="assets")
    department = relationship("Department", back_populates="assets")
