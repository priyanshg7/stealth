import json
import os
import glob
from typing import Dict, Any, Optional, List

class KnowledgeRepository:
    def __init__(self, kb_dir: str = "knowledge_base"):
        self.kb_dir = kb_dir
        self.knowledge: Dict[str, Dict[str, Any]] = {}
        self._load_knowledge()
        
    def _load_knowledge(self):
        search_pattern = os.path.join(self.kb_dir, "*_knowledge.json")
        for filepath in glob.glob(search_pattern):
            filename = os.path.basename(filepath)
            crop_name = filename.replace("_knowledge.json", "")
            try:
                with open(filepath, "r") as f:
                    self.knowledge[crop_name] = json.load(f)
            except Exception as e:
                print(f"Failed to load knowledge for {crop_name}: {e}")

    def get_disease(self, crop: str, disease: str) -> Optional[Dict[str, Any]]:
        return self.knowledge.get(crop.lower(), {}).get(disease)
        
    def get_treatment(self, crop: str, disease: str) -> Optional[Dict[str, Any]]:
        info = self.get_disease(crop, disease)
        if not info:
            return None
        return {
            "organic": info.get("organic_treatment"),
            "chemical": info.get("chemical_treatment"),
            "products": info.get("recommended_products", []),
            "recovery_days": info.get("estimated_recovery_time_days", 0)
        }

    def get_followup_schedule(self, crop: str, disease: str) -> int:
        info = self.get_disease(crop, disease)
        if not info:
            return 7
        return 7 if info.get("dosage_per_acre", 0) > 0 else 14

    def get_prevention(self, crop: str, disease: str) -> List[str]:
        info = self.get_disease(crop, disease)
        if not info:
            return []
        return info.get("preventive_measures", [])

knowledge_repository = KnowledgeRepository()
