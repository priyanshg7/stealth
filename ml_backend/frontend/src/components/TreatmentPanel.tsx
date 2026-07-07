import React, { useState } from 'react';
import type { TreatmentOption, Dosage, DecisionRecommendation } from '../models/diagnosis';

interface TreatmentPanelProps {
  treatmentOptions: TreatmentOption[];
  dosage: Dosage | null;
  decisions: DecisionRecommendation[];
}

const TreatmentPanel: React.FC<TreatmentPanelProps> = ({ treatmentOptions, dosage, decisions }) => {
  const [activeTab, setActiveTab] = useState<'immediate' | 'organic' | 'chemical'>('immediate');

  const immediateDecisions = decisions.filter(d => d.priority.toLowerCase() === 'critical' || d.priority.toLowerCase() === 'high');
  const organicTreatments = treatmentOptions.filter(t => t.organic);
  const chemicalTreatments = treatmentOptions.filter(t => !t.organic);

  return (
    <div className="flex flex-col gap-6" id="treatment-plan">
      {/* Treatment Recommendation Center */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
        <div className="bg-surface-container-low px-6 py-4 border-b border-surface-variant">
          <h2 className="font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">healing</span>
            Treatment Plan
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-surface-variant px-2 overflow-x-auto">
          <button 
            className={`px-4 py-3 font-button whitespace-nowrap transition-all duration-200 ${activeTab === 'immediate' ? 'border-b-4 border-primary text-primary' : 'text-on-surface-variant'}`}
            onClick={() => setActiveTab('immediate')}
          >
            Immediate Actions
          </button>
          <button 
            className={`px-4 py-3 font-button whitespace-nowrap transition-all duration-200 ${activeTab === 'organic' ? 'border-b-4 border-primary text-primary' : 'text-on-surface-variant'}`}
            onClick={() => setActiveTab('organic')}
          >
            Organic Solutions
          </button>
          <button 
            className={`px-4 py-3 font-button whitespace-nowrap transition-all duration-200 ${activeTab === 'chemical' ? 'border-b-4 border-primary text-primary' : 'text-on-surface-variant'}`}
            onClick={() => setActiveTab('chemical')}
          >
            Chemical Solutions
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === 'immediate' && (
            <ul className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {immediateDecisions.length > 0 ? immediateDecisions.map((decision, index) => (
                <li key={index} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                    <span className="material-symbols-outlined">front_hand</span>
                  </div>
                  <div>
                    <h3 className="font-button text-on-surface">{decision.decision}</h3>
                    <p className="text-on-surface-variant mt-1">{decision.reason}</p>
                    <p className="text-sm text-error mt-2 font-medium">Risk if ignored: {decision.risk_if_ignored}</p>
                  </div>
                </li>
              )) : (
                 <p className="text-on-surface-variant italic">No critical immediate actions required.</p>
              )}
            </ul>
          )}

          {activeTab === 'organic' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {organicTreatments.length > 0 ? organicTreatments.map((treatment, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                    <span className="material-symbols-outlined">eco</span>
                  </div>
                  <div>
                    <h3 className="font-button text-on-surface">{treatment.medicine}</h3>
                    <p className="text-on-surface-variant mt-1">Expected Recovery: {treatment.recovery_time}</p>
                    <p className="text-sm bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded inline-block mt-2">Effectiveness: {treatment.effectiveness}</p>
                  </div>
                </div>
              )) : (
                <p className="text-on-surface-variant italic">No organic treatments recommended.</p>
              )}
            </div>
          )}

          {activeTab === 'chemical' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {chemicalTreatments.length > 0 ? chemicalTreatments.map((treatment, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="bg-error-container text-on-error-container p-2 rounded-full shrink-0">
                    <span className="material-symbols-outlined">science</span>
                  </div>
                  <div>
                    <h3 className="font-button text-on-surface">{treatment.medicine}</h3>
                    <p className="text-on-surface-variant mt-1">Expected Recovery: {treatment.recovery_time}</p>
                    <p className="text-sm bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded inline-block mt-2">Effectiveness: {treatment.effectiveness}</p>
                  </div>
                </div>
              )) : (
                <p className="text-on-surface-variant italic">No chemical treatments recommended.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dosage Calculator (Prescription Card) */}
      {dosage && (
        <div className="bg-primary text-on-primary rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-bl-full opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline-md flex items-center gap-2">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Prescription Card
                </h2>
                <p className="text-primary-fixed-dim font-label-lg mt-1">Auto-calculated for your {dosage.farm_area} {dosage.area_unit} Farm</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-on-primary-fixed p-4 rounded-lg bg-opacity-20 backdrop-blur-sm border border-primary-container">
                <p className="text-primary-fixed-dim text-sm mb-1">Recommended Option</p>
                <p className="font-headline-md text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">science</span> 
                  {chemicalTreatments.length > 0 ? chemicalTreatments[0].medicine : 'General Solution'}
                </p>
              </div>
              <div className="bg-on-primary-fixed p-4 rounded-lg bg-opacity-20 backdrop-blur-sm border border-primary-container">
                <p className="text-primary-fixed-dim text-sm mb-1">Quantity</p>
                <p className="font-headline-md text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">water_drop</span> {dosage.medicine_quantity} {dosage.medicine_unit}
                </p>
              </div>
              <div className="bg-on-primary-fixed p-4 rounded-lg bg-opacity-20 backdrop-blur-sm border border-primary-container col-span-2 md:col-span-1">
                <p className="text-primary-fixed-dim text-sm mb-1">Dilution Water</p>
                <p className="font-headline-md text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">opacity</span> {dosage.water_quantity} {dosage.water_unit}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-primary-container pt-4">
              <div>
                <p className="text-primary-fixed-dim text-sm">Estimated Cost</p>
                <p className="font-headline-lg text-white">₹{dosage.estimated_cost}</p>
              </div>
              <button className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-button hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-md flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_cart</span>
                Order Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPanel;
