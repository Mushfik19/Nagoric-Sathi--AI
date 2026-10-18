import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.case import (
    Case, CaseReport, CaseTask, CaseStatusHistory, CasePriorityHistory,
    CaseStatusEnum, PriorityEnum, TaskStatusEnum
)
from app.models.evidence import CaseEvidence, EvidenceTypeEnum
from app.models.geography import Ward, Asset
from app.models.department import Department, Officer
from app.services.ai_engine import AIEngineService
from app.services.responsibility_engine import ResponsibilityEngineService
from app.services.routing_gate import RoutingGateService
from app.services.sla_service import SLAService
from app.services.notification_service import NotificationService
from app.core.audit import AuditLogger
from app.core.rbac import RBACManager
from app.dependencies import get_current_user, get_current_user_optional, require_roles
from app.schemas.case import (
    IntakeRequest, CaseConfirmationRequest, TaskCreateRequest,
    SequenceApprovalRequest, PriorityOverrideRequest, ResponsibilityOverrideRequest,
    CaseResponse
)

router = APIRouter(prefix="/cases", tags=["Cases & Intake"])

def generate_tracking_number(ward_number: int = 1) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    rand_seq = random.randint(1000, 9999)
    return f"NS-{now.year}-W{ward_number:02d}-{rand_seq}"

@router.post("/intake")
async def create_case_intake(
    req: IntakeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Module 1 & 4: Multimodal Citizen Intake.
    Accepts Bangla text, voice, media, GPS pin. Triggers AI analysis & Responsibility Engine.
    """
    # 1. AI Analysis of intake text
    ai_result = AIEngineService.analyze_intake_text(req.raw_text_bn)
    
    # 2. Responsibility Engine
    resp_result = await ResponsibilityEngineService.match_responsibility(
        db=db,
        latitude=req.latitude,
        longitude=req.longitude,
        primary_category=ai_result["primary_category"],
        secondary_categories=ai_result["secondary_categories"]
    )
    
    # 3. Routing Gate check
    gate_eval = await RoutingGateService.evaluate_safety_gate(
        db=db,
        confidence_score=resp_result["confidence_score"],
        is_hazard=ai_result["is_hazard"]
    )
    
    ward_num = resp_result["matched_ward_number"] or 1
    tracking_no = generate_tracking_number(ward_num)
    
    # 4. Create Case Record
    case = Case(
        tracking_number=tracking_no,
        title_bn=f"{resp_result['department_name_bn']} সংক্রান্ত নাগরিক সেবা রিপোর্ট",
        description_bn=ai_result["normalized_text"],
        primary_category=ai_result["primary_category"],
        secondary_categories=ai_result["secondary_categories"],
        latitude=req.latitude,
        longitude=req.longitude,
        address_text=req.address_text or "নাগরিক অবস্থান পিন",
        landmark=req.landmark,
        is_public_property=req.is_public_property,
        ward_id=resp_result["matched_ward_id"],
        asset_id=resp_result["matched_asset_id"],
        status=CaseStatusEnum.SUBMITTED,
        priority=ai_result["proposed_priority"],
        ai_proposed_priority=ai_result["proposed_priority"],
        is_hazard=ai_result["is_hazard"],
        lead_department_id=resp_result["department_id"],
        lead_officer_id=resp_result["assigned_officer_id"],
        assigned_rule_id=resp_result["responsibility_rule_id"],
        responsibility_reason_bn=resp_result["responsibility_reason_bn"],
        responsibility_confidence=resp_result["confidence_score"],
        requires_staff_verification=not gate_eval["can_propose"],
        citizen_user_id=current_user.id if current_user else None,
        intake_channel=req.intake_channel
    )
    db.add(case)
    await db.flush()

    # 5. Create Case Report
    report = CaseReport(
        case_id=case.id,
        reported_by_user_id=current_user.id if current_user else None,
        raw_text_bn=req.raw_text_bn,
        normalized_text_bn=ai_result["normalized_text"],
        voice_audio_url=req.voice_audio_url,
        extracted_entities=ai_result["extracted_entities"],
        reported_channel=req.intake_channel
    )
    db.add(report)

    # 6. Save Initial Before Photos/Videos
    for photo_url in req.photo_urls:
        evidence = CaseEvidence(
            case_id=case.id,
            uploaded_by_user_id=current_user.id if current_user else None,
            uploader_role="citizen",
            evidence_type=EvidenceTypeEnum.BEFORE,
            media_url=photo_url,
            latitude=req.latitude,
            longitude=req.longitude
        )
        db.add(evidence)

    # 7. Add Initial Status History
    status_history = CaseStatusHistory(
        case_id=case.id,
        from_status=None,
        to_status=CaseStatusEnum.SUBMITTED,
        changed_by_user_id=current_user.id if current_user else None,
        actor_role="citizen" if current_user else "anonymous",
        reason_bn="নাগরিক আবেদন দাখিল ও এআই প্রাথমিক বিশ্লেষণ সম্পন্ন।"
    )
    db.add(status_history)

    # 8. Audit Log
    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id if current_user else None,
        actor_role="citizen" if current_user else "anonymous",
        action="CASE_CREATE_INTAKE",
        resource_type="CASE",
        resource_id=case.id,
        after_state={"tracking_number": case.tracking_number, "priority": case.priority.value}
    )

    # 9. Send In-App / Mock SMS Confirmation
    if current_user:
        await NotificationService.send_notification(
            db=db,
            user_id=current_user.id,
            case_id=case.id,
            title_bn="অভিযোগ সফলভাবে নিবন্ধিত হয়েছে",
            message_bn=f"আপনার ট্র্যাকিং নম্বর: {case.tracking_number}। দায়িত্বপ্রাপ্ত বিভাগ: {resp_result['department_name_bn']}।",
            phone=current_user.phone
        )

    await db.commit()

    return {
        "case_id": case.id,
        "tracking_number": case.tracking_number,
        "ai_analysis": ai_result,
        "responsibility": resp_result,
        "gate_evaluation": gate_eval,
        "status": case.status.value
    }

@router.get("")
async def list_cases(
    status_filter: Optional[CaseStatusEnum] = None,
    priority_filter: Optional[PriorityEnum] = None,
    ward_id: Optional[str] = None,
    department_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Case).options(
        selectinload(Case.lead_department),
        selectinload(Case.lead_officer),
        selectinload(Case.ward),
        selectinload(Case.asset),
        selectinload(Case.tasks)
    ).order_by(desc(Case.created_at))

    # Apply RBAC Filtering
    if current_user.role == UserRoleEnum.CITIZEN:
        stmt = stmt.where(Case.citizen_user_id == current_user.id)
    elif current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids:
            stmt = stmt.where(Case.ward_id.in_(assigned_ward_ids))
    elif current_user.role == UserRoleEnum.DEPT_OFFICER:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            stmt = stmt.where(Case.lead_department_id.in_(assigned_dept_ids))

    if status_filter:
        stmt = stmt.where(Case.status == status_filter)
    if priority_filter:
        stmt = stmt.where(Case.priority == priority_filter)
    if ward_id:
        stmt = stmt.where(Case.ward_id == ward_id)
    if department_id:
        stmt = stmt.where(Case.lead_department_id == department_id)

    res = await db.execute(stmt)
    cases = res.scalars().all()

    output = []
    for c in cases:
        output.append({
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title_bn": c.title_bn,
            "description_bn": c.description_bn,
            "primary_category": c.primary_category,
            "secondary_categories": c.secondary_categories or [],
            "status": c.status.value,
            "priority": c.priority.value,
            "ward_name_bn": c.ward.ward_name_bn if c.ward else None,
            "ward_number": c.ward.ward_number if c.ward else None,
            "lead_department_name_bn": c.lead_department.name_bn if c.lead_department else None,
            "lead_officer_name_bn": c.lead_officer.name_bn if c.lead_officer else None,
            "lead_officer_phone": c.lead_officer.official_phone if c.lead_officer else None,
            "is_hazard": c.is_hazard,
            "requires_staff_verification": c.requires_staff_verification,
            "created_at": c.created_at.isoformat()
        })

    return output

@router.get("/{case_id}")
async def get_case_detail(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Case).where(Case.id == case_id).options(
        selectinload(Case.ward),
        selectinload(Case.asset),
        selectinload(Case.lead_department),
        selectinload(Case.lead_officer),
        selectinload(Case.tasks).selectinload(CaseTask.department),
        selectinload(Case.tasks).selectinload(CaseTask.assigned_officer),
        selectinload(Case.tasks).selectinload(CaseTask.prerequisites),
        selectinload(Case.evidence_items),
        selectinload(Case.status_history),
        selectinload(Case.feedback_entries),
        selectinload(Case.objections)
    )
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    # Evaluate SLA
    sla_info = await SLAService.evaluate_case_sla(db, case)

    tasks_data = []
    for t in case.tasks:
        tasks_data.append({
            "id": t.id,
            "title_bn": t.title_bn,
            "description_bn": t.description_bn,
            "department_id": t.department_id,
            "department_name_bn": t.department.name_bn if t.department else None,
            "officer_name_bn": t.assigned_officer.name_bn if t.assigned_officer else None,
            "officer_phone": t.assigned_officer.official_phone if t.assigned_officer else None,
            "sequence_order": t.sequence_order,
            "is_lead_task": t.is_lead_task,
            "status": t.status.value,
            "waiting_reason_bn": t.waiting_reason_bn,
            "prerequisite_task_ids": [p.prerequisite_task_id for p in t.prerequisites]
        })

    evidence_data = []
    for e in case.evidence_items:
        evidence_data.append({
            "id": e.id,
            "evidence_type": e.evidence_type.value,
            "media_url": e.media_url,
            "is_verified": e.is_verified_by_staff,
            "staff_notes": e.staff_notes,
            "timestamp": e.timestamp.isoformat()
        })

    return {
        "id": case.id,
        "tracking_number": case.tracking_number,
        "title_bn": case.title_bn,
        "description_bn": case.description_bn,
        "primary_category": case.primary_category,
        "secondary_categories": case.secondary_categories or [],
        "latitude": case.latitude,
        "longitude": case.longitude,
        "address_text": case.address_text,
        "landmark": case.landmark,
        "status": case.status.value,
        "priority": case.priority.value,
        "ai_proposed_priority": case.ai_proposed_priority.value if case.ai_proposed_priority else None,
        "is_hazard": case.is_hazard,
        "ward_id": case.ward_id,
        "ward_name_bn": case.ward.ward_name_bn if case.ward else None,
        "ward_number": case.ward.ward_number if case.ward else None,
        "asset_id": case.asset_id,
        "asset_name_bn": case.asset.name_bn if case.asset else None,
        "asset_code": case.asset.asset_code if case.asset else None,
        "lead_department_name_bn": case.lead_department.name_bn if case.lead_department else None,
        "lead_officer_name_bn": case.lead_officer.name_bn if case.lead_officer else None,
        "lead_officer_designation": case.lead_officer.designation if case.lead_officer else None,
        "lead_officer_phone": case.lead_officer.official_phone if case.lead_officer else None,
        "lead_officer_email": case.lead_officer.official_email if case.lead_officer else None,
        "responsibility_reason_bn": case.responsibility_reason_bn,
        "responsibility_confidence": case.responsibility_confidence,
        "requires_staff_verification": case.requires_staff_verification,
        "created_at": case.created_at.isoformat(),
        "tasks": tasks_data,
        "evidence_items": evidence_data,
        "sla": sla_info,
        "feedback": [{"is_satisfied": f.is_satisfied, "comments": f.comments_bn} for f in case.feedback_entries],
        "objections": [{"reason_bn": o.objection_reason_bn, "status": o.review_status} for o in case.objections]
    }

@router.post("/{case_id}/approve-sequence")
async def approve_case_workflow_sequence(
    case_id: str,
    req: SequenceApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Module 7: Multi-Department Work Sequencing Approval.
    Coordinator / Ward Desk approves coordinated task order.
    """
    stmt = select(Case).where(Case.id == case_id).options(selectinload(Case.tasks))
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    # Clear old tasks if any
    for t in case.tasks:
        await db.delete(t)
    await db.flush()

    # Create approved sequence of tasks
    created_tasks = []
    for idx, t_req in enumerate(req.approved_tasks):
        # Look up assigned officer for that dept & ward
        stmt_off = select(Officer).where(
            Officer.department_id == t_req.department_id,
            Officer.ward_id == case.ward_id,
            Officer.is_active == True
        )
        res_off = await db.execute(stmt_off)
        off_obj = res_off.scalars().first()

        task = CaseTask(
            case_id=case.id,
            department_id=t_req.department_id,
            assigned_officer_id=off_obj.id if off_obj else None,
            title_bn=t_req.title_bn,
            description_bn=t_req.description_bn,
            sequence_order=t_req.sequence_order,
            is_lead_task=t_req.is_lead_task,
            status=TaskStatusEnum.IN_PROGRESS if idx == 0 else TaskStatusEnum.WAITING_PREREQUISITE,
            waiting_reason_bn=None if idx == 0 else f"পূর্ববর্তী কাজের সমাপ্তির জন্য অপেক্ষমাণ (ধাপ {idx})"
        )
        db.add(task)
        created_tasks.append(task)
    
    await db.flush()

    # Update case status to VERIFIED / IN_PROGRESS
    old_status = case.status
    case.status = CaseStatusEnum.IN_PROGRESS
    case.requires_staff_verification = False

    hist = CaseStatusHistory(
        case_id=case.id,
        from_status=old_status,
        to_status=CaseStatusEnum.IN_PROGRESS,
        changed_by_user_id=current_user.id,
        actor_role=current_user.role.value,
        reason_bn=f"সমন্বয়কারী কর্তৃক কাজের কর্মপরিকল্পনা ও পর্যায়ক্রম অনুমোদিত: {req.approval_notes or 'অনুমোদন প্রদান করা হয়েছে'}"
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="APPROVE_CASE_SEQUENCE",
        resource_type="CASE",
        resource_id=case.id,
        after_state={"tasks_count": len(created_tasks)}
    )
    await db.commit()

    return {"message_bn": "বহু-বিভাগীয় কর্মপরিকল্পনা সফলভাবে অনুমোদিত হয়েছে।", "case_id": case.id}

@router.post("/{case_id}/override-priority")
async def override_case_priority(
    case_id: str,
    req: PriorityOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    old_priority = case.priority
    case.priority = req.priority
    case.priority_override_reason = req.reason

    hist = CasePriorityHistory(
        case_id=case.id,
        from_priority=old_priority,
        to_priority=req.priority,
        changed_by_user_id=current_user.id,
        reason=req.reason
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="OVERRIDE_CASE_PRIORITY",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"priority": old_priority.value},
        after_state={"priority": req.priority.value},
        reason=req.reason
    )
    await db.commit()
    return {"message_bn": f"অগ্রাধিকার সফলভাবে পরিবর্তিত হয়েছে: {req.priority.value}", "case_id": case.id}

@router.post("/{case_id}/override-responsibility")
async def override_case_responsibility(
    case_id: str,
    req: ResponsibilityOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    old_dept_id = case.lead_department_id
    case.lead_department_id = req.department_id
    if req.officer_id:
        case.lead_officer_id = req.officer_id
    case.responsibility_reason_bn = f"[কর্মকর্তা কর্তৃক সংশোধিত] {req.reason}"
    case.requires_staff_verification = False

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="OVERRIDE_CASE_RESPONSIBILITY",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"department_id": old_dept_id},
        after_state={"department_id": req.department_id},
        reason=req.reason
    )
    await db.commit()
    return {"message_bn": "দায়িত্বপ্রাপ্ত বিভাগ সফলভাবে সংশোধিত হয়েছে।", "case_id": case.id}
