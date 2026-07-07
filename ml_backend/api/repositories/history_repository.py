import uuid
from typing import Dict, Any, List
from datetime import datetime
from api.schemas.case import Case, CaseDetails, CaseHistory
from api.schemas.decision import PlannerTask

class HistoryRepository:
    def __init__(self):
        # In-memory storage mimicking a PostgreSQL database
        self.cases: Dict[str, Case] = {}

    def create_case(self, farm_id: str, disease: str, confidence: float, planner_tasks: List[PlannerTask]) -> Case:
        case_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        details = CaseDetails(
            case_id=case_id,
            farm_id=farm_id,
            status="Open",
            disease=disease,
            confidence=confidence,
            created_at=now,
            updated_at=now,
            recovery_timeline_days=14
        )
        
        history_entry = CaseHistory(
            event_time=now,
            event_type="Diagnosis",
            description=f"Initial diagnosis: {disease} ({confidence*100:.1f}%)"
        )
        
        new_case = Case(
            case_details=details,
            active_planner=planner_tasks,
            treatment_options=None,
            history=[history_entry]
        )
        
        self.cases[case_id] = new_case
        return new_case

    def get_case(self, case_id: str) -> Case:
        return self.cases.get(case_id)

    def get_all_cases(self) -> List[Case]:
        return list(self.cases.values())

    def update_case_status(self, case_id: str, new_status: str, note: str):
        case = self.cases.get(case_id)
        if case:
            case.case_details.status = new_status
            case.case_details.updated_at = datetime.utcnow()
            case.history.append(CaseHistory(
                event_time=datetime.utcnow(),
                event_type="Status Change",
                description=f"Status changed to {new_status}. Note: {note}"
            ))
            
    def update_planner(self, case_id: str, new_tasks: List[PlannerTask]):
        case = self.cases.get(case_id)
        if case:
            case.active_planner = new_tasks
            case.case_details.updated_at = datetime.utcnow()
            case.history.append(CaseHistory(
                event_time=datetime.utcnow(),
                event_type="Planner Update",
                description="New action plan generated."
            ))

history_repository = HistoryRepository()
