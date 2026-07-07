import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useDiagnosisContext } from '../context/DiagnosisContext';
import { getCaseById } from '../services/diagnosisService';
import { getGeminiTreatment } from '../services/geminiService';
import type { CropHealthDecisionResponse, GeminiCure } from '../models/diagnosis';
import { LoadingOverlay } from '../components/LoadingOverlay';

const TreatmentPlan: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const {
    predictionData, setPredictionData,
    geminiTreatment, setGeminiTreatment,
    uploadedImage, selectedCrop, location,
  } = useDiagnosisContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inorganic' | 'organic'>('inorganic');

  useEffect(() => {
    if (predictionData && predictionData.case_details.case_id === caseId) {
      return;
    }

    if (caseId) {
      setIsLoading(true);
      getCaseById(caseId)
        .then((caseData) => {
          const reconstructedData = {
            prediction: caseData.case_details.disease,
            confidence: caseData.case_details.confidence,
            top_predictions: { [caseData.case_details.disease]: caseData.case_details.confidence },
            disease_info: null,
            weather_summary: null,
            decision_recommendations: [],
            treatment_options: caseData.treatment_options ? [
              caseData.treatment_options.economy,
              caseData.treatment_options.balanced,
              caseData.treatment_options.premium,
            ] : [],
            dosage: null,
            planner_tasks: caseData.active_planner || [],
            case_details: caseData.case_details,
            follow_up_schedule: '',
            model_version: 'v1',
            inference_time_ms: 0,
          } as unknown as CropHealthDecisionResponse;

          setPredictionData(reconstructedData);
        })
        .catch(() => {
          setErrorMsg('Failed to load case details.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [caseId, predictionData, setPredictionData]);

  // Fetch Gemini treatment if not already available
  useEffect(() => {
    if (!predictionData || geminiTreatment) return;

    setIsGeminiLoading(true);
    getGeminiTreatment(
      predictionData.prediction.replace(/_/g, ' '),
      selectedCrop || predictionData.case_details.disease,
    )
      .then(setGeminiTreatment)
      .catch((err) => {
        console.error('Gemini error:', err);
        setErrorMsg(`AI treatment plan unavailable: ${err.message}`);
      })

      .finally(() => setIsGeminiLoading(false));
  }, [predictionData, geminiTreatment, selectedCrop, location, setGeminiTreatment]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingOverlay />
      </div>
    );
  }

  if (errorMsg || !predictionData) {
    return <Navigate to="/diagnosis" replace />;
  }

  const diseaseName = predictionData.prediction.replace(/_/g, ' ');
  const confidence = (predictionData.confidence * 100).toFixed(0);
  const cures: GeminiCure[] = activeTab === 'inorganic'
    ? (geminiTreatment?.treatment_plan?.inorganic_cure ?? [])
    : (geminiTreatment?.treatment_plan?.organic_cure ?? []);
  const schedule = geminiTreatment?.treatment_schedule ?? [];
  const symptoms = geminiTreatment?.key_symptoms ?? [];
  const description = geminiTreatment?.diagnosis_description ?? '';

  return (
    <>
      <Navigation />
      <main className="p-margin-mobile md:p-margin-desktop max-w-[1280px] mx-auto pt-16 md:pt-12 pb-32">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-on-surface-variant font-label-lg">
              <button
                onClick={() => navigate(`/diagnosis/results/${caseId}`)}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Diagnosis Results
              </button>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface capitalize">
              Treatment for {diseaseName}
            </h1>
            {(selectedCrop || location) && (
              <p className="font-body-md text-on-surface-variant mt-1">
                {selectedCrop && `${selectedCrop}`}{location && ` • ${location}`} • Confidence: {confidence}%
              </p>
            )}
          </div>
        </div>

        {/* Two-column layout matching the screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: Photo + Diagnosis Info */}
          <div className="md:col-span-4 flex flex-col gap-0">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              {/* Submitted photo */}
              <div className="p-4 border-b border-outline-variant">
                <h3 className="font-headline-md text-on-surface mb-3">Submitted plant photo</h3>
                <div className="rounded-xl overflow-hidden bg-surface-container-low">
                  <img
                    src={uploadedImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqM-M5nT7JYCrP0L26BQJ5HKLFuueU3lChwfpYgDUFthy7BrLdgQS121ufvgW9tqpvUnQRoVTxJjZwDMzQG2snbw4UHgesexoKkfk3JzHmCejrOPphT2Jlpp3IsZQCO_C1Hvq2lbllCgimb7eTE0GXMMLRLL1AzTiygJPqTo0iPdVh7A0KWBcMei3rfPIRfBvFOjBj5WxynqSoW2zbj9XPOiFRYoYcVxTUOqLPANFgNDyC_kWqfs3cfWn4jbrpOUqV_1bPzQxVHj91'}
                    alt="Submitted plant"
                    className="w-full object-cover"
                    style={{ maxHeight: 220 }}
                  />
                </div>
              </div>

              {/* Diagnosis Info */}
              <div className="p-4">
                <h4 className="font-button text-on-surface mb-2">
                  <span className="font-bold">Diagnosis: </span>
                  <span className="capitalize">{diseaseName}</span>
                </h4>

                {isGeminiLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <p className="text-sm text-on-surface-variant">Loading AI analysis...</p>
                  </div>
                ) : (
                  <>
                    {description && (
                      <p className="font-body-md text-on-surface-variant text-sm leading-relaxed mb-4">{description}</p>
                    )}

                    {symptoms.length > 0 && (
                      <>
                        <h5 className="font-button text-on-surface mb-2">Key Symptoms</h5>
                        <ul className="space-y-1.5">
                          {symptoms.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-on-surface-variant text-sm">
                              <span className="material-symbols-outlined text-on-surface-variant text-[14px] mt-0.5 shrink-0">fiber_manual_record</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {!description && !symptoms.length && (
                      <p className="text-sm text-on-surface-variant italic">No AI analysis available.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Treatment Plan */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-outline-variant">
                <h2 className="font-headline-md text-on-surface flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">healing</span>
                  Treatment Plan
                </h2>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Follow these recommendations to treat the issue and protect your crops.
                  {location && ` Cures and suggestions are tailored for your region (${location}).`}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-outline-variant">
                <button
                  onClick={() => setActiveTab('inorganic')}
                  className={`flex-1 py-3 font-button text-sm transition-colors ${activeTab === 'inorganic' ? 'bg-surface-container-high text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  Inorganic Cure
                </button>
                <button
                  onClick={() => setActiveTab('organic')}
                  className={`flex-1 py-3 font-button text-sm transition-colors ${activeTab === 'organic' ? 'bg-surface-container-high text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  Organic Cure
                </button>
              </div>

              {/* Cure Cards */}
              <div className="p-5 space-y-4">
                {isGeminiLoading ? (
                  <div className="flex items-center gap-3 py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <p className="text-on-surface-variant">Generating treatment recommendations with AI...</p>
                  </div>
                ) : cures.length > 0 ? (
                  cures.map((cure, idx) => (
                    <div key={idx} className="bg-surface rounded-xl border border-outline-variant p-4 shadow-sm">
                      <h3 className="font-button text-on-surface mb-2">{cure.name}</h3>
                      <p className="font-body-md text-on-surface-variant text-sm mb-2">
                        <span className="font-semibold text-on-surface">Application: </span>
                        {cure.application}
                      </p>
                      {cure.warning && (
                        <p className="text-sm text-error italic">
                          <span className="font-semibold not-italic">Warning: </span>
                          {cure.warning}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant italic py-4">No {activeTab === 'inorganic' ? 'inorganic' : 'organic'} cures available yet.</p>
                )}
              </div>
            </div>

            {/* Treatment Schedule */}
            {(schedule.length > 0 || isGeminiLoading) && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-5 border-b border-outline-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
                  <h2 className="font-headline-md text-on-surface">Treatment Schedule</h2>
                </div>

                {isGeminiLoading ? (
                  <div className="flex items-center gap-3 p-5">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <p className="text-sm text-on-surface-variant">Loading schedule...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant">
                          <th className="text-left px-5 py-3 font-label-lg text-on-surface-variant uppercase tracking-wide">Week</th>
                          <th className="text-left px-5 py-3 font-label-lg text-on-surface-variant uppercase tracking-wide">Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {schedule.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-5 py-4 font-label-lg text-on-surface whitespace-nowrap align-top">{item.week}</td>
                            <td className="px-5 py-4 font-body-md text-on-surface-variant">{item.activity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <button
        aria-label="Speak to Assistant"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-secondary-container text-on-secondary-container rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-50"
      >
        <span className="material-symbols-outlined text-[32px]">mic</span>
      </button>
    </>
  );
};

export default TreatmentPlan;
