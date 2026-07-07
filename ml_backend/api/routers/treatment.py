from fastapi import APIRouter, HTTPException, Query
from api.services.gemini_service import gemini_service
from api.schemas.decision import GeminiDiseaseInfo

router = APIRouter(prefix="/api/v1/treatment", tags=["Treatment Plan"])

@router.get("/plan", response_model=GeminiDiseaseInfo)
async def get_treatment_plan(
    disease: str = Query(..., description="Diagnosed disease name"),
    crop: str = Query(..., description="Crop type"),
    location: str = Query("India", description="Farm location"),
):
    """
    Generate an AI-powered treatment plan for a diagnosed crop disease using Gemini.
    """
    try:
        result = gemini_service.generate_treatment_plan(
            crop=crop,
            disease=disease,
            location=location,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate treatment plan: {str(e)}")
