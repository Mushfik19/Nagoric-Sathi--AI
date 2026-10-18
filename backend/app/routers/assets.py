from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.geography import Asset

router = APIRouter(prefix="/assets", tags=["Physical Assets"])

@router.get("")
async def list_assets(ward_id: str = None, department_id: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Asset).options(selectinload(Asset.ward), selectinload(Asset.department))
    if ward_id:
        stmt = stmt.where(Asset.ward_id == ward_id)
    if department_id:
        stmt = stmt.where(Asset.department_id == department_id)
    res = await db.execute(stmt)
    assets = res.scalars().all()
    return [
        {
            "id": a.id,
            "asset_code": a.asset_code,
            "name_bn": a.name_bn,
            "name_en": a.name_en,
            "asset_type": a.asset_type,
            "ward_number": a.ward.ward_number if a.ward else None,
            "department_name_bn": a.department.name_bn if a.department else None,
            "latitude": a.latitude,
            "longitude": a.longitude,
            "health_status": a.health_status
        }
        for a in assets
    ]
