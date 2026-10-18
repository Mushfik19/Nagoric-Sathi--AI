from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.evidence import EvidenceTypeEnum

class EvidenceUploadRequest(BaseModel):
    case_id: str
    task_id: Optional[str] = None
    evidence_type: EvidenceTypeEnum
    media_url: str
    media_format: str = "image/jpeg"
    file_size_bytes: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    staff_notes: Optional[str] = None

class FeedbackSubmitRequest(BaseModel):
    case_id: str
    is_satisfied: bool # True: "Solved" (সমাধান হয়েছে), False: "Not Solved" (সমাধান হয়নি)
    rating_stars: int = 5
    comments_bn: Optional[str] = None

class ObjectionSubmitRequest(BaseModel):
    case_id: str
    reopened_task_id: Optional[str] = None
    objection_reason_bn: str
    attached_evidence_url: Optional[str] = None

class ObjectionReviewRequest(BaseModel):
    objection_id: str
    decision: str # "accept" (reopen task) or "reject" (maintain closure with explanation)
    decision_notes: str
