from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.service import ServiceCatalog, ServiceDocument
from app.services.rag_service import RAGService
from app.schemas.service import RAGQueryRequest, RAGQueryResponse, ApplicationReadinessRequest, ApplicationReadinessResponse

router = APIRouter(prefix="/knowledge", tags=["Knowledge & RAG"])

@router.post("/query", response_model=RAGQueryResponse)
async def query_service_guidance_rag(req: RAGQueryRequest, db: AsyncSession = Depends(get_db)):
    """
    Module 2 / Section 18: Verified-Source Service Guidance (RAG).
    Returns strictly grounded answers with source citations, applicable areas, and update dates.
    """
    res = await RAGService.query_knowledge(db, req.query_text_bn)
    return res

@router.get("/documents")
async def list_verified_documents(db: AsyncSession = Depends(get_db)):
    stmt = select(ServiceDocument).where(ServiceDocument.is_active == True)
    res = await db.execute(stmt)
    docs = res.scalars().all()
    return [
        {
            "id": d.id,
            "title_bn": d.document_title_bn,
            "title_en": d.document_title_en,
            "source_agency": d.source_agency,
            "applicable_area": d.applicable_area,
            "version": d.version,
            "last_verified_date": d.last_verified_date.strftime("%d-%m-%Y")
        }
        for d in docs
    ]
