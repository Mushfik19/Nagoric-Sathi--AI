import hashlib
import json
import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.audit import AuditLog

class AuditLogger:
    """
    Tamper-evident append-only audit logger implementing SHA-256 hash chaining (R&D Section 11.1, D5 Store).
    """

    @staticmethod
    async def log_event(
        db: AsyncSession,
        actor_user_id: Optional[str],
        actor_role: str,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        # 1. Fetch the latest audit record to get previous hash
        stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(1)
        result = await db.execute(stmt)
        latest_entry = result.scalar_one_or_none()
        
        previous_hash = latest_entry.current_hash if latest_entry else "GENESIS_HASH_NAGORIK_SATHI_2026"
        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # 2. Compute SHA-256 current hash
        hash_payload = {
            "previous_hash": previous_hash,
            "actor_user_id": actor_user_id or "ANONYMOUS",
            "actor_role": actor_role,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id or "",
            "after_state": after_state or {},
            "timestamp": now_ts,
            "reason": reason or ""
        }
        
        serialized = json.dumps(hash_payload, sort_keys=True)
        current_hash = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        
        # 3. Create and persist audit record
        audit_entry = AuditLog(
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            before_state=before_state,
            after_state=after_state,
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent,
            previous_hash=previous_hash,
            current_hash=current_hash
        )
        
        db.add(audit_entry)
        await db.flush()
        return audit_entry
