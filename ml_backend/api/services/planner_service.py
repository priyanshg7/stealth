from typing import List
from api.schemas.decision import PlannerTask
from api.repositories.knowledge_repository import knowledge_repository

def generate_planner_tasks(crop: str, disease: str) -> List[PlannerTask]:
    is_healthy = "healthy" in disease.lower()
    
    if is_healthy:
        return [
            PlannerTask(
                task="Maintain Schedule",
                priority="Low",
                recommended_date="Day 0",
                estimated_duration="Ongoing",
                category="Maintenance",
                reason="Crop is healthy."
            ),
            PlannerTask(
                task="Routine Inspection",
                priority="Medium",
                recommended_date="Day 14",
                estimated_duration="2 Hours",
                category="Monitoring",
                reason="Ensure no new symptoms appear."
            )
        ]
        
    followup_days = knowledge_repository.get_followup_schedule(crop, disease)
    
    return [
        PlannerTask(
            task="Apply Treatment",
            priority="Critical",
            recommended_date="Day 0",
            estimated_duration="Depends on area",
            category="Action",
            reason="Halt disease spread immediately."
        ),
        PlannerTask(
            task="Inspect Lower Leaves",
            priority="High",
            recommended_date="Day 3",
            estimated_duration="1 Hour",
            category="Monitoring",
            reason="Check for early signs of treatment failure."
        ),
        PlannerTask(
            task="Upload Follow-up Image",
            priority="High",
            recommended_date=f"Day {followup_days}",
            estimated_duration="15 Minutes",
            category="Diagnosis",
            reason="Evaluate recovery status digitally."
        ),
        PlannerTask(
            task="Close Case",
            priority="Medium",
            recommended_date=f"Day {followup_days + 7}",
            estimated_duration="5 Minutes",
            category="Management",
            reason="Finalize successful recovery."
        )
    ]
