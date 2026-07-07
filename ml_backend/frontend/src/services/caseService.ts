import { api } from "./api";
import type { CaseDetails } from "../models/diagnosis";

export const getCaseDetails = async (caseId: string): Promise<CaseDetails> => {
  const response = await api.get<CaseDetails>(`/cases/${caseId}`);
  return response.data;
};

export const submitFollowUp = async (
  caseId: string, 
  currentDisease: string, 
  confidence: number, 
  farmerNotes: string
): Promise<{ condition: string; message: string }> => {
  const response = await api.post(`/cases/${caseId}/followup`, {
    current_disease: currentDisease,
    confidence: confidence,
    farmer_notes: farmerNotes
  });
  return response.data;
};
