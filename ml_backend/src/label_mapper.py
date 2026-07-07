import yaml
import os
import shutil

class LabelMapper:
    def __init__(self, mapping_file=None):
        if mapping_file is None:
            mapping_file = os.path.join(os.path.dirname(__file__), "..", "configs", "label_mapping.yaml")
        with open(mapping_file, "r") as f:
            self.config = yaml.safe_load(f)
            
        self.mapping = self.config.get("mapping", {})
        self.unsupported = set(self.config.get("unsupported_crops", []))
        
    def get_standardized_label(self, raw_folder_name):
        """Returns (crop, disease) tuple or (None, None) if unsupported"""
        
        # Check if explicitly unsupported
        for unsupp in self.unsupported:
            if unsupp.lower() in raw_folder_name.lower():
                return None, None
                
        if raw_folder_name in self.mapping:
            mapped_val = self.mapping[raw_folder_name]
            if "___" in mapped_val:
                crop, disease = mapped_val.split("___")
                return crop.lower(), disease
            else:
                disease = mapped_val
                crop = raw_folder_name.split("___")[0].split("_")[0].lower()
                return crop, disease
            
        # Fallback heuristic logic
        parts = raw_folder_name.replace("___", "_").split("_")
        crop = parts[0].lower()
        if crop.capitalize() in self.unsupported:
            return None, None
            
        disease = "_".join(parts[1:]).lower()
        if not disease:
            disease = "unknown"
            
        return crop, disease

if __name__ == "__main__":
    # Simple test
    mapper = LabelMapper()
    print(mapper.get_standardized_label("Tomato___Early_blight"))
    print(mapper.get_standardized_label("Apple___Apple_scab"))
