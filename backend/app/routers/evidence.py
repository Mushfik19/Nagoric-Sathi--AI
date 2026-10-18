from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.case import Case, CaseTask, CaseStatusHistory, CaseStatusEnum, TaskStatusEnum
from app.models.evidence import CaseEvidence, EvidenceTypeEnum, CaseFeedback, CaseObjection
from app.services.evidence_service import EvidenceService
from app.services.notification_service import NotificationService
from app.core.audit import AuditLogger
from app.schemas.evidence import EvidenceUploadRequest, FeedbackSubmitRequest, ObjectionSubmitRequest, ObjectionReviewRequest
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/evidence", tags=["Evidence & Verification"])

@router.get("/before-after/{case_id}")
async def get_before_after_comparison(case_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(CaseEvidence).where(CaseEvidence.case_id == case_id).order_by(CaseEvidence.created_at)
    res = await db.execute(stmt)
    evidence_items = res.scalars().all()
    
    paired = EvidenceService.pair_before_after_evidence(evidence_items)
    return paired

@router.post("/upload-proof")
async def upload_evidence_proof(
    req: EvidenceUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ev = CaseEvidence(
        case_id=req.case_id,
        task_id=req.task_id,
        uploaded_by_user_id=current_user.id,
        uploader_role=current_user.role.value,
        evidence_type=req.evidence_type,
        media_url=req.media_url,
        media_format=req.media_format,
        file_size_bytes=req.file_size_bytes,
        latitude=req.latitude,
        longitude=req.longitude,
        staff_notes=req.staff_notes,
        is_verified_by_staff=(current_user.role != UserRoleEnum.CITIZEN)
    )
    db.add(ev)
    await db.flush()

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="UPLOAD_CASE_EVIDENCE",
        resource_type="EVIDENCE",
        resource_id=ev.id,
        after_state={"evidence_type": req.evidence_type.value, "media_url": req.media_url}
    )
    await db.commit()

    return {"message_bn": "প্রমাণক সফলভাবে আপলোড হয়েছে।", "evidence_id": ev.id}

@router.post("/submit-feedback")
async def submit_citizen_feedback(
    req: FeedbackSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Module 8 / Section 14: Citizen Verification.
    If is_satisfied is True ('Solved'), moves case to CLOSED.
    Closure requires evidence and citizen acceptance! AI can NEVER auto-close.
    """
    stmt = select(Case).where(Case.id == req.case_id).options(selectinload(Case.evidence_items))
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    # Check evidence exists
    after_ev = [e for e in case.evidence_items if e.evidence_type == EvidenceTypeEnum.AFTER]
    if not after_ev:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="সমাধানের প্রমাণক ব্যতীত কেস বন্ধ করা সম্ভব নয়।"
        )

    feedback = CaseFeedback(
        case_id=case.id,
        citizen_user_id=current_user.id,
        is_satisfied=req.is_satisfied,
        rating_stars=req.rating_stars,
        comments_bn=req.comments_bn
    )
    db.add(feedback)

    if req.is_satisfied:
        old_status = case.status
        case.status = CaseStatusEnum.CLOSED
        
        hist = CaseStatusHistory(
            case_id=case.id,
            from_status=old_status,
            to_status=CaseStatusEnum.CLOSED,
            changed_by_user_id=current_user.id,
            actor_role="citizen",
            reason_bn="নাগরিক সমাধান গ্রহণ করেছেন ও সন্তুষ্টি প্রকাশ করেছেন।"
        )
        db.add(hist)
        
        await AuditLogger.log_event(
            db=db,
            actor_user_id=current_user.id,
            actor_role="citizen",
            action="CASE_CLOSED_BY_CITIZEN_ACCEPTANCE",
            resource_type="CASE",
            resource_id=case.id,
            after_state={"rating_stars": req.rating_stars}
        )

    await db.commit()
    return {"message_bn": "আপনার মূল্যবান মতামত সফলভাবে সংরক্ষিত হয়েছে।", "case_status": case.status.value}

@router.post("/submit-objection")
async def submit_citizen_objection(
    req: ObjectionSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Module 8 / Section 14: Citizen Objection ("Not Solved").
    Reopens the related task and case, sends alert to staff for re-review.
    """
    stmt = select(Case).where(Case.id == req.case_id).options(selectinload(Case.tasks))
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    old_status = case.status
    case.status = CaseStatusEnum.RE_OPENED

    # Reopen tasks
    target_task_id = req.reopened_task_id
    for t in case.tasks:
        if not target_task_id or t.id == target_task_id:
            t.status = TaskStatusEnum.REOPENED
            t.waiting_reason_bn = "নাগরিক কর্তৃক আপত্তি দাখিল: পুনঃতদন্ত ও সংশোধন প্রয়োজন"

    objection = CaseObjection(
        case_id=case.id,
        citizen_user_id=current_user.id,
        reopened_task_id=target_task_id,
        objection_reason_bn=req.objection_reason_bn,
        attached_evidence_url=req.attached_evidence_url,
        review_status="pending_review"
    )
    db.add(objection)

    hist = CaseStatusHistory(
        case_id=case.id,
        from_status=old_status,
        to_status=CaseStatusEnum.RE_OPENED,
        changed_by_user_id=current_user.id,
        actor_role="citizen",
        reason_bn=f"নাগরিক আপত্তি দাখিল করেছেন: {req.objection_reason_bn}"
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role="citizen",
        action="CITIZEN_SUBMIT_OBJECTION_REOPEN",
        resource_type="CASE",
        resource_id=case.id,
        after_state={"objection_reason": req.objection_reason_bn}
    )

    await db.commit()
    return {
        "message_bn": "আপনার আপত্তি নথিভুক্ত হয়েছে এবং কাজটি পুনঃপর্যালোচনার জন্য উন্মুক্ত করা হয়েছে।",
        "case_status": case.status.value
    }
