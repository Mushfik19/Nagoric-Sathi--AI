from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.audit import AuditLog
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/audit", tags=["Tamper-Evident Audit Trail"])

@router.get("/logs")
async def get_audit_logs(
    resource_type: Optional[str] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    R&D Table 30:
    - Admin: Full audit log view (without personal citizen unmasking)
    - Coordinator: Case-level audit
    - Citizen: Own case history only
    """
    stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)

    if current_user.role == UserRoleEnum.CITIZEN:
        stmt = stmt.where(AuditLog.actor_user_id == current_user.id)
    elif current_user.role not in [UserRoleEnum.ADMIN, UserRoleEnum.COORDINATOR]:
        raise HTTPException(status_code=403, detail="অডিট লগ দেখার অনুমতি নেই।")

    if resource_type:
        stmt = stmt.where(AuditLog.resource_type == resource_type)

    res = await db.execute(stmt)
    logs = res.scalars().all()

    return [
        {
            "id": l.id,
            "actor_user_id": l.actor_user_id,
            "actor_role": l.actor_role,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "before_state": l.before_state,
            "after_state": l.after_state,
            "reason": l.reason,
            "previous_hash": l.previous_hash,
            "current_hash": l.current_hash,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]
