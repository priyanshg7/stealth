import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCaseDetails, submitFollowUp } from '../services/caseService';
import type { CaseDetails } from '../models/diagnosis';

export const useCaseDetails = (caseId: string) => {
  return useQuery<CaseDetails, Error>({
    queryKey: ['caseDetails', caseId],
    queryFn: () => getCaseDetails(caseId),
    enabled: !!caseId,
  });
};

export const useSubmitFollowUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ condition: string; message: string }, Error, { caseId: string; currentDisease: string; confidence: number; farmerNotes: string }>({
    mutationFn: ({ caseId, currentDisease, confidence, farmerNotes }) => submitFollowUp(caseId, currentDisease, confidence, farmerNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['caseDetails', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};
