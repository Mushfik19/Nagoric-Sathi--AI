from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import datetime
from app.models.case import CaseStatusEnum, PriorityEnum, TaskStatusEnum

class IntakeRequest(BaseModel):
    raw_text_bn: str = Field(..., description="Bangla statement describing problem")
    latitude: float
    longitude: float
    address_text: Optional[str] = None
    landmark: Optional[str] = None
    is_public_property: bool = True
    ward_id: Optional[str] = None
    asset_id: Optional[str] = None
    voice_audio_url: Optional[str] = None
    photo_urls: List[str] = []
    video_urls: List[str] = []
    intake_channel: str = "web_pwa" # web_pwa, voice, ward_desk, sms, helpline_333

class CaseConfirmationRequest(BaseModel):
    case_id: str
    confirmed_primary_category: str
    confirmed_latitude: float
    confirmed_longitude: float
    confirmed_address: Optional[str] = None
    confirmed_landmark: Optional[str] = None
    citizen_notes: Optional[str] = None

class TaskCreateRequest(BaseModel):
    department_id: str
    title_bn: str
    description_bn: str
    sequence_order: int = 1
    is_lead_task: bool = False
    sla_hours: int = 48
    prerequisite_task_ids: List[str] = []

class TaskStatusUpdateRequest(BaseModel):
    status: TaskStatusEnum
    waiting_reason_bn: Optional[str] = None
    evidence_url: Optional[str] = None
    notes: Optional[str] = None

class SequenceApprovalRequest(BaseModel):
    case_id: str
    approval_notes: Optional[str] = None
    approved_tasks: List[TaskCreateRequest]

class PriorityOverrideRequest(BaseModel):
    priority: PriorityEnum
    reason: str

class ResponsibilityOverrideRequest(BaseModel):
    department_id: str
    officer_id: Optional[str] = None
    reason: str

class TaskRejectRequest(BaseModel):
    reason_bn: str = Field(..., description="দাপ্তরিক প্রত্যাখ্যানের স্পষ্ট কারণ")

class TaskAssignRequest(BaseModel):
    officer_id: str
    assignment_type: str = "manual"  # manual, recommended, auto_dispatch, reassignment
    reason_bn: Optional[str] = None

class OfficerAvailabilityUpdateRequest(BaseModel):
    availability_status: str = Field(..., description="available, busy, on_leave, offline, inactive")
    max_concurrent_tasks: Optional[int] = None
    shift_schedule: Optional[Dict[str, Any]] = None


class CaseResponse(BaseModel):
    id: str
    tracking_number: str
    title_bn: str
    description_bn: str
    primary_category: str
    secondary_categories: List[str] = []
    latitude: float
    longitude: float
    address_text: Optional[str] = None
    landmark: Optional[str] = None
    is_public_property: bool
    ward_id: str
    ward_name_bn: Optional[str] = None
    ward_number: Optional[int] = None
    asset_id: Optional[str] = None
    asset_code: Optional[str] = None
    asset_name_bn: Optional[str] = None
    
    status: CaseStatusEnum
    priority: PriorityEnum
    ai_proposed_priority: Optional[PriorityEnum] = None
    is_hazard: bool
    
    lead_department_id: Optional[str] = None
    lead_department_name_bn: Optional[str] = None
    lead_officer_id: Optional[str] = None
    lead_officer_name_bn: Optional[str] = None
    lead_officer_designation: Optional[str] = None
    lead_officer_phone: Optional[str] = None
    lead_officer_email: Optional[str] = None
    
    responsibility_reason_bn: Optional[str] = None
    responsibility_confidence: float
    requires_staff_verification: bool
    
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    tasks: List[Dict[str, Any]] = []
    evidence_items: List[Dict[str, Any]] = []
    status_history: List[Dict[str, Any]] = []
    feedback_entries: List[Dict[str, Any]] = []
    objections: List[Dict[str, Any]] = []
    
    model_config = ConfigDict(from_attributes=True)
