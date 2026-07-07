import random
from api.providers.weather_provider import WeatherProvider
from api.schemas.decision import WeatherSummary

class MockWeatherProvider(WeatherProvider):
    def get_current_weather(self, location_id: str) -> WeatherSummary:
        # Mock randomized weather for demonstration
        temp = random.uniform(20.0, 35.0)
        humidity = random.uniform(40.0, 95.0)
        rain_prob = random.uniform(0.0, 100.0)
        wind = random.uniform(0.0, 25.0)
        
        spray = "Poor" if rain_prob > 50 or wind > 15 else "Good"
        irrigation = "Not Required" if rain_prob > 60 else "Recommended"
        spread = "High" if humidity > 80 and temp > 25 else "Low"
        
        return WeatherSummary(
            temperature_c=round(temp, 1),
            humidity_percent=round(humidity, 1),
            rain_probability_percent=round(rain_prob, 1),
            wind_speed_kmh=round(wind, 1),
            spray_suitability=spray,
            irrigation_suitability=irrigation,
            disease_spread_risk=spread
        )

class OpenWeatherProvider(WeatherProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def get_current_weather(self, location_id: str) -> WeatherSummary:
        # Template for future integration
        raise NotImplementedError("OpenWeather API integration pending.")
