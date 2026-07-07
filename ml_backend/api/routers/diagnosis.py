from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import io
from PIL import Image

from api.services.inference_engine import InferenceEngine

router = APIRouter(prefix="/api/v1/diagnosis", tags=["Diagnosis"])
engine = InferenceEngine()

@router.post("/predict")
async def predict(
    image: UploadFile = File(...),
    crop: str = Form(...)
):
    try:
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file format")
        
    try:
        response = engine.predict(crop, pil_image)
        return response
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
