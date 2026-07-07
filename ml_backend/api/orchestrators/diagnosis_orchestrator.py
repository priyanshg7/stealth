from api.services.inference_engine import InferenceEngine
from api.repositories.knowledge_repository import knowledge_repository
from api.providers.mock_weather_provider import MockWeatherProvider
from api.builders.diagnosis_context_builder import DiagnosisContextBuilder
from api.services.decision_engine import decision_engine
from api.services.treatment_service import get_treatment_options
from api.services.dosage_service import calculate_dosage
from api.services.planner_service import generate_planner_tasks
from api.services.case_manager import case_manager
from api.services.farm_service import farm_service
from api.services.gemini_service import gemini_service
from api.utils.logger import logger
from api.events.event_bus import event_bus, DomainEvent

from api.schemas.responses import CropHealthDecisionResponse, DosageSchema

class DiagnosisOrchestrator:
    def __init__(self):
        self.engine = InferenceEngine()
        self.weather_provider = MockWeatherProvider()
        
    def process_diagnosis(self, farm_id: str, pil_image, manual_crop: str = None, location: str = "Pratapgarh, Rajasthan") -> CropHealthDecisionResponse:
        logger.info(f"Starting diagnosis orchestration for farm {farm_id} with crop {manual_crop}")
        
        # 1. Fetch external context
        if farm_id and farm_id != "FARM-001":
            farm_details = farm_service.get_farm_details(farm_id)
            crop = manual_crop if manual_crop else farm_details["crop"]
            farm_area = farm_details["area"]
            area_unit = farm_details["area_unit"]
        else:
            # Fallback to manual selection or default to wheat
            crop = manual_crop if manual_crop else "wheat"
            farm_area = 2.5
            area_unit = "Acres"
            farm_id = farm_id if farm_id else "MANUAL-FARM-001"
        
        # 2. Prediction
        inference_result = self.engine.predict(crop, pil_image)
        disease = inference_result["disease"]
        confidence = inference_result["confidence"]
        logger.info(f"Predicted disease: {disease} ({confidence:.2f})")
        
        # Publish event
        event_bus.publish(DomainEvent("DiagnosisCreated", {"farm_id": farm_id, "disease": disease, "confidence": confidence}))
        
        # 3. Knowledge & Weather
        kb_info = knowledge_repository.get_disease(crop, disease)
        weather = self.weather_provider.get_current_weather(farm_id)
        
        # 4. Context Builder
        context = (DiagnosisContextBuilder()
            .with_farm_info(farm_id, crop, farm_area, area_unit)
            .with_diagnosis(disease, confidence)
            .with_weather(weather)
            .with_knowledge(kb_info)
            .build())
            
        # 5. Business Logic
        decisions = decision_engine.generate_decisions(context)
        treatment_options = get_treatment_options(crop, disease)
        dosage_data = calculate_dosage(farm_area, area_unit, crop, disease)
        planner_tasks = generate_planner_tasks(crop, disease)
        
        # 6. Database Case Creation
        case = case_manager.create_case(farm_id, disease, confidence, planner_tasks)
        logger.info(f"Created Database Case ID: {case.id}")
        
        # 7. Assembly (Using Gemini for Treatment Plan)
        disease_info = gemini_service.generate_treatment_plan(crop, disease, location)
            
        return CropHealthDecisionResponse(
            prediction=disease,
            confidence=confidence,
            top_predictions=inference_result["top_predictions"],
            disease_info=disease_info,
            weather_summary=weather,
            decision_recommendations=decisions,
            treatment_options=treatment_options,
            dosage=DosageSchema(**dosage_data) if dosage_data else None,
            planner_tasks=planner_tasks,
            case_details={
                "case_id": case.id, 
                "farm_id": case.farm_id,
                "status": case.status, 
                "disease": case.disease, 
                "confidence": case.confidence,
                "created_at": case.created_at,
                "updated_at": case.updated_at,
                "recovery_timeline_days": treatment_options.economy.recovery_time_days if treatment_options else 7
            },
            follow_up_schedule=f"Follow-up based on planner: Day {knowledge_repository.get_followup_schedule(crop, disease)}",
            model_version=inference_result["model_version"],
            inference_time_ms=inference_result["inference_time_ms"]
        )
