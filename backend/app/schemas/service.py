from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class RAGQueryRequest(BaseModel):
    query_text_bn: str
    ward_id: Optional[str] = None
    category: Optional[str] = None

class RAGCitationResponse(BaseModel):
    document_title_bn: str
    source_agency: str
    applicable_area: str
    last_verified_date: str
    section_title: Optional[str] = None
    snippet_bn: str
    confidence: float

class RAGQueryResponse(BaseModel):
    query_bn: str
    answer_bn: str
    is_verified_source_found: bool
    citations: List[RAGCitationResponse] = []
    disclaimer_bn: str

class ApplicationReadinessRequest(BaseModel):
    service_code: str
    uploaded_document_names: List[str]
    applicant_details: Dict[str, Any]

class ApplicationReadinessResponse(BaseModel):
    service_title_bn: str
    is_ready_to_submit: bool
    mandatory_documents_total: int
    mandatory_documents_uploaded: int
    missing_mandatory_documents: List[str]
    optional_documents_missing: List[str]
    readiness_score_pct: float
    official_portal_url: Optional[str] = None
    guidance_notes_bn: List[str]
