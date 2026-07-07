export interface FarmDetails {
  farm_id: string;
  farmer_id: string;
  name: string;
  crop: string;
  area: number;
  area_unit: string;
  location: string;
  season: string;
  current_crop_stage: string;
}

export interface DashboardOverview {
  health_score: {
    score: number;
    color: string;
    reason: string;
    suggestions: string[];
  };
  active_cases: number;
  recovered_cases: number;
  high_priority_tasks: number;
}
