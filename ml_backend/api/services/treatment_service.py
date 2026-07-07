from api.repositories.knowledge_repository import knowledge_repository
from api.schemas.decision import TreatmentOptions, TreatmentOption

def get_treatment_options(crop: str, disease: str) -> TreatmentOptions:
    info = knowledge_repository.get_treatment(crop, disease)
    
    if not info:
        return None
        
    economy = TreatmentOption(
        tier="Economy",
        medicine=info.get("organic", "Basic local treatment"),
        cost_usd=15.0,
        recovery_time_days=info.get("recovery_days", 14) + 5,
        effectiveness="Moderate",
        organic_status=True,
        government_recommendation=False
    )
    
    balanced = TreatmentOption(
        tier="Balanced",
        medicine=info.get("chemical", "Standard chemical treatment"),
        cost_usd=35.0,
        recovery_time_days=info.get("recovery_days", 14),
        effectiveness="High",
        organic_status=False,
        government_recommendation=True
    )
    
    premium = TreatmentOption(
        tier="Premium",
        medicine=f"Premium imported variant of {info.get('chemical', 'fungicide')}",
        cost_usd=80.0,
        recovery_time_days=max(3, info.get("recovery_days", 14) - 4),
        effectiveness="Very High",
        organic_status=False,
        government_recommendation=True
    )
    
    return TreatmentOptions(economy=economy, balanced=balanced, premium=premium)
