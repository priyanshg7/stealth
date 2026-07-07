import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../services/dashboardService';
import type { DashboardOverview } from '../models/dashboard';

export const useDashboardOverview = () => {
  return useQuery<DashboardOverview, Error>({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });
};
