import React, { useState } from 'react';
import { Beaker, Leaf, ShieldCheck } from 'lucide-react';

export function TreatmentPlanTabs({ treatmentPlan, areaAcres = 1 }) {
  const [activeTab, setActiveTab] = useState('inorganic');

  if (!treatmentPlan) return null;

  const chemicalPlan = treatmentPlan.chemicalTreatment 
    || treatmentPlan.inorganicPlan 
    || (Array.isArray(treatmentPlan.treatments?.inorganic) ? treatmentPlan.treatments.inorganic[0] : treatmentPlan.treatments?.inorganic);

  const organicPlan = treatmentPlan.organicTreatment 
    || treatmentPlan.organicPlan 
    || (Array.isArray(treatmentPlan.treatments?.organic) ? treatmentPlan.treatments.organic[0] : treatmentPlan.treatments?.organic);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-6">
      {/* 1. Tabs Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4">
        <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          <span>Calculated Treatment & Chemical Dosage</span>
        </h3>

        <div className="flex bg-surface-container p-1 rounded-2xl border border-outline-variant/40">
          <button
            type="button"
            onClick={() => setActiveTab('inorganic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inorganic'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Beaker className="w-3.5 h-3.5" />
            <span>Chemical (Inorganic)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('organic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'organic'
                ? 'bg-[#1e8e3e] text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Bio-Organic (Natural)</span>
          </button>
        </div>
      </div>

      {/* 2. Active Tab Content */}
      {activeTab === 'inorganic' && chemicalPlan && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Recommended Fungicide / Chemical</span>
              <h4 className="font-bold text-base text-blue-950">{chemicalPlan.productName || chemicalPlan.tradeName || chemicalPlan.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Calculated Dosage ({areaAcres} Acre)</span>
              <p className="font-extrabold text-base text-blue-950">{chemicalPlan.calculatedDosage || chemicalPlan.totalQuantityForFarm || chemicalPlan.dosagePerAcre || chemicalPlan.dosage}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-on-surface">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Active Chemical Ingredient</span>
              <p className="text-on-surface font-bold">{chemicalPlan.activeIngredient || chemicalPlan.productName || 'Mancozeb 75% WP'}</p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Application Procedure</span>
              <p className="text-on-surface font-bold">{chemicalPlan.applicationMethod || chemicalPlan.purpose || 'Foliar Spray early morning'}</p>
            </div>
          </div>

          {(chemicalPlan.safetyPrecautions || chemicalPlan.precautions || chemicalPlan.warnings) && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-semibold">
              <strong>Safety Warning:</strong> {chemicalPlan.safetyPrecautions || (Array.isArray(chemicalPlan.precautions) ? chemicalPlan.precautions.join('. ') : (Array.isArray(chemicalPlan.warnings) ? chemicalPlan.warnings.join('. ') : chemicalPlan.warnings))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'organic' && organicPlan && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-green-50/60 p-4 rounded-2xl border border-green-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Bio-Control Solution</span>
              <h4 className="font-bold text-base text-green-950">{organicPlan.productName || organicPlan.tradeName || organicPlan.name || 'Trichoderma viride'}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Calculated Organic Dosage ({areaAcres} Acre)</span>
              <p className="font-extrabold text-base text-green-950">{organicPlan.calculatedDosage || organicPlan.totalQuantityForFarm || organicPlan.dosagePerAcre || organicPlan.dosage || '500 ml / Acre'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-on-surface">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Active Bio-Agent</span>
              <p className="text-on-surface font-bold">{organicPlan.activeIngredient || 'Botanical extract / bio-antagonist'}</p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Application Procedure</span>
              <p className="text-on-surface font-bold">{organicPlan.applicationMethod || 'Foliar Spray in late evening'}</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1 text-xs">
            <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Preparation & Spray Instructions</span>
            <p className="text-on-surface font-bold leading-relaxed">{organicPlan.preparation || organicPlan.applicationMethod || 'Mix with water and spray evenly over foliage'}</p>
          </div>

          {(organicPlan.safetyPrecautions || organicPlan.precautions || organicPlan.warnings) && (
            <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-xs text-green-900 leading-relaxed font-semibold">
              <strong>Application Note:</strong> {organicPlan.safetyPrecautions || (Array.isArray(organicPlan.precautions) ? organicPlan.precautions.join('. ') : (Array.isArray(organicPlan.warnings) ? organicPlan.warnings.join('. ') : organicPlan.warnings))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
