from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import io
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from api.orchestrators.diagnosis_orchestrator import DiagnosisOrchestrator
from api.schemas.responses import CropHealthDecisionResponse

router = APIRouter(prefix="/api/v1/diagnosis", tags=["Diagnosis"])
orchestrator = DiagnosisOrchestrator()

@router.post("/predict", response_model=CropHealthDecisionResponse)
async def predict(
    image: UploadFile = File(...),
    farm_id: str = Form(None),
    crop: str = Form(None),
    location: str = Form("Pratapgarh, Rajasthan")
):
    try:
        logger.info(f"Received inference request for crop: {crop}. Filename: {image.filename}")
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        logger.info(f"Successfully loaded image {image.filename} into PIL.")
    except Exception as e:
        logger.error(f"Failed to read or parse image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file format")
        
    try:
        # --- DEMO OVERRIDE ---
        if crop and crop.lower() == "wheat" and image.filename and "Screenshot 2026-07-07 151414" in image.filename:
            logger.info("DEMO OVERRIDE TRIGGERED: Forcing diagnosis orchestration for demo image.")
        # ---------------------
        
        response = orchestrator.process_diagnosis(farm_id, pil_image, crop, location)
        return response
    except ValueError as e:
        logger.error(f"Validation error in diagnosis: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Inference error in diagnosis: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

