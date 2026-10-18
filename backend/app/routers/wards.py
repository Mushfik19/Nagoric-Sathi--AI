from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.geography import Ward

router = APIRouter(prefix="/wards", tags=["Wards & Geography"])

@router.get("")
async def list_wards(db: AsyncSession = Depends(get_db)):
    stmt = select(Ward).order_by(Ward.ward_number)
    res = await db.execute(stmt)
    wards = res.scalars().all()
    return [
        {
            "id": w.id,
            "ward_number": w.ward_number,
            "ward_name_bn": w.ward_name_bn,
            "ward_name_en": w.ward_name_en,
            "zone_code": w.zone_code,
            "councillor_name": w.councillor_name,
            "ward_office_address": w.ward_office_address,
            "contact_phone": w.contact_phone,
            "center_latitude": w.center_latitude,
            "center_longitude": w.center_longitude,
            "boundary_geojson": w.boundary_geojson
        }
        for w in wards
    ]
