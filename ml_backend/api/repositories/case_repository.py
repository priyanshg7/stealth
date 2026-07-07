from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from api.db.models import DiagnosisCase, DiagnosisHistory, PlannerTask as DBPlannerTask
from api.schemas.decision import PlannerTask
from api.events.event_bus import event_bus, DomainEvent

class CaseRepository:
    def create_case(self, db: Session, farm_id: str, disease: str, confidence: float, planner_tasks: List[PlannerTask]) -> DiagnosisCase:
        db_case = DiagnosisCase(
            farm_id=farm_id,
            disease=disease,
            confidence=confidence,
            status="Open"
        )
        db.add(db_case)
        db.commit()
        db.refresh(db_case)
        
        # Add History
        db_history = DiagnosisHistory(
            case_id=db_case.id,
            event_type="Diagnosis",
            description=f"Initial diagnosis: {disease} ({confidence*100:.1f}%)"
        )
        db.add(db_history)
        
        # Add Planner Tasks
        for task in planner_tasks:
            db_task = DBPlannerTask(
                case_id=db_case.id,
                task=task.task,
                category=task.category,
                priority=task.priority,
                recommended_date=datetime.utcnow() # In reality, parse task.recommended_date string
            )
            db.add(db_task)
            
        db.commit()
        db.refresh(db_case)
        
        # Publish Domain Event
        event_bus.publish(DomainEvent("CaseOpened", {"case_id": db_case.id, "farm_id": farm_id, "disease": disease}))
        
        return db_case

    def get_case(self, db: Session, case_id: str) -> Optional[DiagnosisCase]:
        return db.query(DiagnosisCase).filter(DiagnosisCase.id == case_id).first()

    def get_all_cases(self, db: Session) -> List[DiagnosisCase]:
        return db.query(DiagnosisCase).all()

    def update_case_status(self, db: Session, case_id: str, new_status: str, note: str, farmer_id: str = None):
        case = self.get_case(db, case_id)
        if case:
            case.status = new_status
            
            history_entry = DiagnosisHistory(
                case_id=case_id,
                event_type="Status Change",
                description=f"Status changed to {new_status}. Note: {note}"
            )
            db.add(history_entry)
            db.commit()
            
            if new_status == "Recovered":
                event_bus.publish(DomainEvent("CaseRecovered", {"case_id": case_id, "farmer_id": farmer_id}))
            elif new_status == "Escalated":
                event_bus.publish(DomainEvent("CaseEscalated", {"case_id": case_id, "farmer_id": farmer_id}))

case_repository = CaseRepository()
