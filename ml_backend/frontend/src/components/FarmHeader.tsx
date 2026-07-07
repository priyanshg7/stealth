import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview, getFarmDetails } from '../services/dashboardService';

interface FarmHeaderProps {
  farmId: string;
}

const FarmHeader: React.FC<FarmHeaderProps> = ({ farmId }) => {
  const { data: farmDetails, isLoading: isFarmLoading } = useQuery({
    queryKey: ['farmDetails', farmId],
    queryFn: () => getFarmDetails(farmId),
  });

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });

  if (isFarmLoading || isOverviewLoading) {
    return <div className="animate-pulse bg-surface-container-lowest border border-outline-variant rounded-xl h-24 mb-8 shadow-sm"></div>;
  }

  if (!farmDetails || !overview) return null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 md:gap-8">
        <div>
          <h2 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-1">Current Farm</h2>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-icon="landscape">landscape</span>
            <span className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface">{farmDetails.name}</span>
          </div>
        </div>
        <div className="h-10 w-[1px] bg-outline-variant hidden md:block"></div>
        <div className="flex gap-6">
          <div>
            <h2 className="font-label-lg text-label-lg text-on-surface-variant mb-1">Crop</h2>
            <div className="flex items-center gap-1 font-body-lg text-body-lg text-on-surface font-semibold capitalize">
              {farmDetails.crop}
            </div>
          </div>
          <div>
            <h2 className="font-label-lg text-label-lg text-on-surface-variant mb-1">Stage</h2>
            <div className="flex items-center gap-1 font-body-lg text-body-lg text-on-surface">
              {farmDetails.current_crop_stage}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-sm" data-icon="ecg_heart">ecg_heart</span>
          <span className="font-label-lg text-label-lg font-bold">Health: {overview.health_score.score}%</span>
        </div>
        <button className="md:hidden h-[40px] px-4 rounded-lg border border-outline-variant text-primary font-button text-button flex items-center justify-center hover:bg-surface-container-highest transition-colors duration-200">
          Switch
        </button>
      </div>
    </div>
  );
};

export default FarmHeader;
