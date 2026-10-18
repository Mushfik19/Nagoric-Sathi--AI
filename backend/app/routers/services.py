from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.service import ServiceCatalog
from app.schemas.service import ApplicationReadinessRequest, ApplicationReadinessResponse

router = APIRouter(prefix="/services", tags=["Service Catalog & Readiness"])

@router.get("")
async def list_services(category: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(ServiceCatalog).where(ServiceCatalog.is_active == True)
    if category:
        stmt = stmt.where(ServiceCatalog.category == category)
    res = await db.execute(stmt)
    services = res.scalars().all()
    
    return [
        {
            "service_code": s.service_code,
            "title_bn": s.title_bn,
            "title_en": s.title_en,
            "category": s.category,
            "description_bn": s.description_bn,
            "fee_amount": s.fee_amount,
            "sla_hours": s.sla_hours,
            "official_portal_url": s.official_portal_url,
            "required_documents": s.required_documents
        }
        for s in services
    ]

@router.post("/readiness-check", response_model=ApplicationReadinessResponse)
async def check_application_readiness(req: ApplicationReadinessRequest, db: AsyncSession = Depends(get_db)):
    """
    Module 2: Application Readiness Check.
    Validates mandatory vs optional documents before submission to official government portal.
    """
    stmt = select(ServiceCatalog).where(ServiceCatalog.service_code == req.service_code)
    res = await db.execute(stmt)
    service = res.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="সেবা পাওয়া যায়নি।")

    req_docs = service.required_documents or []
    mandatory_docs = [d["name_bn"] for d in req_docs if d.get("is_mandatory", True)]
    
    uploaded_set = set(req.uploaded_document_names)
    missing_mandatory = [doc for doc in mandatory_docs if doc not in uploaded_set]
    
    total_mandatory = len(mandatory_docs)
    uploaded_mandatory = total_mandatory - len(missing_mandatory)
    
    readiness_pct = (uploaded_mandatory / max(1, total_mandatory)) * 100.0
    is_ready = len(missing_mandatory) == 0

    guidance = []
    if is_ready:
        guidance.append("আপনার আবেদনপত্রটি দাখিলের জন্য সম্পূর্ণ প্রস্তুত।")
    else:
        guidance.append(f"আবেদন দাখিলের পূর্বে অবশিষ্টাংশ {len(missing_mandatory)}টি বাধ্যতামূলক প্রমাণপত্র সংযুক্ত করুন।")

    return ApplicationReadinessResponse(
        service_title_bn=service.title_bn,
        is_ready_to_submit=is_ready,
        mandatory_documents_total=total_mandatory,
        mandatory_documents_uploaded=uploaded_mandatory,
        missing_mandatory_documents=missing_mandatory,
        optional_documents_missing=[],
        readiness_score_pct=round(readiness_pct, 1),
        official_portal_url=service.official_portal_url,
        guidance_notes_bn=guidance
    )
