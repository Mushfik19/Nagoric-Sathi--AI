from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.department import Officer
from app.models.user import User, UserRoleEnum
from app.schemas.case import OfficerAvailabilityUpdateRequest
from app.dependencies import get_current_user, require_roles
from app.services.task_assignment_service import TaskAssignmentService

router = APIRouter(prefix="/officers", tags=["Officer Directory & Workload"])

@router.get("")
async def list_officers(db: AsyncSession = Depends(get_db)):
    """
    Module 5 / Section 20: Officer Directory.
    Shows official contact info, ward/department coverage, and validity dates.
    """
    stmt = select(Officer).options(selectinload(Officer.department), selectinload(Officer.ward)).where(Officer.is_active == True)
    res = await db.execute(stmt)
    officers = res.scalars().all()
    return [
        {
            "id": o.id,
            "name_bn": o.name_bn,
            "name_en": o.name_en,
            "designation": o.designation,
            "department_id": o.department_id,
            "department_name_bn": o.department.name_bn if o.department else None,
            "department_code": o.department.code if o.department else None,
            "ward_number": o.ward.ward_number if o.ward else None,
            "ward_name_bn": o.ward.ward_name_bn if o.ward else None,
            "official_phone": o.official_phone,
            "official_email": o.official_email,
            "availability_status": o.availability_status,
            "max_concurrent_tasks": o.max_concurrent_tasks,
            "current_active_tasks": o.current_active_tasks,
            "valid_from": o.valid_from.isoformat() if o.valid_from else None,
            "last_verified_at": o.last_verified_at.isoformat() if o.last_verified_at else None
        }
        for o in officers
    ]

@router.get("/availability")
async def get_officer_availability(
    department_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Retrieves dynamic officer availability and active task counts.
    """
    # If dept officer, default to their department
    if current_user.role == UserRoleEnum.DEPT_OFFICER and not department_id:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            department_id = assigned_dept_ids[0]

    return await TaskAssignmentService.get_officers_workload(
        db=db,
        department_id=department_id
    )

@router.put("/{officer_id}/availability")
async def update_officer_availability(
    officer_id: str,
    req: OfficerAvailabilityUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Updates officer availability state and capacity.
    Trigger reactive queue dispatch if becoming available.
    """
    try:
        return await TaskAssignmentService.update_officer_availability(
            db=db,
            officer_id=officer_id,
            availability_status=req.availability_status,
            max_concurrent_tasks=req.max_concurrent_tasks,
            shift_schedule=req.shift_schedule,
            acting_user=current_user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/workload-summary")
async def get_department_workload_summary(
    department_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Aggregates department workload metrics: total officers, active officers, utilization rates.
    """
    if current_user.role == UserRoleEnum.DEPT_OFFICER and not department_id:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            department_id = assigned_dept_ids[0]

    workload = await TaskAssignmentService.get_officers_workload(db=db, department_id=department_id)
    total_officers = len(workload)
    available_count = sum(1 for o in workload if o["availability_status"] == "available")
    busy_count = sum(1 for o in workload if o["availability_status"] in ["busy", "at_capacity"] or o["is_at_capacity"])
    total_capacity = sum(o["max_concurrent_tasks"] for o in workload)
    total_active_tasks = sum(o["current_active_tasks"] for o in workload)

    avg_utilization = round((total_active_tasks / max(1, total_capacity)) * 100, 1) if total_capacity > 0 else 0

    return {
        "department_id": department_id,
        "total_officers": total_officers,
        "available_officers": available_count,
        "busy_or_at_capacity": busy_count,
        "total_department_capacity": total_capacity,
        "total_active_tasks": total_active_tasks,
        "average_utilization_pct": avg_utilization,
        "officers": workload
    }
