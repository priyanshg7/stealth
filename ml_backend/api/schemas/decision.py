from pydantic import BaseModel
from typing import List, Optional

class GeminiCure(BaseModel):
    name: str
    application: str
    warning: str

class GeminiTreatmentPlan(BaseModel):
    inorganic_cure: List[GeminiCure]
    organic_cure: List[GeminiCure]

class GeminiTreatmentSchedule(BaseModel):
    week: str
    activity: str

class GeminiDiseaseInfo(BaseModel):
    diagnosis_description: str
    key_symptoms: List[str]
    treatment_plan: GeminiTreatmentPlan
    treatment_schedule: List[GeminiTreatmentSchedule]

class DecisionRecommendation(BaseModel):
    decision: str
    reason: str
    priority: str
    recommended_time: str
    estimated_duration: str
    expected_benefit: str
    risk_if_ignored: str
    confidence: float

class TreatmentOption(BaseModel):
    tier: str # Economy, Balanced, Premium
    medicine: str
    cost_usd: float
    recovery_time_days: int
    effectiveness: str
    organic_status: bool
    government_recommendation: bool

class TreatmentOptions(BaseModel):
    economy: TreatmentOption
    balanced: TreatmentOption
    premium: TreatmentOption

class PlannerTask(BaseModel):
    task: str
    priority: str
    recommended_date: str # e.g. Day 0, Day 3
    estimated_duration: str
    category: str
    reason: str

class WeatherSummary(BaseModel):
    temperature_c: float
    humidity_percent: float
    rain_probability_percent: float
    wind_speed_kmh: float
    spray_suitability: str
    irrigation_suitability: str
    disease_spread_risk: str
