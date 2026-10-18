from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.case import PriorityEnum

class AIIntakeAnalysisRequest(BaseModel):
    raw_text_bn: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    voice_audio_url: Optional[str] = None
    photo_urls: List[str] = []

class AIIntakeAnalysisResponse(BaseModel):
    job_id: str
    normalized_text_bn: str
    detected_categories: List[str]
    primary_category: str
    secondary_categories: List[str]
    proposed_priority: PriorityEnum
    is_hazard: bool
    hazard_reasons: List[str]
    
    extracted_entities: Dict[str, Any]  # duration, landmark, road_name, property_type
    
    recommended_department_code: str
    recommended_department_name_bn: str
    responsibility_rule_code: Optional[str] = None
    responsibility_reason_bn: str
    
    nearest_asset_id: Optional[str] = None
    nearest_asset_code: Optional[str] = None
    nearest_asset_name_bn: Optional[str] = None
    
    matched_ward_number: Optional[int] = None
    matched_ward_name_bn: Optional[str] = None
    
    assigned_officer_name_bn: Optional[str] = None
    assigned_officer_designation: Optional[str] = None
    assigned_officer_phone: Optional[str] = None
    
    confidence_score: float # 0.0 to 1.0
    passed_confidence_gate: bool
    requires_staff_verification: bool
    latency_ms: int
