export interface GeminiCure {
  name: string;
  application: string;
  warning: string;
}

export interface GeminiTreatmentPlan {
  inorganic_cure: GeminiCure[];
  organic_cure: GeminiCure[];
}

export interface GeminiTreatmentSchedule {
  week: string;
  activity: string;
}

export interface DiseaseInfo {
  diagnosis_description: string;
  key_symptoms: string[];
  treatment_plan: GeminiTreatmentPlan;
  treatment_schedule: GeminiTreatmentSchedule[];
}

export interface DecisionRecommendation {
  decision: string;
  reason: string;
  priority: string; // Critical, High, Medium, Low
  recommended_time: string;
  estimated_duration: string;
  expected_benefit: string;
  risk_if_ignored: string;
}

export interface TreatmentOption {
  category: string; // Economy, Balanced, Premium
  medicine: string;
  cost: string;
  effectiveness: string;
  recovery_time: string;
  availability: string;
  government_recommended: boolean;
  organic: boolean;
}

export interface Dosage {
  farm_area: number;
  area_unit: string;
  medicine_quantity: number;
  medicine_unit: string;
  water_quantity: number;
  water_unit: string;
  spray_interval: string;
  estimated_cost: number;
}

export interface PlannerTask {
  task: string;
  category: string; // Action, Monitoring, Preparation
  priority: string;
  recommended_date: string;
  estimated_duration: string;
  reason: string;
}

export interface CaseDetails {
  case_id: string;
  status: string;
  disease: string;
  confidence: number;
}

export interface CropHealthDecisionResponse {
  prediction: string;
  confidence: number;
  top_predictions: Record<string, number>;
  disease_info: DiseaseInfo | null;
  weather_summary: any;
  decision_recommendations: DecisionRecommendation[];
  treatment_options: TreatmentOption[];
  dosage: Dosage | null;
  planner_tasks: PlannerTask[];
  case_details: CaseDetails;
  follow_up_schedule: string;
  model_version: string;
  inference_time_ms: number;
}
