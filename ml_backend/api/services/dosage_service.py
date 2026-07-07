from api.repositories.knowledge_repository import knowledge_repository

def calculate_dosage(farm_area: float, unit: str, crop: str, disease: str) -> dict:
    unit = unit.lower()
    
    area_in_acres = farm_area
    if unit == 'hectares' or unit == 'hectare':
        area_in_acres = farm_area * 2.47105
    elif unit == 'bigha':
        area_in_acres = farm_area * 0.62 
        
    info = knowledge_repository.get_disease(crop, disease)
    if not info:
        medicine_per_acre = 0.0
        water_per_acre = 0.0
    else:
        medicine_per_acre = info.get("dosage_per_acre", 0.0)
        water_per_acre = info.get("water_requirement_liters_per_acre", 0.0)
        
    cost_per_liter = 15.0 
    
    total_medicine = area_in_acres * medicine_per_acre
    total_water = area_in_acres * water_per_acre
    total_cost = total_medicine * cost_per_liter
    
    spray_interval = 7 if total_medicine > 0 else 0
    max_safe = total_medicine * 1.2 # 20% buffer
    
    return {
        "medicine_quantity_liters": round(total_medicine, 2),
        "water_quantity_liters": round(total_water, 2),
        "estimated_cost_usd": round(total_cost, 2),
        "recommended_spray_interval_days": spray_interval,
        "maximum_safe_dosage_liters": round(max_safe, 2)
    }
