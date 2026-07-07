from pydantic import BaseModel, Field
from typing import Optional

class FollowUpRequest(BaseModel):
    treatment_applied: str
    farmer_notes: str
    observed_symptoms: str
    recovery_status: str

class FollowUpResponse(BaseModel):
    case_id: str
    previous_disease: str
    current_disease: str
    condition_evaluation: str # Recovered, Improved, Stable, Worsened, Escalated
    message: str
    new_planner_tasks: list
