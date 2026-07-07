import json
import logging
from google import genai
from google.genai import types

from api.schemas.decision import GeminiDiseaseInfo

logger = logging.getLogger("kisanmitra_backend")

# Retrieve API key dynamically
import os
API_KEY = os.environ.get("GEMINI_API_KEY")

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=API_KEY)
        
    def generate_treatment_plan(self, crop: str, disease: str, location: str) -> GeminiDiseaseInfo:
        logger.info(f"Generating treatment plan via Gemini for {crop} with {disease} at {location}")
        
        prompt = f"""
        You are an expert agricultural scientist and agronomist.
        A farmer in {location} has identified {disease} on their {crop} crop.
        
        Provide a detailed treatment plan and diagnosis info exactly matching the required JSON schema.
        
        The diagnosis_description should be a thorough paragraph about the disease, how it affects the crop, its causes, and favorable weather conditions.
        The key_symptoms should be a list of 4-5 bullet points describing visual signs.
        The treatment_plan should have inorganic_cure and organic_cure, each being a list of specific medicines (e.g. Propiconazole 25% EC) with detailed 'application' instructions and 'warning' text.
        The treatment_schedule should be a week-by-week guide (e.g. Week 1, Week 2) on what activity to perform.
        
        Tailor the suggestions for the region ({location}) if applicable.
        """
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiDiseaseInfo,
                ),
            )
            
            result_json = json.loads(response.text)
            return GeminiDiseaseInfo(**result_json)
        except Exception as e:
            logger.error(f"Error generating treatment plan from Gemini: {str(e)}")
            # Return a fallback response
            return GeminiDiseaseInfo(
                diagnosis_description=f"{disease} is a disease affecting {crop}.",
                key_symptoms=["Visible spots", "Leaf discoloration"],
                treatment_plan={
                    "inorganic_cure": [{"name": "Standard Fungicide", "application": "Spray on leaves", "warning": "Wear mask"}],
                    "organic_cure": [{"name": "Neem Oil", "application": "Spray on leaves", "warning": "Avoid spraying in direct sunlight"}]
                },
                treatment_schedule=[
                    {"week": "Week 1", "activity": "Apply treatment and monitor"},
                    {"week": "Week 2", "activity": "Re-apply if symptoms persist"}
                ]
            )

gemini_service = GeminiService()
