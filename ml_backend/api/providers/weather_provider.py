from abc import ABC, abstractmethod
from api.schemas.decision import WeatherSummary

class WeatherProvider(ABC):
    @abstractmethod
    def get_current_weather(self, location_id: str) -> WeatherSummary:
        pass
