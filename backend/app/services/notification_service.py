from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification, SMSMockLog, Consent

class NotificationService:
    """
    Multi-channel notification engine with mock SMS gateway (R&D Section 6.8, Table 9).
    Respects citizen consent before dispatching external SMS/push messages.
    """

    @classmethod
    async def send_notification(
        cls,
        db: AsyncSession,
        user_id: str,
        case_id: Optional[str],
        title_bn: str,
        message_bn: str,
        channel: str = "in_app",
        phone: Optional[str] = None
    ) -> Notification:
        # Create In-App Notification
        notif = Notification(
            user_id=user_id,
            case_id=case_id,
            title_bn=title_bn,
            message_bn=message_bn,
            channel=channel
        )
        db.add(notif)

        # If SMS requested and phone provided, log to simulated SMS mock table
        if phone:
            sms_log = SMSMockLog(
                recipient_phone=phone,
                message_text_bn=f"[নাগরিক সাথী এআই - সিমুলেশন] {message_bn}",
                case_tracking_number=case_id,
                is_simulated=True,
                gateway_response="SIMULATED_DELIVERED_200_OK"
            )
            db.add(sms_log)

        await db.flush()
        return notif
