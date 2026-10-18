from typing import Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.system import SystemConfig, ApprovalRequest, ApprovalStatusEnum
from app.config import settings

class RoutingGateService:
    """
    Enforces the Safety Routing-Confidence Gate Policy (R&D Section 10.11, Figure 10, Table 33).
    - Confidence >= Gate & No Critical Flag -> Pre-filled proposal (Citizen confirms, Staff approves)
    - Confidence < Gate OR Critical Flag -> Mandatory Staff Verification
    - Gate changes: Administrator can raise gate; Lowering gate requires Dual Approval + Audit.
    """

    @classmethod
    async def get_current_gate_threshold(cls, db: AsyncSession) -> float:
        stmt = select(SystemConfig).where(SystemConfig.config_key == "routing_confidence_gate")
        result = await db.execute(stmt)
        config = result.scalar_one_or_none()
        if config and isinstance(config.config_value_json, dict):
            return float(config.config_value_json.get("threshold", settings.ROUTING_CONFIDENCE_GATE_DEFAULT))
        return settings.ROUTING_CONFIDENCE_GATE_DEFAULT

    @classmethod
    async def evaluate_safety_gate(
        cls,
        db: AsyncSession,
        confidence_score: float,
        is_hazard: bool,
        has_ownership_conflict: bool = False,
        is_unknown_ward: bool = False
    ) -> Dict[str, Any]:
        gate_threshold = await cls.get_current_gate_threshold(db)
        
        critical_flags = []
        if is_hazard:
            critical_flags.append("পাবলিক সেফটি হ্যাজার্ড (জরুরি ঝুঁকি)")
        if has_ownership_conflict:
            critical_flags.append("এসেট মালিকানা বিরোধ")
        if is_unknown_ward:
            critical_flags.append("অনির্ধারিত ভৌগোলিক এলাকা")

        has_critical_flag = len(critical_flags) > 0
        passes_confidence = confidence_score >= gate_threshold

        # Decision flow per Figure 11 & Table 33
        if has_critical_flag:
            action = "HARD_STOP_STAFF_VERIFICATION"
            can_propose = False
            message_bn = f"জরুরি ফ্ল্যাগ শনাক্ত হয়েছে: {', '.join(critical_flags)}। অবিলম্বে মানব পর্যালোচনা প্রয়োজন।"
        elif not passes_confidence:
            action = "MANUAL_STAFF_VERIFICATION"
            can_propose = False
            message_bn = f"এআই আস্থা স্কোর ({int(confidence_score*100)}%) সেফটি গেট ({int(gate_threshold*100)}%) এর নিচে।"
        else:
            action = "AI_PROPOSED_CITIZEN_CONFIRMATION"
            can_propose = True
            message_bn = f"এআই প্রস্তাবনা প্রস্তুত ({int(confidence_score*100)}% আস্থা)। নাগরিক ও ওয়ার্ড ডেস্ক নিশ্চিতকরণ প্রয়োজন।"

        return {
            "gate_threshold": gate_threshold,
            "confidence_score": confidence_score,
            "has_critical_flag": has_critical_flag,
            "critical_flags": critical_flags,
            "action": action,
            "can_propose": can_propose,
            "message_bn": message_bn
        }
