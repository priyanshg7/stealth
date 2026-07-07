from pydantic import BaseModel
from typing import Optional, Dict, Any
from api.schemas.decision import WeatherSummary

class DiagnosisContext(BaseModel):
    farm_id: str
    crop: str
    farm_area: float
    area_unit: str
    growth_stage: str
    current_season: str
    weather: WeatherSummary
    disease: str
    confidence: float
    kb_data: Optional[Dict[str, Any]]

class DiagnosisContextBuilder:
    def __init__(self):
        self.context = {}
        
    def with_farm_info(self, farm_id: str, crop: str, area: float, unit: str):
        self.context['farm_id'] = farm_id
        self.context['crop'] = crop
        self.context['farm_area'] = area
        self.context['area_unit'] = unit
        self.context['growth_stage'] = "Vegetative" # Mock default
        self.context['current_season'] = "Kharif" # Mock default
        return self
        
    def with_diagnosis(self, disease: str, confidence: float):
        self.context['disease'] = disease
        self.context['confidence'] = confidence
        return self
        
    def with_weather(self, weather: WeatherSummary):
        self.context['weather'] = weather
        return self
        
    def with_knowledge(self, kb_data: Optional[Dict[str, Any]]):
        self.context['kb_data'] = kb_data
        return self
        
    def build(self) -> DiagnosisContext:
        return DiagnosisContext(**self.context)
