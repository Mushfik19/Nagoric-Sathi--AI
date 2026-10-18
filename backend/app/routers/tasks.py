import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.case import Case, CaseTask, TaskStatusEnum, CaseStatusEnum, TaskDependency
from app.models.department import Department, Officer
from app.models.task_assignment import TaskAssignmentHistory, TaskWaitingQueue
from app.models.evidence import CaseEvidence, EvidenceTypeEnum
from app.schemas.case import TaskStatusUpdateRequest, TaskRejectRequest, TaskAssignRequest
from app.dependencies import get_current_user, require_roles
from app.core.audit import AuditLogger
from app.services.task_assignment_service import TaskAssignmentService

router = APIRouter(prefix="/tasks", tags=["Department Tasks & Workload Dispatch"])

@router.get("/my-tasks")
async def get_my_assigned_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Returns tasks assigned to the current officer or their department.
    """
    stmt = select(CaseTask).options(
        selectinload(CaseTask.case).selectinload(Case.ward),
        selectinload(CaseTask.department),
        selectinload(CaseTask.assigned_officer),
        selectinload(CaseTask.evidence)
    ).order_by(CaseTask.sequence_order)

    if current_user.role == UserRoleEnum.DEPT_OFFICER:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            stmt = stmt.where(CaseTask.department_id.in_(assigned_dept_ids))

    res = await db.execute(stmt)
    tasks = res.scalars().all()

    output = []
    for t in tasks:
        output.append({
            "id": t.id,
            "case_id": t.case_id,
            "case_tracking_number": t.case.tracking_number if t.case else None,
            "case_priority": t.case.priority.value if t.case else "medium",
            "ward_name_bn": t.case.ward.ward_name_bn if t.case and t.case.ward else None,
            "ward_number": t.case.ward.ward_number if t.case and t.case.ward else None,
            "location_address": t.case.address_text if t.case else None,
            "title_bn": t.title_bn,
            "description_bn": t.description_bn,
            "department_id": t.department_id,
            "department_name_bn": t.department.name_bn if t.department else None,
            "assigned_officer_id": t.assigned_officer_id,
            "assigned_officer_name_bn": t.assigned_officer.name_bn if t.assigned_officer else None,
            "sequence_order": t.sequence_order,
            "is_lead_task": t.is_lead_task,
            "status": t.status.value,
            "acceptance_status": t.acceptance_status,
            "waiting_reason_bn": t.waiting_reason_bn,
            "evidence_count": len(t.evidence),
            "created_at": t.created_at.isoformat()
        })
    return output

@router.get("/department-requests")
async def get_department_incoming_requests(
    department_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Returns incoming tasks routed to the officer's department awaiting acceptance or dispatch.
    """
    if current_user.role == UserRoleEnum.DEPT_OFFICER:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if not assigned_dept_ids:
            return []
        department_id = assigned_dept_ids[0]
    elif not department_id:
        # Default for admin/coordinator: first department or all
        stmt_d = select(CaseTask.department_id).limit(1)
        res_d = await db.execute(stmt_d)
        department_id = res_d.scalar_one_or_none()
        if not department_id:
            return []

    return await TaskAssignmentService.get_department_incoming_requests(
        db=db,
        department_id=department_id
    )

@router.post("/{task_id}/accept")
async def accept_department_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Department officer explicitly accepts assigned work responsibility.
    """
    # Permission verification
    if current_user.role == UserRoleEnum.DEPT_OFFICER:
        stmt_chk = select(CaseTask.department_id).where(CaseTask.id == task_id)
        res_chk = await db.execute(stmt_chk)
        t_dept = res_chk.scalar_one_or_none()
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if t_dept not in assigned_dept_ids:
            raise HTTPException(status_code=403, detail="আপনার সংশ্লিষ্ট দপ্তরের কাজ ব্যতিরেকে অন্যান্য দপ্তরের কাজ গ্রহণ করার অনুমতি নেই।")

    try:
        return await TaskAssignmentService.accept_task(
            db=db,
            task_id=task_id,
            user=current_user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{task_id}/reject")
async def reject_department_task(
    task_id: str,
    req: TaskRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Department rejects task with mandatory explanation; escalates back to coordinator.
    """
    # Permission verification
    if current_user.role == UserRoleEnum.DEPT_OFFICER:
        stmt_chk = select(CaseTask.department_id).where(CaseTask.id == task_id)
        res_chk = await db.execute(stmt_chk)
        t_dept = res_chk.scalar_one_or_none()
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if t_dept not in assigned_dept_ids:
            raise HTTPException(status_code=403, detail="অন্যান্য দপ্তরের কাজ প্রত্যাখ্যান করার অধিকার নেই।")

    try:
        return await TaskAssignmentService.reject_task(
            db=db,
            task_id=task_id,
            user=current_user,
            reason_bn=req.reason_bn
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{task_id}/recommendations")
async def get_task_assignment_recommendations(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Returns explainable, deterministic officer recommendations for task assignment.
    """
    try:
        return await TaskAssignmentService.get_assignment_recommendations(
            db=db,
            task_id=task_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{task_id}/assign")
async def assign_task_to_officer(
    task_id: str,
    req: TaskAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Explicitly assigns or reassigns task to an officer with capacity checking and history logging.
    """
    try:
        return await TaskAssignmentService.assign_task(
            db=db,
            task_id=task_id,
            officer_id=req.officer_id,
            user=current_user,
            assignment_type=req.assignment_type,
            reason_bn=req.reason_bn
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/waiting-queue")
async def get_persistent_waiting_queue(
    department_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Returns persistent, restart-resilient task waiting queue sorted by priority and SLA risk.
    """
    if current_user.role == UserRoleEnum.DEPT_OFFICER and not department_id:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            department_id = assigned_dept_ids[0]

    return await TaskAssignmentService.get_waiting_queue(
        db=db,
        department_id=department_id
    )

@router.post("/queue/auto-dispatch")
async def auto_dispatch_waiting_queue(
    department_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Evaluates waiting queue and automatically assigns ready tasks to available officers.
    """
    if current_user.role == UserRoleEnum.DEPT_OFFICER and not department_id:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            department_id = assigned_dept_ids[0]

    dispatched = await TaskAssignmentService.process_waiting_queue(
        db=db,
        department_id=department_id
    )
    return {
        "dispatched_count": len(dispatched),
        "dispatched_tasks": dispatched,
        "message_bn": f"{len(dispatched)}টি অপেক্ষারত কাজ সফলভাবে স্বয়ংক্রিয়ভাবে বণ্টন করা হয়েছে।"
    }

@router.get("/{task_id}/assignment-history")
async def get_task_assignment_history(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Returns complete audit trail of task assignments and reassignments.
    """
    return await TaskAssignmentService.get_task_assignment_history(
        db=db,
        task_id=task_id
    )

@router.get("/{task_id}")
async def get_task_detail(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Full task details including case location, evidence, prerequisites, and assigned officer.
    """
    stmt = (
        select(CaseTask)
        .where(CaseTask.id == task_id)
        .options(
            selectinload(CaseTask.case).selectinload(Case.ward),
            selectinload(CaseTask.department),
            selectinload(CaseTask.assigned_officer),
            selectinload(CaseTask.evidence),
            selectinload(CaseTask.prerequisites).selectinload(TaskDependency.prerequisite_task)
        )
    )
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="টাস্ক পাওয়া যায়নি।")

    # Prerequisite details
    prereqs = []
    for dep in task.prerequisites:
        if dep.prerequisite_task:
            prereqs.append({
                "prerequisite_task_id": dep.prerequisite_task_id,
                "title_bn": dep.prerequisite_task.title_bn,
                "sequence_order": dep.prerequisite_task.sequence_order,
                "status": dep.prerequisite_task.status.value,
                "is_completed": dep.prerequisite_task.status in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]
            })

    evidence_items = []
    for ev in task.evidence:
        evidence_items.append({
            "id": ev.id,
            "evidence_type": ev.evidence_type.value,
            "media_url": ev.media_url,
            "is_verified": ev.is_verified_by_staff,
            "staff_notes": ev.staff_notes,
            "created_at": ev.created_at.isoformat()
        })

    return {
        "id": task.id,
        "case_id": task.case_id,
        "case_tracking_number": task.case.tracking_number if task.case else None,
        "case_title_bn": task.case.title_bn if task.case else None,
        "case_description_bn": task.case.description_bn if task.case else None,
        "case_priority": task.case.priority.value if task.case else "medium",
        "case_status": task.case.status.value if task.case else None,
        "latitude": task.case.latitude if task.case else None,
        "longitude": task.case.longitude if task.case else None,
        "address_text": task.case.address_text if task.case else None,
        "landmark": task.case.landmark if task.case else None,
        "ward_name_bn": task.case.ward.ward_name_bn if task.case and task.case.ward else None,
        "ward_number": task.case.ward.ward_number if task.case and task.case.ward else None,
        "department_id": task.department_id,
        "department_name_bn": task.department.name_bn if task.department else None,
        "assigned_officer_id": task.assigned_officer_id,
        "assigned_officer_name_bn": task.assigned_officer.name_bn if task.assigned_officer else None,
        "assigned_officer_phone": task.assigned_officer.official_phone if task.assigned_officer else None,
        "title_bn": task.title_bn,
        "description_bn": task.description_bn,
        "sequence_order": task.sequence_order,
        "is_lead_task": task.is_lead_task,
        "status": task.status.value,
        "acceptance_status": task.acceptance_status,
        "rejection_reason_bn": task.rejection_reason_bn,
        "waiting_reason_bn": task.waiting_reason_bn,
        "sla_hours": task.sla_hours,
        "started_at": task.started_at.isoformat() if task.started_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "assigned_at": task.assigned_at.isoformat() if task.assigned_at else None,
        "prerequisites": prereqs,
        "evidence": evidence_items,
        "created_at": task.created_at.isoformat()
    }

@router.post("/{task_id}/update-status")
async def update_task_status(
    task_id: str,
    req: TaskStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.DEPT_OFFICER, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Updates the task execution status, processes proof upload, unlocks downstream dependent tasks.
    """
    stmt = select(CaseTask).where(CaseTask.id == task_id).options(selectinload(CaseTask.case))
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="টাস্ক পাওয়া যায়নি।")

    old_status = task.status
    task.status = req.status
    task.waiting_reason_bn = req.waiting_reason_bn

    # If proof uploaded, create after evidence
    if req.evidence_url:
        ev = CaseEvidence(
            case_id=task.case_id,
            task_id=task.id,
            uploaded_by_user_id=current_user.id,
            uploader_role=current_user.role.value,
            evidence_type=EvidenceTypeEnum.AFTER,
            media_url=req.evidence_url,
            is_verified_by_staff=True,
            staff_notes=req.notes or "মাঠ পর্যায়ের কর্মকর্তা কর্তৃক সমাধান প্রমাণ আপলোড"
        )
        db.add(ev)
        task.status = TaskStatusEnum.COMPLETED_AWAITING_REVIEW
        task.completed_at = datetime.datetime.utcnow()

    # Check if there are subsequent dependent tasks in the same case and unlock the next task
    if task.status in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]:
        # Also free assigned officer's capacity
        if task.assigned_officer_id:
            stmt_off = select(Officer).where(Officer.id == task.assigned_officer_id)
            res_off = await db.execute(stmt_off)
            off = res_off.scalar_one_or_none()
            if off and off.current_active_tasks > 0:
                off.current_active_tasks -= 1

        # Unlock next task in sequence
        stmt_next = select(CaseTask).where(
            CaseTask.case_id == task.case_id,
            CaseTask.sequence_order > task.sequence_order
        ).order_by(CaseTask.sequence_order)
        res_next = await db.execute(stmt_next)
        next_tasks = res_next.scalars().all()
        if next_tasks:
            immediate_next = next_tasks[0]
            if immediate_next.status == TaskStatusEnum.WAITING_PREREQUISITE:
                immediate_next.status = TaskStatusEnum.IN_PROGRESS
                immediate_next.waiting_reason_bn = None
                # Update queue item if in queue
                stmt_nq = select(TaskWaitingQueue).where(TaskWaitingQueue.task_id == immediate_next.id)
                res_nq = await db.execute(stmt_nq)
                q_next = res_nq.scalar_one_or_none()
                if q_next:
                    q_next.prerequisite_status = "ready"
                    q_next.status = "queued"

    # Check if all tasks for case are done
    stmt_all = select(CaseTask).where(CaseTask.case_id == task.case_id)
    res_all = await db.execute(stmt_all)
    all_case_tasks = res_all.scalars().all()
    all_done = all(t.status in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED] for t in all_case_tasks)
    
    if all_done:
        task.case.status = CaseStatusEnum.RESOLVED_PROOF_UPLOADED

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="UPDATE_TASK_STATUS",
        resource_type="TASK",
        resource_id=task.id,
        before_state={"status": old_status.value},
        after_state={"status": task.status.value, "waiting_reason": task.waiting_reason_bn}
    )
    await db.commit()

    return {
        "message_bn": "কাজের অগ্রগতি সফলভাবে আপডেট হয়েছে।",
        "task_id": task.id,
        "task_status": task.status.value,
        "case_status": task.case.status.value
    }
