from api.events.event_bus import event_bus, DomainEvent
from api.services.notification_service import notification_service

def handle_case_opened(event: DomainEvent):
    payload = event.payload
    farmer_id = payload.get("farmer_id")
    disease = payload.get("disease")
    
    if farmer_id:
        notification_service.send_notification(
            farmer_id=farmer_id,
            title="New Disease Diagnosed",
            message=f"A new case has been opened for {disease}. Please check your action plan.",
            priority="High"
        )

def handle_case_escalated(event: DomainEvent):
    payload = event.payload
    farmer_id = payload.get("farmer_id")
    
    if farmer_id:
        notification_service.send_notification(
            farmer_id=farmer_id,
            title="Case Escalated",
            message="Your crop condition has worsened or spread. Immediate action required.",
            priority="High"
        )

def handle_case_recovered(event: DomainEvent):
    payload = event.payload
    farmer_id = payload.get("farmer_id")
    
    if farmer_id:
        notification_service.send_notification(
            farmer_id=farmer_id,
            title="Crop Recovered",
            message="Congratulations! Your crop has successfully recovered.",
            priority="Low"
        )

# Register Handlers
event_bus.subscribe("CaseOpened", handle_case_opened)
event_bus.subscribe("CaseEscalated", handle_case_escalated)
event_bus.subscribe("CaseRecovered", handle_case_recovered)
