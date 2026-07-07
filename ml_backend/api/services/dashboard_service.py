from api.db.database import SessionLocal
from api.db.models import DiagnosisCase, PlannerTask, Notification
from sqlalchemy import func

class DashboardService:
    def get_overview(self):
        db = SessionLocal()
        try:
            active_cases = db.query(DiagnosisCase).filter(DiagnosisCase.status.in_(["Open", "Monitoring", "Escalated"])).count()
            recovered_cases = db.query(DiagnosisCase).filter(DiagnosisCase.status == "Recovered").count()
            
            # Simple Health Score Algorithm
            base_score = 100
            score = max(0, base_score - (active_cases * 5))
            if recovered_cases > active_cases:
                score = min(100, score + 10)
                
            color = "green" if score > 80 else "yellow" if score > 50 else "red"
            reason = f"{active_cases} active disease(s) under treatment."
            if score < 50:
                reason = f"Critical condition: {active_cases} active cases needing immediate attention."

            return {
                "health_score": {
                    "score": score,
                    "color": color,
                    "reason": reason,
                    "suggestions": ["Ensure timely application of all recommended treatments."]
                },
                "active_cases": active_cases,
                "recovered_cases": recovered_cases,
                "high_priority_tasks": db.query(PlannerTask).filter(PlannerTask.is_completed == False, PlannerTask.priority == "High").count()
            }
        finally:
            db.close()

dashboard_service = DashboardService()
