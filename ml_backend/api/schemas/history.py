from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class DiagnosisRecord(BaseModel):
    farm_id: str = Field(..., description="Unique identifier for the farm")
    crop: str = Field(..., description="Crop type")
    disease: str = Field(..., description="Predicted disease name")
    confidence: float = Field(..., description="Confidence score of the prediction (0.0 to 1.0)")
    image_path: str = Field(..., description="S3 or local path to the uploaded image")
    prediction_timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time of prediction")
    
    # Nested data as JSON or related table fields
    treatment_applied: Optional[str] = Field(None, description="Treatment strategy adopted")
    medicine_dosage_liters: Optional[float] = Field(None, description="Applied medicine dosage in liters")
    
    planner_status: str = Field("pending", description="Status of the planner task (pending, in_progress, completed)")
    follow_up_status: str = Field("none", description="Follow-up action status")
    recovery_status: str = Field("unknown", description="Current recovery status of the crop")
