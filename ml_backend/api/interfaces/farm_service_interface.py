from abc import ABC, abstractmethod
from typing import Dict, Any

class FarmServiceInterface(ABC):
    @abstractmethod
    def get_farm_details(self, farm_id: str) -> Dict[str, Any]:
        """
        Retrieves farm details such as crop, area, season, location, and farmer_id.
        """
        pass
