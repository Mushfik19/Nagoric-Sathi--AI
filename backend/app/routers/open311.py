from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.case import Case, CaseStatusEnum
from app.models.service import ServiceCatalog

router = APIRouter(prefix="/open311/v2", tags=["Open311 GeoReport v2 API"])

@router.get("/services.json")
async def open311_get_services(db: AsyncSession = Depends(get_db)):
    """Open311 Service Discovery Endpoint."""
    stmt = select(ServiceCatalog).where(ServiceCatalog.is_active == True)
    res = await db.execute(stmt)
    services = res.scalars().all()
    
    return [
        {
            "service_code": s.service_code,
            "service_name": s.title_en,
            "description": s.title_bn,
            "metadata": True,
            "type": "realtime",
            "group": s.category
        }
        for s in services
    ]

@router.get("/requests.json")
async def open311_get_requests(
    service_code: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db)
):
    """Open311 Service Requests Endpoint."""
    stmt = select(Case).where(Case.status != CaseStatusEnum.MERGED)
    if service_code:
        stmt = stmt.where(Case.primary_category == service_code)
    if status_filter == "open":
        stmt = stmt.where(Case.status != CaseStatusEnum.CLOSED)
    elif status_filter == "closed":
        stmt = stmt.where(Case.status == CaseStatusEnum.CLOSED)

    res = await db.execute(stmt)
    cases = res.scalars().all()

    return [
        {
            "service_request_id": c.tracking_number,
            "status": "closed" if c.status == CaseStatusEnum.CLOSED else "open",
            "status_notes": c.status.value,
            "service_name": c.primary_category,
            "service_code": c.primary_category,
            "description": c.description_bn,
            "lat": c.latitude,
            "long": c.longitude,
            "address": c.address_text,
            "requested_datetime": c.created_at.isoformat(),
            "updated_datetime": c.updated_at.isoformat()
        }
        for c in cases
    ]
