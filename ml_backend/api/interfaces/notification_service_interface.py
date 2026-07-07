from abc import ABC, abstractmethod

class NotificationServiceInterface(ABC):
    @abstractmethod
    def send_notification(self, farmer_id: str, title: str, message: str, priority: str = "Low"):
        """
        Sends a notification to the farmer (e.g. via Push, SMS, Email).
        """
        pass
