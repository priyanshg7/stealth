import json
import os
import glob
from typing import Dict, Any, Optional

class KnowledgeService:
    def __init__(self, kb_dir: str = "knowledge_base"):
        self.kb_dir = kb_dir
        self.knowledge: Dict[str, Dict[str, Any]] = {}
        self._load_knowledge()
        
    def _load_knowledge(self):
        """Loads all crop knowledge JSON files into memory."""
        search_pattern = os.path.join(self.kb_dir, "*_knowledge.json")
        for filepath in glob.glob(search_pattern):
            filename = os.path.basename(filepath)
            crop_name = filename.replace("_knowledge.json", "")
            
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    self.knowledge[crop_name] = data
            except Exception as e:
                print(f"Failed to load knowledge base for {crop_name}: {e}")

    def get_disease_info(self, crop: str, disease: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve structured information about a specific disease for a crop.
        """
        crop = crop.lower()
        if crop not in self.knowledge:
            return None
            
        return self.knowledge[crop].get(disease)

# Singleton instance
knowledge_service = KnowledgeService()
