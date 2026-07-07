from pydantic import BaseModel, Field
from typing import List, Optional

from api.schemas.decision import DecisionRecommendation, TreatmentOptions, PlannerTask, WeatherSummary, GeminiDiseaseInfo
from api.schemas.case import CaseDetails

class TopPrediction(BaseModel):
    disease: str
    confidence: float

class DosageSchema(BaseModel):
    medicine_quantity_liters: float
    water_quantity_liters: float
    estimated_cost_usd: float
    recommended_spray_interval_days: int
    maximum_safe_dosage_liters: float

class CropHealthDecisionResponse(BaseModel):
    prediction: str
    confidence: float
    top_predictions: List[TopPrediction]
    
    disease_info: Optional[GeminiDiseaseInfo] = None
    weather_summary: Optional[WeatherSummary] = None
    decision_recommendations: List[DecisionRecommendation] = []
    
    treatment_options: Optional[TreatmentOptions] = None
    dosage: Optional[DosageSchema] = None
    
    planner_tasks: List[PlannerTask] = []
    case_details: Optional[CaseDetails] = None
    
    follow_up_schedule: Optional[str] = None
    
    model_version: str
    inference_time_ms: int
    
class ModelInfo(BaseModel):
    crop: str
    version: str
    accuracy: float
    classes_supported: int

class ModelsResponse(BaseModel):
    available_models: List[ModelInfo]

class HealthResponse(BaseModel):
    status: str
    loaded_models: List[str]
    memory_usage_mb: float
    version: str
