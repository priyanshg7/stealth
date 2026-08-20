import json
import logging
from google import genai
from google.genai import types

from api.schemas.decision import GeminiDiseaseInfo

logger = logging.getLogger("kisanmitra_backend")

# Retrieve API key dynamically
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
API_KEY = os.environ.get("GEMINI_API_KEY")

class GeminiService:
    def __init__(self):
        self.api_key = API_KEY
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}")
                self.client = None
        else:
            self.client = None
        
    def generate_treatment_plan(self, crop: str, disease: str, location: str) -> GeminiDiseaseInfo:
        logger.info(f"Generating treatment plan via Gemini/Fallback for {crop} with {disease} at {location}")
        
        if self.client:
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

        # Return structured domain fallback response
        return GeminiDiseaseInfo(
            diagnosis_description=f"{disease.replace('_', ' ')} affecting {crop}. Spores spread easily under warm, humid weather.",
            key_symptoms=[
                "Discolored yellow or brown leaf lesions",
                "Necrotic leaf spots with concentric rings",
                "Foliage wilt and premature leaf drop"
            ],
            treatment_plan={
                "inorganic_cure": [
                    {
                        "name": "Propiconazole 25% EC", 
                        "application": "Apply foliar spray at 1 ml/L water every 10-14 days.", 
                        "warning": "Wear protective gloves and face mask during spray."
                    }
                ],
                "organic_cure": [
                    {
                        "name": "Neem Oil (Azadirachtin 10000 ppm)", 
                        "application": "Spray 3-5 ml/L water in late evening hours.", 
                        "warning": "Do not apply under intense mid-day heat."
                    }
                ]
            },
            treatment_schedule=[
                {"week": "Week 1", "activity": "Perform foliar spray application and monitor canopy"},
                {"week": "Week 2", "activity": "Re-inspect leaves for new lesions; re-apply if humidity remains high"}
            ]
        )


gemini_service = GeminiService()
