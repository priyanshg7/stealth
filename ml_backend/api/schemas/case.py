from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from api.schemas.decision import PlannerTask, TreatmentOptions

class CaseDetails(BaseModel):
    case_id: str
    farm_id: str
    status: str # Open, Treatment Scheduled, Monitoring, Recovered, Closed, Escalated
    disease: str
    confidence: float
    created_at: datetime
    updated_at: datetime
    recovery_timeline_days: int

class CaseHistory(BaseModel):
    event_time: datetime
    event_type: str # 'Diagnosis', 'Follow-up', 'Treatment Applied', 'Status Change'
    description: str

class Case(BaseModel):
    case_details: CaseDetails
    active_planner: List[PlannerTask]
    treatment_options: Optional[TreatmentOptions]
    history: List[CaseHistory]
