from fastapi import APIRouter, HTTPException
import psutil
import os

from api.services.inference_engine import InferenceEngine
from api.schemas.responses import HealthResponse, ModelsResponse

router = APIRouter(prefix="/api/v1", tags=["System"])
engine = InferenceEngine()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    process = psutil.Process(os.getpid())
    memory_mb = process.memory_info().rss / 1024 / 1024
    
    return HealthResponse(
        status="healthy",
        loaded_models=list(engine.models.keys()),
        memory_usage_mb=round(memory_mb, 2),
        version="1.0.0"
    )

@router.get("/models", response_model=ModelsResponse)
async def list_models():
    models_info = []
    for crop, data in engine.registry.items():
        models_info.append({
            "crop": crop,
            "version": data.get("version", "1.0.0"),
            "accuracy": data.get("accuracy", 0.0),
            "classes_supported": len(data.get("classes", []))
        })
    return ModelsResponse(available_models=models_info)

@router.post("/reload")
async def reload_models():
    try:
        return engine.reload()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
