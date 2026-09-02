import React, { useState } from 'react';
import { Beaker, Leaf, ShieldCheck } from 'lucide-react';

export function TreatmentPlanTabs({ treatmentPlan, areaAcres = 1 }) {
  const [activeTab, setActiveTab] = useState('inorganic');

  if (!treatmentPlan) return null;

  const chemicalPlan = treatmentPlan.chemicalTreatment || treatmentPlan.inorganicPlan;
  const organicPlan = treatmentPlan.organicTreatment || treatmentPlan.organicPlan;

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
              <h4 className="font-bold text-base text-blue-950">{chemicalPlan.productName || chemicalPlan.tradeName}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Calculated Dosage ({areaAcres} Acre)</span>
              <p className="font-extrabold text-base text-blue-950">{chemicalPlan.calculatedDosage || chemicalPlan.dosage}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-on-surface">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Active Chemical Ingredient</span>
              <p className="text-on-surface font-bold">{chemicalPlan.activeIngredient || 'Mancozeb 75% WP'}</p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Application Procedure</span>
              <p className="text-on-surface font-bold">{chemicalPlan.applicationMethod || 'Foliar Spray early morning'}</p>
            </div>
          </div>

          {chemicalPlan.safetyPrecautions && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-semibold">
              <strong>Safety Warning:</strong> {chemicalPlan.safetyPrecautions}
            </div>
          )}
        </div>
      )}

      {activeTab === 'organic' && organicPlan && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-green-50/60 p-4 rounded-2xl border border-green-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Bio-Control Solution</span>
              <h4 className="font-bold text-base text-green-950">{organicPlan.productName || organicPlan.tradeName || 'Trichoderma viride'}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Calculated Organic Dosage</span>
              <p className="font-extrabold text-base text-green-950">{organicPlan.calculatedDosage || organicPlan.dosage || '250ml per acre'}</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-1 text-xs">
            <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Preparation & Spray Instructions</span>
            <p className="text-on-surface font-bold leading-relaxed">{organicPlan.preparation || organicPlan.applicationMethod}</p>
          </div>
        </div>
      )}
    </div>
  );
}
