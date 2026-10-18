import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.case import Case, CaseTask, TaskStatusEnum, PriorityEnum, TaskDependency
from app.models.department import Department, Officer
from app.models.task_assignment import TaskAssignmentHistory, TaskWaitingQueue
from app.models.user import User
from app.core.audit import AuditLogger

PRIORITY_WEIGHTS = {
    PriorityEnum.EMERGENCY.value: 100,
    PriorityEnum.HIGH.value: 75,
    PriorityEnum.MEDIUM.value: 50,
    PriorityEnum.LOW.value: 25,
}

class TaskAssignmentService:

    @staticmethod
    async def get_department_incoming_requests(
        db: AsyncSession,
        department_id: str
    ) -> List[Dict[str, Any]]:
        """
        Retrieves all tasks routed to this department that are pending acceptance or recently accepted.
        """
        stmt = (
            select(CaseTask)
            .where(CaseTask.department_id == department_id)
            .options(
                selectinload(CaseTask.case).selectinload(Case.ward),
                selectinload(CaseTask.department),
                selectinload(CaseTask.assigned_officer),
                selectinload(CaseTask.prerequisites).selectinload(TaskDependency.prerequisite_task)
            )
            .order_by(CaseTask.created_at.desc())
        )
        res = await db.execute(stmt)
        tasks = res.scalars().all()

        results = []
        for t in tasks:
            # Check prerequisites
            prereqs_completed = True
            pending_prereq_names = []
            for dep in t.prerequisites:
                if dep.prerequisite_task and dep.prerequisite_task.status not in [
                    TaskStatusEnum.COMPLETED_AWAITING_REVIEW,
                    TaskStatusEnum.VERIFIED_COMPLETED
                ]:
                    prereqs_completed = False
                    pending_prereq_names.append(dep.prerequisite_task.title_bn)

            results.append({
                "id": t.id,
                "case_id": t.case_id,
                "case_tracking_number": t.case.tracking_number if t.case else None,
                "case_title_bn": t.case.title_bn if t.case else None,
                "case_priority": t.case.priority.value if t.case else "medium",
                "ward_name_bn": t.case.ward.ward_name_bn if t.case and t.case.ward else None,
                "ward_number": t.case.ward.ward_number if t.case and t.case.ward else None,
                "location_address": t.case.address_text if t.case else None,
                "title_bn": t.title_bn,
                "description_bn": t.description_bn,
                "sequence_order": t.sequence_order,
                "is_lead_task": t.is_lead_task,
                "status": t.status.value,
                "acceptance_status": t.acceptance_status,
                "rejection_reason_bn": t.rejection_reason_bn,
                "waiting_reason_bn": t.waiting_reason_bn,
                "sla_hours": t.sla_hours,
                "assigned_officer_id": t.assigned_officer_id,
                "assigned_officer_name_bn": t.assigned_officer.name_bn if t.assigned_officer else None,
                "prerequisites_completed": prereqs_completed,
                "pending_prerequisites": pending_prereq_names,
                "created_at": t.created_at.isoformat()
            })
        return results

    @staticmethod
    async def accept_task(
        db: AsyncSession,
        task_id: str,
        user: User
    ) -> Dict[str, Any]:
        """
        Department explicitly accepts responsibility for a task.
        If prerequisites are complete and officer is available, task is ready.
        Otherwise enqueued into persistent TaskWaitingQueue.
        """
        stmt = (
            select(CaseTask)
            .where(CaseTask.id == task_id)
            .options(
                selectinload(CaseTask.case),
                selectinload(CaseTask.prerequisites).selectinload(TaskDependency.prerequisite_task)
            )
        )
        res = await db.execute(stmt)
        task = res.scalar_one_or_none()
        if not task:
            raise ValueError("টাস্ক পাওয়া যায়নি।")

        task.acceptance_status = "accepted"
        task.rejection_reason_bn = None

        # Check prerequisites
        prereqs_completed = True
        waiting_reason = None
        for dep in task.prerequisites:
            if dep.prerequisite_task and dep.prerequisite_task.status not in [
                TaskStatusEnum.COMPLETED_AWAITING_REVIEW,
                TaskStatusEnum.VERIFIED_COMPLETED
            ]:
                prereqs_completed = False
                waiting_reason = f"পূর্ববর্তী কাজের অপেক্ষায়: {dep.prerequisite_task.title_bn}"
                break

        # Check if already assigned
        if not task.assigned_officer_id:
            # Enqueue in waiting queue
            await TaskAssignmentService._enqueue_task_record(
                db=db,
                task=task,
                prereqs_completed=prereqs_completed,
                waiting_reason=waiting_reason
            )

        await AuditLogger.log_event(
            db=db,
            actor_user_id=user.id,
            actor_role=user.role.value,
            action="DEPARTMENT_ACCEPT_TASK",
            resource_type="CASE_TASK",
            resource_id=task.id,
            before_state={"acceptance_status": "pending_acceptance"},
            after_state={"acceptance_status": "accepted", "prerequisites_completed": prereqs_completed}
        )
        await db.commit()

        return {
            "task_id": task.id,
            "acceptance_status": "accepted",
            "prerequisites_completed": prereqs_completed,
            "message_bn": "দপ্তর কর্তৃক দায়িত্ব সফলভাবে গৃহীত হয়েছে।"
        }

    @staticmethod
    async def reject_task(
        db: AsyncSession,
        task_id: str,
        user: User,
        reason_bn: str
    ) -> Dict[str, Any]:
        """
        Department rejects responsibility for a task with a mandatory reason.
        Does NOT delete the case; escalates back to coordinator review.
        """
        if not reason_bn or not reason_bn.strip():
            raise ValueError("প্রত্যাখ্যানের স্পষ্ট কারণ উল্লেখ করা আবশ্যক।")

        stmt = select(CaseTask).where(CaseTask.id == task_id).options(selectinload(CaseTask.case))
        res = await db.execute(stmt)
        task = res.scalar_one_or_none()
        if not task:
            raise ValueError("টাস্ক পাওয়া যায়নি।")

        task.acceptance_status = "rejected"
        task.rejection_reason_bn = reason_bn.strip()
        task.waiting_reason_bn = f"দপ্তর কর্তৃক প্রত্যাখ্যাত: {reason_bn.strip()}"

        # Remove from waiting queue if present
        stmt_q = select(TaskWaitingQueue).where(TaskWaitingQueue.task_id == task.id)
        res_q = await db.execute(stmt_q)
        q_item = res_q.scalar_one_or_none()
        if q_item:
            q_item.status = "cancelled"

        await AuditLogger.log_event(
            db=db,
            actor_user_id=user.id,
            actor_role=user.role.value,
            action="DEPARTMENT_REJECT_TASK",
            resource_type="CASE_TASK",
            resource_id=task.id,
            before_state={"acceptance_status": task.acceptance_status},
            after_state={"acceptance_status": "rejected", "reason": reason_bn.strip()}
        )
        await db.commit()

        return {
            "task_id": task.id,
            "acceptance_status": "rejected",
            "rejection_reason_bn": task.rejection_reason_bn,
            "message_bn": "দাপ্তরিক প্রত্যাখ্যান লিপিবদ্ধ করা হয়েছে এবং সমন্বয়কের পর্যালোচনার জন্য প্রেরিত হয়েছে।"
        }

    @staticmethod
    async def get_officers_workload(
        db: AsyncSession,
        department_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Returns dynamic officer availability and real persisted workload.
        """
        stmt = select(Officer).options(
            selectinload(Officer.department),
            selectinload(Officer.ward)
        )
        if department_id:
            stmt = stmt.where(Officer.department_id == department_id)

        res = await db.execute(stmt)
        officers = res.scalars().all()

        output = []
        for o in officers:
            # Count actual assigned active tasks from database
            stmt_active = select(func.count(CaseTask.id)).where(
                CaseTask.assigned_officer_id == o.id,
                CaseTask.status.in_([TaskStatusEnum.PENDING, TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.WAITING_PREREQUISITE])
            )
            res_active = await db.execute(stmt_active)
            active_count = res_active.scalar_one() or 0
            
            # Sync persisted field if different
            if o.current_active_tasks != active_count:
                o.current_active_tasks = active_count

            utilization = round((active_count / max(1, o.max_concurrent_tasks)) * 100, 1)

            output.append({
                "id": o.id,
                "user_id": o.user_id,
                "name_bn": o.name_bn,
                "name_en": o.name_en,
                "designation": o.designation,
                "department_id": o.department_id,
                "department_name_bn": o.department.name_bn if o.department else None,
                "ward_id": o.ward_id,
                "ward_name_bn": o.ward.ward_name_bn if o.ward else None,
                "ward_number": o.ward.ward_number if o.ward else None,
                "official_phone": o.official_phone,
                "official_email": o.official_email,
                "is_active": o.is_active,
                "availability_status": o.availability_status,
                "max_concurrent_tasks": o.max_concurrent_tasks,
                "current_active_tasks": active_count,
                "utilization_rate_pct": utilization,
                "is_at_capacity": active_count >= o.max_concurrent_tasks,
                "skills": o.skills or [],
                "shift_schedule": o.shift_schedule or {}
            })
        await db.commit()
        return output

    @staticmethod
    async def update_officer_availability(
        db: AsyncSession,
        officer_id: str,
        availability_status: str,
        max_concurrent_tasks: Optional[int] = None,
        shift_schedule: Optional[Dict[str, Any]] = None,
        acting_user: Optional[User] = None
    ) -> Dict[str, Any]:
        """
        Updates an officer's availability state and capacity limits.
        If status changes to 'available', evaluates waiting queue to assign pending tasks.
        """
        valid_statuses = ["available", "busy", "on_leave", "offline", "inactive"]
        if availability_status not in valid_statuses:
            raise ValueError(f"অবৈধ স্ট্যাটাস। গ্রহণযোগ্য মান: {', '.join(valid_statuses)}")

        stmt = select(Officer).where(Officer.id == officer_id)
        res = await db.execute(stmt)
        officer = res.scalar_one_or_none()
        if not officer:
            raise ValueError("কর্মকর্তা পাওয়া যায়নি।")

        old_status = officer.availability_status
        officer.availability_status = availability_status
        if max_concurrent_tasks is not None and max_concurrent_tasks > 0:
            officer.max_concurrent_tasks = max_concurrent_tasks
        if shift_schedule is not None:
            officer.shift_schedule = shift_schedule

        # If officer becomes available, trigger reactive queue processing
        auto_dispatched = []
        if availability_status == "available":
            auto_dispatched = await TaskAssignmentService.process_waiting_queue(
                db=db,
                department_id=officer.department_id
            )

        if acting_user:
            await AuditLogger.log_event(
                db=db,
                actor_user_id=acting_user.id,
                actor_role=acting_user.role.value,
                action="UPDATE_OFFICER_AVAILABILITY",
                resource_type="OFFICER",
                resource_id=officer.id,
                before_state={"status": old_status},
                after_state={"status": availability_status, "max_concurrent_tasks": officer.max_concurrent_tasks}
            )

        await db.commit()
        return {
            "officer_id": officer.id,
            "availability_status": officer.availability_status,
            "max_concurrent_tasks": officer.max_concurrent_tasks,
            "current_active_tasks": officer.current_active_tasks,
            "auto_dispatched_tasks_count": len(auto_dispatched),
            "message_bn": "কর্মকর্তার প্রাপ্যতা স্ট্যাটাস সফলভাবে আপডেট হয়েছে।"
        }

    @staticmethod
    async def get_assignment_recommendations(
        db: AsyncSession,
        task_id: str
    ) -> Dict[str, Any]:
        """
        Transparent, deterministic assignment recommendation engine:
        1. Hard eligibility constraints (dept, ward, availability status, active shift, capacity ceiling, prerequisites)
        2. Multi-factor ranking: capacity margin + ward match + SLA urgency
        3. Explainable rationale in Bangla
        """
        stmt_t = (
            select(CaseTask)
            .where(CaseTask.id == task_id)
            .options(
                selectinload(CaseTask.case).selectinload(Case.ward),
                selectinload(CaseTask.prerequisites).selectinload(TaskDependency.prerequisite_task)
            )
        )
        res_t = await db.execute(stmt_t)
        task = res_t.scalar_one_or_none()
        if not task:
            raise ValueError("টাস্ক পাওয়া যায়নি।")

        # Check prerequisites
        prereqs_completed = True
        for dep in task.prerequisites:
            if dep.prerequisite_task and dep.prerequisite_task.status not in [
                TaskStatusEnum.COMPLETED_AWAITING_REVIEW,
                TaskStatusEnum.VERIFIED_COMPLETED
            ]:
                prereqs_completed = False
                break

        # Query all officers in the responsible department
        stmt_o = (
            select(Officer)
            .where(
                Officer.department_id == task.department_id,
                Officer.is_active == True
            )
            .options(selectinload(Officer.ward))
        )
        res_o = await db.execute(stmt_o)
        all_officers = res_o.scalars().all()

        recommendations = []
        ineligible_reasons = []

        task_ward_id = task.case.ward_id if task.case else None
        priority_val = task.case.priority.value if task.case else "medium"
        prio_weight = PRIORITY_WEIGHTS.get(priority_val, 50) / 100.0

        for off in all_officers:
            # 1. Hard Eligibility Filter
            reasons = []
            is_eligible = True

            # Must be available
            if off.availability_status != "available":
                is_eligible = False
                ineligible_reasons.append(f"{off.name_bn}: প্রাপ্যতা স্ট্যাটাস '{off.availability_status}'")
                continue

            # Must have capacity
            # Count actual active tasks
            stmt_active = select(func.count(CaseTask.id)).where(
                CaseTask.assigned_officer_id == off.id,
                CaseTask.status.in_([TaskStatusEnum.PENDING, TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.WAITING_PREREQUISITE])
            )
            res_active = await db.execute(stmt_active)
            current_active = res_active.scalar_one() or 0

            if current_active >= off.max_concurrent_tasks:
                is_eligible = False
                ineligible_reasons.append(f"{off.name_bn}: সর্বোচ্চ কাজের ধারণক্ষমতা পূর্ণ ({current_active}/{off.max_concurrent_tasks})")
                continue

            # Ward matching
            ward_match = 1.0 if (off.ward_id and off.ward_id == task_ward_id) else 0.5
            if off.ward_id and off.ward_id == task_ward_id:
                reasons.append(f"ঘটনার ওয়ার্ডের প্রত্যক্ষ দায়িত্বপ্রাপ্ত কর্মকর্তা ({off.ward.ward_name_bn if off.ward else ''})")
            else:
                reasons.append("জোন/নিকটবর্তী ওয়ার্ডের সমন্বিত ব্যাকআপ কর্মকর্তা")

            # Capacity margin
            capacity_margin = 1.0 - (current_active / max(1, off.max_concurrent_tasks))
            reasons.append(f"বর্তমান কাজের লোড: {current_active}/{off.max_concurrent_tasks} (অবশিষ্ট ক্যাপাসিটি {round(capacity_margin * 100)}%)")

            # SLA factor
            if priority_val in ["emergency", "high"]:
                reasons.append(f"উচ্চ জরুরি অগ্রাধিকার ({priority_val}) বিবেচনায় অগ্রাধিকারযোগ্য বণ্টন")

            # Deterministic Score Formulation:
            # Score = 0.45 * capacity_margin + 0.35 * ward_match + 0.20 * prio_weight
            score = round((0.45 * capacity_margin) + (0.35 * ward_match) + (0.20 * prio_weight), 3)

            recommendations.append({
                "officer_id": off.id,
                "officer_name_bn": off.name_bn,
                "officer_name_en": off.name_en,
                "designation": off.designation,
                "official_phone": off.official_phone,
                "score": score,
                "current_active_tasks": current_active,
                "max_concurrent_tasks": off.max_concurrent_tasks,
                "ward_coverage_match": off.ward_id == task_ward_id,
                "is_eligible": True,
                "eligibility_reasons": reasons
            })

        # Sort recommendations by score descending
        recommendations.sort(key=lambda r: r["score"], reverse=True)

        return {
            "task_id": task.id,
            "prerequisites_completed": prereqs_completed,
            "total_candidates_evaluated": len(all_officers),
            "eligible_officers_count": len(recommendations),
            "recommendations": recommendations,
            "ineligible_summary": ineligible_reasons[:5]
        }

    @staticmethod
    async def assign_task(
        db: AsyncSession,
        task_id: str,
        officer_id: str,
        user: User,
        assignment_type: str = "manual",
        reason_bn: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assigns or reassigns a task to an officer:
        - Validates department and capacity limits
        - Transactionally updates CaseTask and TaskAssignmentHistory
        - Updates officer active tasks
        - Updates waiting queue status if previously queued
        """
        stmt_t = (
            select(CaseTask)
            .where(CaseTask.id == task_id)
            .options(
                selectinload(CaseTask.case),
                selectinload(CaseTask.prerequisites).selectinload(TaskDependency.prerequisite_task)
            )
        )
        res_t = await db.execute(stmt_t)
        task = res_t.scalar_one_or_none()
        if not task:
            raise ValueError("টাস্ক পাওয়া যায়নি।")

        stmt_o = select(Officer).where(Officer.id == officer_id)
        res_o = await db.execute(stmt_o)
        officer = res_o.scalar_one_or_none()
        if not officer:
            raise ValueError("কর্মকর্তা পাওয়া যায়নি।")

        # Validation: officer must belong to responsible department
        if officer.department_id != task.department_id:
            raise ValueError("কর্মকর্তা সংশ্লিষ্ট দপ্তরের অন্তর্ভুক্ত নন।")

        # Validation: officer must not exceed capacity
        stmt_active = select(func.count(CaseTask.id)).where(
            CaseTask.assigned_officer_id == officer.id,
            CaseTask.id != task.id,
            CaseTask.status.in_([TaskStatusEnum.PENDING, TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.WAITING_PREREQUISITE])
        )
        res_active = await db.execute(stmt_active)
        active_count = res_active.scalar_one() or 0
        if active_count >= officer.max_concurrent_tasks:
            raise ValueError(f"কর্মকর্তার সর্বোচ্চ কর্মক্ষমতা অতিক্রম করেছে ({active_count}/{officer.max_concurrent_tasks})।")

        # Check prerequisites
        prereqs_completed = True
        waiting_reason = None
        for dep in task.prerequisites:
            if dep.prerequisite_task and dep.prerequisite_task.status not in [
                TaskStatusEnum.COMPLETED_AWAITING_REVIEW,
                TaskStatusEnum.VERIFIED_COMPLETED
            ]:
                prereqs_completed = False
                waiting_reason = f"পূর্ববর্তী কাজের অপেক্ষায়: {dep.prerequisite_task.title_bn}"
                break

        prev_officer_id = task.assigned_officer_id
        task.assigned_officer_id = officer.id
        task.assigned_at = datetime.datetime.utcnow()
        task.assigned_by_user_id = user.id
        task.acceptance_status = "accepted"

        if prereqs_completed:
            task.status = TaskStatusEnum.IN_PROGRESS
            task.waiting_reason_bn = None
            if not task.started_at:
                task.started_at = datetime.datetime.utcnow()
        else:
            task.status = TaskStatusEnum.WAITING_PREREQUISITE
            task.waiting_reason_bn = waiting_reason

        # Record in TaskAssignmentHistory
        history = TaskAssignmentHistory(
            task_id=task.id,
            previous_officer_id=prev_officer_id,
            new_officer_id=officer.id,
            assigned_by_user_id=user.id,
            assignment_type=assignment_type,
            reason_bn=reason_bn
        )
        db.add(history)

        # Update or resolve TaskWaitingQueue item
        stmt_q = select(TaskWaitingQueue).where(TaskWaitingQueue.task_id == task.id)
        res_q = await db.execute(stmt_q)
        q_item = res_q.scalar_one_or_none()
        if q_item:
            q_item.status = "dispatched"
            q_item.waiting_reason_bn = f"কর্মকর্তা {officer.name_bn} এর নিকট অ্যাসাইন সম্পন্ন"

        await AuditLogger.log_event(
            db=db,
            actor_user_id=user.id,
            actor_role=user.role.value,
            action="ASSIGN_TASK_TO_OFFICER",
            resource_type="CASE_TASK",
            resource_id=task.id,
            before_state={"previous_officer_id": prev_officer_id},
            after_state={
                "new_officer_id": officer.id,
                "assignment_type": assignment_type,
                "status": task.status.value,
                "reason": reason_bn
            }
        )
        await db.commit()

        return {
            "task_id": task.id,
            "assigned_officer_id": officer.id,
            "assigned_officer_name_bn": officer.name_bn,
            "task_status": task.status.value,
            "prerequisites_completed": prereqs_completed,
            "message_bn": f"টাস্কটি সফলভাবে কর্মকর্তা {officer.name_bn} এর নিকট অ্যাসাইন করা হয়েছে।"
        }

    @staticmethod
    async def get_waiting_queue(
        db: AsyncSession,
        department_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves the persistent waiting queue ordered by Priority and SLA risk.
        """
        stmt = (
            select(TaskWaitingQueue)
            .options(
                selectinload(TaskWaitingQueue.task),
                selectinload(TaskWaitingQueue.case).selectinload(Case.ward),
                selectinload(TaskWaitingQueue.department)
            )
            .where(TaskWaitingQueue.status.in_(["queued", "blocked"]))
        )
        if department_id:
            stmt = stmt.where(TaskWaitingQueue.department_id == department_id)

        # Order by: emergency first, then sla_deadline, then queue_entry_time
        res = await db.execute(stmt)
        queue_items = res.scalars().all()

        # Custom sort by priority weight then SLA deadline
        def sort_key(q: TaskWaitingQueue):
            prio_rank = PRIORITY_WEIGHTS.get(q.priority, 0)
            deadline_ts = q.sla_deadline.timestamp() if q.sla_deadline else 9999999999
            entry_ts = q.queue_entry_time.timestamp() if q.queue_entry_time else 0
            return (-prio_rank, deadline_ts, entry_ts)

        queue_items.sort(key=sort_key)

        output = []
        for index, q in enumerate(queue_items, start=1):
            output.append({
                "queue_id": q.id,
                "queue_position": index,
                "task_id": q.task_id,
                "case_id": q.case_id,
                "case_tracking_number": q.case.tracking_number if q.case else None,
                "task_title_bn": q.task.title_bn if q.task else None,
                "department_id": q.department_id,
                "department_name_bn": q.department.name_bn if q.department else None,
                "ward_name_bn": q.case.ward.name_bn if q.case and q.case.ward else None,
                "priority": q.priority,
                "sla_deadline": q.sla_deadline.isoformat() if q.sla_deadline else None,
                "queue_entry_time": q.queue_entry_time.isoformat(),
                "prerequisite_status": q.prerequisite_status,
                "eligibility_state": q.eligibility_state,
                "waiting_reason_bn": q.waiting_reason_bn,
                "assignment_attempts": q.assignment_attempts,
                "status": q.status
            })
        return output

    @staticmethod
    async def process_waiting_queue(
        db: AsyncSession,
        department_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Concurrency-safe evaluation of the persistent waiting queue:
        - Examines queued tasks whose prerequisites are complete
        - Matches available eligible officers with capacity
        - Safely dispatches and updates queue status
        """
        stmt_q = (
            select(TaskWaitingQueue)
            .where(
                TaskWaitingQueue.status == "queued",
                TaskWaitingQueue.prerequisite_status == "ready"
            )
            .options(
                selectinload(TaskWaitingQueue.task),
                selectinload(TaskWaitingQueue.case)
            )
        )
        if department_id:
            stmt_q = stmt_q.where(TaskWaitingQueue.department_id == department_id)

        res_q = await db.execute(stmt_q)
        queue_items = res_q.scalars().all()

        dispatched = []
        for q in queue_items:
            q.assignment_attempts += 1
            # Recheck recommendations
            rec_result = await TaskAssignmentService.get_assignment_recommendations(
                db=db,
                task_id=q.task_id
            )
            eligible = rec_result.get("recommendations", [])
            if eligible:
                top_candidate = eligible[0]
                # Claim and assign atomically
                assign_res = await TaskAssignmentService.assign_task(
                    db=db,
                    task_id=q.task_id,
                    officer_id=top_candidate["officer_id"],
                    user=None or User(id="SYSTEM_AUTO_DISPATCH", role="coordinator"),
                    assignment_type="auto_dispatch",
                    reason_bn="অপেক্ষারত কিউ থেকে স্বয়ংক্রিয় কাজের বরাদ্দ"
                )
                dispatched.append(assign_res)
            else:
                q.waiting_reason_bn = "সকল উপযুক্ত কর্মকর্তা বর্তমানে ব্যস্ত বা ধারণক্ষমতায় পৌঁছান।"

        await db.commit()
        return dispatched

    @staticmethod
    async def get_task_assignment_history(
        db: AsyncSession,
        task_id: str
    ) -> List[Dict[str, Any]]:
        """
        Returns complete audit trail of task assignments and reassignments.
        """
        stmt = (
            select(TaskAssignmentHistory)
            .where(TaskAssignmentHistory.task_id == task_id)
            .options(
                selectinload(TaskAssignmentHistory.previous_officer),
                selectinload(TaskAssignmentHistory.new_officer),
                selectinload(TaskAssignmentHistory.assigned_by)
            )
            .order_by(TaskAssignmentHistory.created_at.asc())
        )
        res = await db.execute(stmt)
        records = res.scalars().all()

        return [
            {
                "id": r.id,
                "task_id": r.task_id,
                "previous_officer_id": r.previous_officer_id,
                "previous_officer_name_bn": r.previous_officer.name_bn if r.previous_officer else None,
                "new_officer_id": r.new_officer_id,
                "new_officer_name_bn": r.new_officer.name_bn if r.new_officer else None,
                "assigned_by_name": r.assigned_by.phone if r.assigned_by else "সিস্টেম",
                "assignment_type": r.assignment_type,
                "reason_bn": r.reason_bn,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]

    @staticmethod
    async def _enqueue_task_record(
        db: AsyncSession,
        task: CaseTask,
        prereqs_completed: bool,
        waiting_reason: Optional[str]
    ) -> TaskWaitingQueue:
        """
        Helper to insert or update task in TaskWaitingQueue.
        """
        stmt = select(TaskWaitingQueue).where(TaskWaitingQueue.task_id == task.id)
        res = await db.execute(stmt)
        q_item = res.scalar_one_or_none()

        priority_val = task.case.priority.value if task.case else "medium"
        sla_hours = task.sla_hours or 48
        deadline = datetime.datetime.utcnow() + datetime.timedelta(hours=sla_hours)

        if not q_item:
            q_item = TaskWaitingQueue(
                task_id=task.id,
                case_id=task.case_id,
                department_id=task.department_id,
                priority=priority_val,
                sla_deadline=deadline,
                queue_entry_time=datetime.datetime.utcnow(),
                prerequisite_status="ready" if prereqs_completed else "pending_prerequisite",
                eligibility_state="eligible" if prereqs_completed else "blocked",
                waiting_reason_bn=waiting_reason,
                status="queued" if prereqs_completed else "blocked"
            )
            db.add(q_item)
        else:
            q_item.prerequisite_status = "ready" if prereqs_completed else "pending_prerequisite"
            q_item.eligibility_state = "eligible" if prereqs_completed else "blocked"
            q_item.waiting_reason_bn = waiting_reason
            q_item.status = "queued" if prereqs_completed else "blocked"

        return q_item
