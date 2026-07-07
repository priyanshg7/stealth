import React from 'react';
import type { DiseaseInfo } from '../models/diagnosis';

interface DiseaseInfoPanelProps {
  diseaseInfo: DiseaseInfo;
  diseaseName: string;
}

const DiseaseInfoPanel: React.FC<DiseaseInfoPanelProps> = ({ diseaseInfo, diseaseName }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl p-6 md:p-8 mb-8">
      <div className="max-w-4xl">
        <h4 className="font-headline-md text-headline-md text-on-surface mb-2 flex items-center gap-2 capitalize">
          <span className="material-symbols-outlined text-primary" data-icon="info" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
          About {diseaseName.replace(/_/g, ' ')}
        </h4>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
          {diseaseInfo.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant flex items-start gap-4">
            <div className="p-2 bg-surface rounded-full shadow-sm text-secondary flex-shrink-0">
              <span className="material-symbols-outlined" data-icon="coronavirus">coronavirus</span>
            </div>
            <div>
              <h5 className="font-label-lg text-label-lg text-on-surface mb-1">Cause</h5>
              <p className="font-body-md text-body-md text-on-surface-variant">{diseaseInfo.cause}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant flex items-start gap-4">
            <div className="p-2 bg-surface rounded-full shadow-sm text-tertiary-container flex-shrink-0">
              <span className="material-symbols-outlined" data-icon="water_drop">water_drop</span>
            </div>
            <div>
              <h5 className="font-label-lg text-label-lg text-on-surface mb-1">Spread</h5>
              <p className="font-body-md text-body-md text-on-surface-variant">{diseaseInfo.spread_method}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-error-container/20 border border-error-container flex items-start gap-4">
            <div className="p-2 bg-surface rounded-full shadow-sm text-error flex-shrink-0">
              <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
            </div>
            <div>
              <h5 className="font-label-lg text-label-lg text-on-surface mb-1">Risk Level</h5>
              <p className="font-body-md text-body-md text-on-surface-variant">{diseaseInfo.risk_level}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseInfoPanel;
