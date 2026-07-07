import { useMutation } from '@tanstack/react-query';
import { uploadImageForPrediction } from '../services/diagnosisService';
import type { CropHealthDecisionResponse } from '../models/diagnosis';

export const useUploadDiagnosis = () => {
  return useMutation<CropHealthDecisionResponse, Error, { file: File; farmId: string; crop: string }>({
    mutationFn: ({ file, farmId, crop }) => uploadImageForPrediction(file, farmId, crop),
  });
};
