import React from 'react';
import { ShieldAlert, Activity, CheckCircle2, Thermometer, Droplets } from 'lucide-react';

export function DiseaseProfileCard({ diagnosisSummary, weatherRisk, cropName }) {
  if (!diagnosisSummary) return null;

  const severityColor = diagnosisSummary.severity === 'Severe' || diagnosisSummary.severity === 'Critical'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-5">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {cropName} Diagnostic Result
          </span>
          <h2 className="font-display font-extrabold text-2xl text-on-surface mt-1">
            {diagnosisSummary.diseaseName}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Scientific Name: <em className="font-serif">{diagnosisSummary.scientificName || 'Fungal Pathogen'}</em>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${severityColor}`}>
            ⚠️ {diagnosisSummary.severity || 'Moderate'} Severity
          </span>
          <span className="text-xs font-extrabold bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{Math.round(diagnosisSummary.confidence * 100)}% Confidence</span>
          </span>
        </div>
      </div>

      {/* 2. Overview & Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 space-y-2">
          <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary" />
            <span>Pathogen Symptoms & Description</span>
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            {diagnosisSummary.description}
          </p>
        </div>

        {weatherRisk && (
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2">
            <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-700" />
              <span>Weather Environmental Spread Risk</span>
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {weatherRisk.description || 'High humidity and warm conditions accelerate spore dissemination.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
