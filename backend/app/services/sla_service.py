import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.case import Case, CaseStatusEnum, PriorityEnum
from app.models.sla import SLAPolicy, SLAEvent, SLAStepEnum

class SLAService:
    """
    SLA & Escalation Ladder Engine (R&D Section 6.6, Table 13).
    Ladder Steps:
    - Reminder (close to response target) -> Notification to responsible officer
    - Escalation 1 (target missed) -> Alert case coordinator ("under senior review")
    - Escalation 2 (missed 2nd interval) -> Alert Department Head / Senior City Corp
    - Emergency Escalation -> Immediate emergency alert & ward desk follow-up
    """

    # Default Target Hours by Priority
    DEFAULT_TARGETS = {
        PriorityEnum.EMERGENCY: {"response_hours": 2, "resolution_hours": 6, "esc1_hours": 4, "esc2_hours": 8},
        PriorityEnum.HIGH: {"response_hours": 12, "resolution_hours": 24, "esc1_hours": 18, "esc2_hours": 36},
        PriorityEnum.MEDIUM: {"response_hours": 48, "resolution_hours": 72, "esc1_hours": 60, "esc2_hours": 96},
        PriorityEnum.LOW: {"response_hours": 120, "resolution_hours": 168, "esc1_hours": 144, "esc2_hours": 240}
    }

    @classmethod
    async def evaluate_case_sla(cls, db: AsyncSession, case: Case) -> Dict[str, Any]:
        # If case is not verified yet, or already closed/merged, SLA timer is inactive
        if case.status in [CaseStatusEnum.SUBMITTED, CaseStatusEnum.CLOSED, CaseStatusEnum.MERGED]:
            return {
                "is_timer_running": False,
                "current_step": SLAStepEnum.NORMAL.value,
                "elapsed_hours": 0.0,
                "target_hours": 0,
                "is_breached": False,
                "waiting_reason_bn": None
            }

        # Check if any task is actively waiting on a valid prerequisite
        active_waiting_reason = None
        if "tasks" in case.__dict__:
            tasks_list = case.tasks
        else:
            from app.models.case import CaseTask
            res = await db.execute(select(CaseTask).where(CaseTask.case_id == case.id))
            tasks_list = res.scalars().all()

        for task in tasks_list:
            if task.waiting_reason_bn:
                active_waiting_reason = task.waiting_reason_bn
                break

        # Check database for custom configured SLA policy first (R&D configurable targets)
        policy_stmt = select(SLAPolicy).where(SLAPolicy.priority == case.priority, SLAPolicy.is_active == True)
        policy_res = await db.execute(policy_stmt)
        policy = policy_res.scalar_one_or_none()
        if policy:
            targets = {
                "response_hours": policy.response_target_hours,
                "resolution_hours": policy.resolution_target_hours,
                "esc1_hours": policy.escalation_1_hours,
                "esc2_hours": policy.escalation_2_hours
            }
        else:
            targets = cls.DEFAULT_TARGETS.get(case.priority, cls.DEFAULT_TARGETS[PriorityEnum.MEDIUM])
        resolution_target = targets["resolution_hours"]
        
        now = datetime.datetime.now(datetime.timezone.utc)
        created_at = case.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=datetime.timezone.utc)
        elapsed_hours = (now - created_at).total_seconds() / 3600.0

        is_breached = elapsed_hours > resolution_target and not active_waiting_reason
        
        # Determine escalation ladder position
        if case.priority == PriorityEnum.EMERGENCY and elapsed_hours > targets["response_hours"]:
            current_step = SLAStepEnum.EMERGENCY_ALERT
        elif elapsed_hours >= targets["esc2_hours"]:
            current_step = SLAStepEnum.ESCALATION_2
        elif elapsed_hours >= targets["esc1_hours"]:
            current_step = SLAStepEnum.ESCALATION_1
        elif elapsed_hours >= (resolution_target - 4):
            current_step = SLAStepEnum.REMINDER
        else:
            current_step = SLAStepEnum.NORMAL

        return {
            "is_timer_running": active_waiting_reason is None,
            "current_step": current_step.value,
            "elapsed_hours": round(elapsed_hours, 1),
            "target_hours": resolution_target,
            "is_breached": is_breached,
            "waiting_reason_bn": active_waiting_reason,
            "is_paused": active_waiting_reason is not None
        }
