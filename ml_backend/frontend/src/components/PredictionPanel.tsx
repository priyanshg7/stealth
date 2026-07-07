import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CropHealthDecisionResponse } from '../models/diagnosis';

interface PredictionPanelProps {
  data: CropHealthDecisionResponse;
  imageUrl?: string;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ data, imageUrl }) => {
  const navigate = useNavigate();

  // Helper to determine severity based on confidence and decision rules
  const getSeverity = () => {
    if (data.prediction.toLowerCase().includes('healthy')) return { level: 'GOOD', color: 'bg-primary-fixed text-on-primary-fixed border-primary-fixed' };
    if (data.confidence > 0.85) return { level: 'HIGH', color: 'bg-error-container text-on-error-container border-error/20' };
    return { level: 'MEDIUM', color: 'bg-secondary-container text-on-secondary-container border-secondary/20' };
  };

  const severity = getSeverity();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      {/* Main Summary Card */}
      <div className="md:col-span-8 bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden flex flex-col sm:flex-row">
        
        {/* Image Container */}
        <div className="w-full sm:w-2/5 aspect-square sm:aspect-auto relative bg-surface-container-lowest">
          <img 
            alt="Uploaded crop leaf" 
            className="w-full h-full object-cover" 
            src={imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAqM-M5nT7JYCrP0L26BQJ5HKLFuueU3lChwfpYgDUFthy7BrLdgQS121ufvgW9tqpvUnQRoVTxJjZwDMzQG2snbw4UHgesexoKkfk3JzHmCejrOPphT2Jlpp3IsZQCO_C1Hvq2lbllCgimb7eTE0GXMMLRLL1AzTiygJPqTo0iPdVh7A0KWBcMei3rfPIRfBvFOjBj5WxynqSoW2zbj9XPOiFRYoYcVxTUOqLPANFgNDyC_kWqfs3cfWn4jbrpOUqV_1bPzQxVHj91"}
          />
          <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant shadow-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${data.prediction.toLowerCase().includes('healthy') ? 'bg-primary' : 'bg-error'}`}></span>
            <span className="font-label-lg text-label-lg text-on-surface text-xs uppercase tracking-wider">Analyzed</span>
          </div>
        </div>

        {/* Results Container */}
        <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-1">Primary Diagnosis</p>
              <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2 flex items-center gap-3 capitalize">
                {data.prediction.replace(/_/g, ' ')}
                <button className="bg-secondary-container/20 text-secondary hover:bg-secondary-container/40 p-2 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]" title="Listen to Results">
                  <span className="material-symbols-outlined text-[20px]" data-icon="volume_up" style={{fontVariationSettings: "'FILL' 1"}}>volume_up</span>
                </button>
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 border border-primary-container/30 rounded-full">
              <span className="material-symbols-outlined text-primary text-[18px]" data-icon="verified" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              <span className="font-label-lg text-label-lg text-primary">{(data.confidence * 100).toFixed(0)}% Confidence</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${severity.color}`}>
              <span className="material-symbols-outlined text-[18px]" data-icon="warning" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              <span className="font-label-lg text-label-lg font-bold">Severity: {severity.level}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => document.getElementById('treatment-plan')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-primary text-on-primary font-button text-button h-[56px] rounded-lg shadow-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined" data-icon="medical_services">medical_services</span>
              View Treatment Plan
            </button>
            <button className="w-full bg-transparent border-2 border-outline text-on-surface font-button text-button h-[56px] rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
              <span className="material-symbols-outlined" data-icon="group">group</span>
              Ask Expert
            </button>
          </div>
        </div>
      </div>

      {/* Side Column - Alternative Predictions */}
      <div className="md:col-span-4 space-y-6">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl p-6 h-full flex flex-col">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline" data-icon="search_insights">search_insights</span>
            Possible Alternatives
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Other conditions that share similar visual symptoms.</p>
          <div className="space-y-3 mt-auto">
            {Object.entries(data.top_predictions).slice(1, 4).map(([altDisease, altConf], index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]" data-icon="spa">spa</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface capitalize">{altDisease.replace(/_/g, ' ')}</span>
                </div>
                <span className="font-label-lg text-label-lg text-on-surface-variant">{(altConf * 100).toFixed(0)}%</span>
              </div>
            ))}
            {Object.keys(data.top_predictions).length <= 1 && (
               <p className="text-sm text-on-surface-variant italic">No close alternatives detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;
