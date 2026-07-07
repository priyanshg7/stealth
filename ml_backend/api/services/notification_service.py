from api.interfaces.notification_service_interface import NotificationServiceInterface
from api.db.database import SessionLocal
from api.db.models import Notification

class MockNotificationService(NotificationServiceInterface):
    def send_notification(self, farmer_id: str, title: str, message: str, priority: str = "Low"):
        """
        In production, this would trigger Push/SMS.
        Here we simply log it to the database to ensure the dashboard can read it.
        """
        db = SessionLocal()
        try:
            notif = Notification(
                farmer_id=farmer_id,
                title=title,
                message=message,
                priority=priority
            )
            db.add(notif)
            db.commit()
        finally:
            db.close()

notification_service = MockNotificationService()
