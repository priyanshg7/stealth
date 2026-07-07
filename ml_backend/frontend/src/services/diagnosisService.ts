import { api } from "./api";
import type { CropHealthDecisionResponse } from "../models/diagnosis";

export const uploadImageForPrediction = async (
  file: File,
  farmId: string,
  crop: string,
  location?: string
): Promise<CropHealthDecisionResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("farm_id", farmId);
  formData.append("crop", crop);
  if (location) formData.append("location", location);

  try {
    const response = await api.post<CropHealthDecisionResponse>("/diagnosis/predict", formData);
    return response.data;
  } catch (error: any) {
    // Network error — backend is down or unreachable
    if (!error.response) {
      throw new Error(
        "Cannot reach the backend server. Make sure the API server is running on port 8000."
      );
    }
    // Server returned an error response
    const detail = error.response.data?.detail;
    if (error.response.status >= 500) {
      throw new Error(detail ? `Server error: ${detail}` : "Server error — inference failed. Check the backend logs.");
    }
    if (error.response.status === 400) {
      throw new Error(detail || "Invalid request. Please check your image and crop selection.");
    }
    throw new Error(detail || `Request failed with status ${error.response.status}.`);
  }
};

export const getCaseById = async (caseId: string) => {
  try {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch case details.");
  }
};
