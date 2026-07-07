import type { DiseaseInfo } from '../models/diagnosis';

/**
 * Fetches AI-generated treatment plan from the backend,
 * which uses the Gemini Python SDK with the correct credentials.
 */
export const getGeminiTreatment = async (
  disease: string,
  crop: string,
): Promise<DiseaseInfo> => {
  const params = new URLSearchParams({
    disease,
    crop,
  });

  const response = await fetch(
    `http://localhost:8000/api/v1/treatment/plan?${params.toString()}`
  );

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body?.detail ?? detail;
    } catch { /* ignore parse error */ }
    throw new Error(`Treatment plan error (${response.status}): ${detail}`);
  }

  const data: DiseaseInfo = await response.json();
  return data;
};
