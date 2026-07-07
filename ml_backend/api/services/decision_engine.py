from typing import List
from api.builders.diagnosis_context_builder import DiagnosisContext
from api.schemas.decision import DecisionRecommendation

class DecisionEngine:
    def generate_decisions(self, context: DiagnosisContext) -> List[DecisionRecommendation]:
        decisions = []
        is_healthy = "healthy" in context.disease.lower()
        
        # Rule 1: Spraying based on weather and disease
        if not is_healthy:
            if context.weather.spray_suitability == "Poor":
                decisions.append(DecisionRecommendation(
                    decision="Delay Spraying",
                    reason=f"High chance of rain ({context.weather.rain_probability_percent}%) or strong winds. Spraying now will wash away medicine.",
                    priority="High",
                    recommended_time="Wait for clear weather",
                    estimated_duration="N/A",
                    expected_benefit="Saves cost and ensures medicine effectiveness.",
                    risk_if_ignored="Wasted chemicals, zero disease control.",
                    confidence=0.95
                ))
            else:
                decisions.append(DecisionRecommendation(
                    decision="Spray Fungicide/Bactericide Today",
                    reason="Weather is optimal for chemical application.",
                    priority="High",
                    recommended_time="Early morning or late afternoon",
                    estimated_duration="2-4 Hours",
                    expected_benefit="Immediate halt to disease spreading.",
                    risk_if_ignored="Disease may spread rapidly to healthy plants.",
                    confidence=0.90
                ))
                
        # Rule 2: Irrigation
        if context.weather.irrigation_suitability == "Recommended":
            decisions.append(DecisionRecommendation(
                decision="Irrigate Crop",
                reason="Low rain probability and dry conditions detected.",
                priority="Medium",
                recommended_time="Evening",
                estimated_duration="Depends on farm size",
                expected_benefit="Prevents water stress.",
                risk_if_ignored="Reduced yield and weakened plant immunity.",
                confidence=0.85
            ))
        else:
            decisions.append(DecisionRecommendation(
                decision="Do Not Irrigate",
                reason="Sufficient moisture or upcoming rain detected.",
                priority="Low",
                recommended_time="N/A",
                estimated_duration="N/A",
                expected_benefit="Prevents waterlogging and root rot.",
                risk_if_ignored="Fungal diseases thrive in excess moisture.",
                confidence=0.90
            ))
            
        # Rule 3: Disease specific manual action
        if not is_healthy and context.weather.disease_spread_risk == "High":
             decisions.append(DecisionRecommendation(
                decision="Remove Infected Leaves",
                reason=f"High humidity ({context.weather.humidity_percent}%) accelerates spread. Manual removal isolates the pathogen.",
                priority="Critical",
                recommended_time="Immediately",
                estimated_duration="1 Day",
                expected_benefit="Physically removes pathogen source.",
                risk_if_ignored="Exponential spread across the entire farm.",
                confidence=0.95
            ))
             
        return decisions

decision_engine = DecisionEngine()
