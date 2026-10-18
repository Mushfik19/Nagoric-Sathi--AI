from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRoleEnum, UserScope
from app.models.system import SystemConfig, ApprovalRequest, ApprovalStatusEnum
from app.models.service import ResponsibilityRule, ServiceCatalog
from app.models.sla import SLAPolicy
from app.models.ai import AIJob
from app.dependencies import require_roles, get_current_user
from app.core.audit import AuditLogger
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin Console & Governance"])

class GateChangeRequest(BaseModel):
    new_threshold: float
    reason: str

class DualApprovalActionRequest(BaseModel):
    approval_request_id: str
    decision: str  # "approve" or "reject"
    decision_notes: str

class UserCreateOrUpdateRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: UserRoleEnum
    is_active: bool = True
    assigned_ward_ids: List[str] = []
    assigned_department_ids: List[str] = []

@router.get("/gate-config")
async def get_routing_gate_config(db: AsyncSession = Depends(get_db)):
    stmt = select(SystemConfig).where(SystemConfig.config_key == "routing_confidence_gate")
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()
    threshold = cfg.config_value_json.get("threshold", 0.80) if cfg else 0.80
    
    # Check for pending dual-approval requests
    stmt_req = select(ApprovalRequest).where(ApprovalRequest.status == "pending")
    res_req = await db.execute(stmt_req)
    pending = res_req.scalars().all()
    
    return {
        "current_threshold": threshold,
        "initial_design_value": 0.80,
        "pending_approval_requests": [
            {
                "id": p.id,
                "request_type": p.request_type,
                "proposed_payload": p.proposed_payload,
                "reason": p.reason,
                "created_at": p.created_at.isoformat()
            }
            for p in pending
        ]
    }

@router.post("/gate-config/update")
async def update_routing_gate(
    req: GateChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))
):
    """
    R&D Section 10.11 / Table 33 (S7):
    - Admin can RAISE the gate directly (e.g. 0.80 -> 0.85).
    - LOWERING the gate (e.g. 0.80 -> 0.70) requires DUAL APPROVAL + re-validation audit!
    """
    stmt = select(SystemConfig).where(SystemConfig.config_key == "routing_confidence_gate")
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()
    current_val = cfg.config_value_json.get("threshold", 0.80) if cfg else 0.80

    if req.new_threshold < current_val:
        # Require Dual Approval workflow
        app_req = ApprovalRequest(
            request_type="LOWER_CONFIDENCE_GATE",
            proposed_payload={"threshold": req.new_threshold, "previous_threshold": current_val},
            reason=req.reason,
            initiator_user_id=current_user.id,
            status="pending"
        )
        db.add(app_req)
        await db.commit()
        return {
            "status": "pending_dual_approval",
            "message_bn": f"সেফটি গেট হ্রাস করার আবেদন ({int(req.new_threshold*100)}%) দ্বৈত অনুমোদনের জন্য অপেক্ষমাণ।"
        }
    else:
        # Directly raise gate
        if not cfg:
            cfg = SystemConfig(
                config_key="routing_confidence_gate",
                config_value_json={"threshold": req.new_threshold},
                description="AI Responsibility Routing Confidence Gate",
                updated_by_user_id=current_user.id
            )
            db.add(cfg)
        else:
            cfg.config_value_json = {"threshold": req.new_threshold}
            cfg.updated_by_user_id = current_user.id

        await AuditLogger.log_event(
            db=db,
            actor_user_id=current_user.id,
            actor_role="admin",
            action="RAISE_CONFIDENCE_GATE",
            resource_type="SYSTEM_CONFIG",
            resource_id="routing_confidence_gate",
            before_state={"threshold": current_val},
            after_state={"threshold": req.new_threshold},
            reason=req.reason
        )
        await db.commit()
        return {
            "status": "updated",
            "current_threshold": req.new_threshold,
            "message_bn": f"সেফটি গেট সফলভাবে বৃদ্ধি করে {int(req.new_threshold*100)}% নির্ধারণ করা হয়েছে।"
        }

@router.post("/dual-approval/decide")
async def decide_dual_approval(
    req: DualApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))
):
    stmt = select(ApprovalRequest).where(ApprovalRequest.id == req.approval_request_id)
    res = await db.execute(stmt)
    app_req = res.scalar_one_or_none()
    if not app_req or app_req.status != "pending":
        raise HTTPException(status_code=404, detail="অনুমোদনের আবেদন পাওয়া যায়নি বা ইতিমধ্যে নিষ্পত্তিকৃত।")

    if app_req.initiator_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="উদ্যোক্তা নিজে দ্বিতীয় অনুমোদনকারী হতে পারবেন না (স্বতন্ত্র দ্বৈত অনুমোদন বাধ্যতামূলক)।")

    app_req.status = "approved" if req.decision == "approve" else "rejected"
    app_req.second_approver_user_id = current_user.id
    app_req.decision_notes = req.decision_notes

    if req.decision == "approve" and app_req.request_type == "LOWER_CONFIDENCE_GATE":
        new_th = app_req.proposed_payload.get("threshold")
        stmt_cfg = select(SystemConfig).where(SystemConfig.config_key == "routing_confidence_gate")
        res_cfg = await db.execute(stmt_cfg)
        cfg = res_cfg.scalar_one_or_none()
        if cfg:
            cfg.config_value_json = {"threshold": new_th}
            cfg.updated_by_user_id = current_user.id

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role="admin",
        action="DECIDE_DUAL_APPROVAL",
        resource_type="APPROVAL_REQUEST",
        resource_id=app_req.id,
        after_state={"status": app_req.status, "decision_notes": req.decision_notes}
    )
    await db.commit()
    return {"message_bn": f"দ্বৈত অনুমোদন সফলভাবে সম্পন্ন: {app_req.status}"}

@router.get("/users")
async def list_all_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))):
    stmt = select(User).order_by(User.created_at)
    res = await db.execute(stmt)
    users = res.scalars().all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "phone": u.phone,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]

@router.get("/ai-jobs")
async def list_ai_jobs(limit: int = 50, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))):
    stmt = select(AIJob).order_by(AIJob.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    jobs = res.scalars().all()
    return [
        {
            "id": j.id,
            "job_type": j.job_type,
            "status": j.status.value,
            "provider_name": j.provider_name,
            "model_version": j.model_version,
            "latency_ms": j.latency_ms,
            "created_at": j.created_at.isoformat()
        }
        for j in jobs
    ]

class SLAPolicyUpdateRequest(BaseModel):
    response_target_hours: int
    resolution_target_hours: int
    reminder_lead_hours: int = 2
    escalation_1_hours: int
    escalation_2_hours: int

@router.get("/sla-policies")
async def list_sla_policies(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))):
    stmt = select(SLAPolicy).order_by(SLAPolicy.priority)
    res = await db.execute(stmt)
    policies = res.scalars().all()
    return [
        {
            "id": p.id,
            "priority": p.priority.value,
            "response_target_hours": p.response_target_hours,
            "resolution_target_hours": p.resolution_target_hours,
            "reminder_lead_hours": p.reminder_lead_hours,
            "escalation_1_hours": p.escalation_1_hours,
            "escalation_2_hours": p.escalation_2_hours,
            "is_active": p.is_active
        }
        for p in policies
    ]

@router.put("/sla-policies/{priority}")
async def update_sla_policy(
    priority: str,
    req: SLAPolicyUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN]))
):
    stmt = select(SLAPolicy).where(SLAPolicy.priority == priority)
    res = await db.execute(stmt)
    policy = res.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="SLA Policy not found for priority")
    
    before_state = {
        "response_target_hours": policy.response_target_hours,
        "resolution_target_hours": policy.resolution_target_hours
    }
    policy.response_target_hours = req.response_target_hours
    policy.resolution_target_hours = req.resolution_target_hours
    policy.reminder_lead_hours = req.reminder_lead_hours
    policy.escalation_1_hours = req.escalation_1_hours
    policy.escalation_2_hours = req.escalation_2_hours

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role="admin",
        action="UPDATE_SLA_POLICY",
        resource_type="SLA_POLICY",
        resource_id=policy.id,
        before_state=before_state,
        after_state={
            "priority": priority,
            "response_target_hours": req.response_target_hours,
            "resolution_target_hours": req.resolution_target_hours
        }
    )
    await db.commit()
    await db.refresh(policy)
    return {"message_bn": f"{priority} অগ্রাধিকারের এসএলএ সফলভাবে হালনাগাদ করা হয়েছে", "policy_id": policy.id}
