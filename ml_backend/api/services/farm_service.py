from api.interfaces.farm_service_interface import FarmServiceInterface
from typing import Dict, Any

class MockFarmService(FarmServiceInterface):
    def get_farm_details(self, farm_id: str) -> Dict[str, Any]:
        """
        Mock implementation returning a deterministic farm based on ID.
        In the real system, this queries the KisanMitra Farm Module DB.
        """
        # Hardcoding logic purely to keep the ML repository independent during tests
        return {
            "farm_id": farm_id,
            "farmer_id": "farmer_12345",
            "name": f"Mock Farm {farm_id[:4]}",
            "crop": "wheat", 
            "area": 2.5,
            "area_unit": "Acres",
            "location": "Punjab",
            "season": "Rabi",
            "current_crop_stage": "Vegetative"
        }

farm_service = MockFarmService()
