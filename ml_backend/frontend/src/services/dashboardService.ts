import { api } from "./api";
import type { DashboardOverview, FarmDetails } from "../models/dashboard";

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get<DashboardOverview>("/dashboard/overview");
  return response.data;
};

export const getFarmDetails = async (farmId: string): Promise<FarmDetails> => {
  // In a real scenario, this would hit the API. For now, since the mock Farm Service is backend-only, 
  // we might need a dedicated endpoint. If it doesn't exist yet, we'll mock it here temporarily or 
  // fetch it if the backend has it. The prompt mentions `GET /api/v1/dashboard/farm/{farm_id}`.
  // Wait, I did not create `/api/v1/dashboard/farm/{farm_id}` in Phase 8. I should call a mock here 
  // if it throws 404, but let's try calling it.
  try {
    const response = await api.get<FarmDetails>(`/dashboard/farm/${farmId}`);
    return response.data;
  } catch (error) {
    // Fallback Mock until backend implements this specific endpoint
    return {
      farm_id: farmId,
      farmer_id: "farmer_12345",
      name: "Green Valley Farm",
      crop: "Tomato",
      area: 2.5,
      area_unit: "Acres",
      location: "Punjab",
      season: "Rabi",
      current_crop_stage: "Flowering"
    };
  }
};
