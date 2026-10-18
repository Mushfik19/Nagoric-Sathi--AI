from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.user import User
from app.models.notification import Notification, Consent
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notifications & Consents"])

class ConsentUpdateRequest(BaseModel):
    purpose: str
    is_granted: bool

@router.get("")
async def get_my_notifications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(desc(Notification.created_at))
    res = await db.execute(stmt)
    notifs = res.scalars().all()
    return [
        {
            "id": n.id,
            "case_id": n.case_id,
            "title_bn": n.title_bn,
            "message_bn": n.message_bn,
            "channel": n.channel,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        }
        for n in notifs
    ]

@router.post("/{notification_id}/mark-read")
async def mark_notification_read(notification_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id)
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"success": True}

@router.post("/consent")
async def update_consent(req: ConsentUpdateRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Consent).where(Consent.user_id == current_user.id, Consent.purpose == req.purpose)
    res = await db.execute(stmt)
    consent = res.scalar_one_or_none()
    if not consent:
        consent = Consent(user_id=current_user.id, purpose=req.purpose, is_granted=req.is_granted)
        db.add(consent)
    else:
        consent.is_granted = req.is_granted
    await db.commit()
    return {"message_bn": "সম্মতি সেটিংস সফলভাবে হালনাগাদ হয়েছে।"}
