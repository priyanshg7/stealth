import json
import os

def generate_knowledge_base():
    registry_path = "models/metadata/registry.json"
    kb_dir = "knowledge_base"
    
    os.makedirs(kb_dir, exist_ok=True)
    
    with open(registry_path, "r") as f:
        registry = json.load(f)
        
    for entry in registry:
        crop = entry["crop"]
        classes = entry["classes"]
        
        crop_kb = {}
        for cls_name in classes:
            is_healthy = "healthy" in cls_name.lower()
            
            if is_healthy:
                crop_kb[cls_name] = {
                    "disease_name": "Healthy",
                    "scientific_name": "N/A",
                    "pathogen_type": "None",
                    "symptoms": ["No visible symptoms", "Vigorous growth"],
                    "cause": "Optimal conditions",
                    "spread_method": "None",
                    "crop_stage_affected": "All",
                    "risk_level": "None",
                    "organic_treatment": "Continue regular maintenance and observation.",
                    "chemical_treatment": "None required.",
                    "recommended_products": ["Standard NPK Fertilizers", "Neem Oil (preventative)"],
                    "dosage_per_acre": 0.0,
                    "water_requirement_liters_per_acre": 0.0,
                    "estimated_recovery_time_days": 0,
                    "preventive_measures": ["Crop rotation", "Maintain soil health", "Proper spacing"],
                    "safety_precautions": "Standard farming safety.",
                    "references": ["KisanMitra Internal Best Practices"]
                }
            else:
                formatted_name = cls_name.replace("_", " ").title()
                crop_kb[cls_name] = {
                    "disease_name": formatted_name,
                    "scientific_name": f"{formatted_name} pathogen spec.",
                    "pathogen_type": "Fungal / Bacterial / Viral (Pending Agronomist Review)",
                    "symptoms": ["Lesions on leaves", "Discoloration", "Stunted growth"],
                    "cause": "High humidity, infected soil, or pests.",
                    "spread_method": "Wind, water splash, or insect vectors.",
                    "crop_stage_affected": "Vegetative to Fruiting",
                    "risk_level": "Moderate to High",
                    "organic_treatment": f"Apply organic neem-based solutions or copper fungicides. Remove infected plant parts.",
                    "chemical_treatment": f"Spray broad-spectrum fungicide or bactericide approved for {crop.title()}.",
                    "recommended_products": ["Product A", "Product B"],
                    "dosage_per_acre": 1.5,
                    "water_requirement_liters_per_acre": 150.0,
                    "estimated_recovery_time_days": 14,
                    "preventive_measures": ["Avoid overhead watering", "Use resistant varieties", "Clear plant debris"],
                    "safety_precautions": "Wear PPE when spraying. Observe pre-harvest intervals.",
                    "references": ["Agricultural Extension Guidelines"]
                }
                
        out_file = os.path.join(kb_dir, f"{crop}_knowledge.json")
        with open(out_file, "w") as f:
            json.dump(crop_kb, f, indent=4)
            
        print(f"Generated {out_file} with {len(classes)} entries.")

if __name__ == "__main__":
    generate_knowledge_base()
