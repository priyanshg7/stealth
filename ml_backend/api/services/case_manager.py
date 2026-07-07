from api.repositories.case_repository import case_repository
from api.schemas.decision import PlannerTask
from typing import List
from api.db.models import DiagnosisCase
from api.db.database import SessionLocal

class CaseManager:
    def create_case(self, farm_id: str, disease: str, confidence: float, planner_tasks: List[PlannerTask]) -> DiagnosisCase:
        db = SessionLocal()
        try:
            return case_repository.create_case(db, farm_id, disease, confidence, planner_tasks)
        finally:
            db.close()
            
    def get_case(self, case_id: str) -> DiagnosisCase:
        db = SessionLocal()
        try:
            return case_repository.get_case(db, case_id)
        finally:
            db.close()
            
    def get_all_cases(self) -> List[DiagnosisCase]:
        db = SessionLocal()
        try:
            return case_repository.get_all_cases(db)
        finally:
            db.close()
            
    def process_followup(self, case_id: str, current_disease: str, confidence: float, farmer_notes: str, farmer_id: str = None) -> str:
        db = SessionLocal()
        try:
            case = case_repository.get_case(db, case_id)
            if not case:
                return "Case not found."
                
            previous_disease = case.disease
            
            condition = "Stable"
            if "healthy" in current_disease.lower() and "healthy" not in previous_disease.lower():
                condition = "Recovered"
                case_repository.update_case_status(db, case_id, "Recovered", farmer_notes, farmer_id)
            elif current_disease != previous_disease and "healthy" not in current_disease.lower():
                condition = "Escalated"
                case_repository.update_case_status(db, case_id, "Escalated", f"Disease changed/spread to {current_disease}", farmer_id)
            else:
                condition = "Improved" if confidence < case.confidence else "Worsened"
                
            return condition
        finally:
            db.close()

case_manager = CaseManager()
