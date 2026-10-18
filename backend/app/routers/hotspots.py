from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.hotspot_analyzer import HotspotAnalyzerService

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])

@router.get("/zones")
async def get_hotspot_zones(db: AsyncSession = Depends(get_db)):
    """
    Module 6 / Section 17: Hotspots and Repeat-Issue Analysis.
    Returns detected repeat problem zones with AI advisory review notes and alternative engineering solutions.
    """
    hotspots = await HotspotAnalyzerService.evaluate_hotspots(db)
    return hotspots
