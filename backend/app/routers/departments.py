from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.department import Department, Officer

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("")
async def list_departments(db: AsyncSession = Depends(get_db)):
    stmt = select(Department).where(Department.is_active == True)
    res = await db.execute(stmt)
    depts = res.scalars().all()
    return [
        {
            "id": d.id,
            "code": d.code,
            "name_bn": d.name_bn,
            "name_en": d.name_en,
            "description": d.description,
            "head_officer_name": d.head_officer_name,
            "hotline_number": d.hotline_number,
            "official_email": d.official_email
        }
        for d in depts
    ]
