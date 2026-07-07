import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useDiagnosisContext } from '../context/DiagnosisContext';
import { getCaseById } from '../services/diagnosisService';
import { getGeminiTreatment } from '../services/geminiService';
import type { CropHealthDecisionResponse } from '../models/diagnosis';
import { LoadingOverlay } from '../components/LoadingOverlay';

const DiagnosisResults: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { predictionData, uploadedImage, setPredictionData, selectedCrop, location, setGeminiTreatment, geminiTreatment } = useDiagnosisContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
              caseData.treatment_options.premium
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

  // Auto-trigger Gemini treatment fetch after prediction is ready
  useEffect(() => {
    if (!predictionData || geminiTreatment) return;
    const isHealthy = predictionData.prediction.toLowerCase().includes('healthy');
    if (isHealthy) return;

    setIsGeminiLoading(true);
    getGeminiTreatment(
      predictionData.prediction.replace(/_/g, ' '),
      selectedCrop || predictionData.case_details.disease,
    )
      .then((data) => {
        setGeminiTreatment(data);
      })
      .catch((err) => {
        console.error('Gemini error:', err);
        setErrorMsg(`AI treatment plan unavailable: ${err.message}`);
      })
      .finally(() => {
        setIsGeminiLoading(false);
      });
  }, [predictionData, geminiTreatment, selectedCrop, setGeminiTreatment]);

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

  const isHealthy = predictionData.prediction.toLowerCase().includes('healthy');
  const confidence = (predictionData.confidence * 100).toFixed(0);
  const diseaseName = predictionData.prediction.replace(/_/g, ' ');

  const handleReadAloud = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = `Diagnosis Result. The crop has ${diseaseName} with ${confidence} percent confidence.`;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <>
      <Navigation />
      <main className="p-margin-mobile md:p-margin-desktop max-w-[1280px] mx-auto pt-16 md:pt-12 pb-32">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-on-surface-variant font-label-lg">
              <button onClick={() => navigate('/diagnosis')} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Diagnosis
              </button>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface flex items-center gap-3 capitalize">
              <span className={`material-symbols-outlined text-4xl ${isHealthy ? 'text-primary' : 'text-error'}`}>
                {isHealthy ? 'verified' : 'warning'}
              </span>
              {diseaseName}
            </h1>
            <p className="font-body-lg text-on-surface-variant mt-1">
              Confidence: {confidence}%
              {selectedCrop && ` • ${selectedCrop}`}
              {location && ` • ${location}`}
            </p>
          </div>
          <button
            onClick={handleReadAloud}
            className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-button flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">mic</span>
            Read Aloud
          </button>
        </div>

        {/* Main Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Image + Result Card */}
          <div className="md:col-span-8 bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-2/5 aspect-square sm:aspect-auto relative bg-surface-container-lowest">
              <img
                alt="Uploaded crop"
                className="w-full h-full object-cover"
                src={uploadedImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqM-M5nT7JYCrP0L26BQJ5HKLFuueU3lChwfpYgDUFthy7BrLdgQS121ufvgW9tqpvUnQRoVTxJjZwDMzQG2snbw4UHgesexoKkfk3JzHmCejrOPphT2Jlpp3IsZQCO_C1Hvq2lbllCgimb7eTE0GXMMLRLL1AzTiygJPqTo0iPdVh7A0KWBcMei3rfPIRfBvFOjBj5WxynqSoW2zbj9XPOiFRYoYcVxTUOqLPANFgNDyC_kWqfs3cfWn4jbrpOUqV_1bPzQxVHj91'}
              />
              <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant shadow-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-primary' : 'bg-error'}`}></span>
                <span className="font-label-lg text-on-surface text-xs uppercase tracking-wider">Analyzed</span>
              </div>
            </div>
            <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              <p className="font-label-lg text-on-surface-variant uppercase tracking-widest mb-1">Primary Diagnosis</p>
              <h3 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-3 capitalize flex items-center gap-3">
                {diseaseName}
                <button onClick={handleReadAloud} className="bg-secondary-container/20 text-secondary hover:bg-secondary-container/40 p-2 rounded-full transition-colors" title="Listen">
                  <span className="material-symbols-outlined text-[20px]">volume_up</span>
                </button>
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 border border-primary-container/30 rounded-full">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span className="font-label-lg text-primary">{confidence}% Confidence</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${isHealthy ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed' : predictionData.confidence > 0.85 ? 'bg-error-container text-on-error-container border-error/20' : 'bg-secondary-container text-on-secondary-container border-secondary/20'}`}>
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span className="font-label-lg font-bold">Severity: {isHealthy ? 'GOOD' : predictionData.confidence > 0.85 ? 'HIGH' : 'MEDIUM'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/diagnosis/treatment/${caseId}`)}
                  className="w-full bg-primary text-on-primary font-button h-[52px] rounded-lg shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">medical_services</span>
                  {isGeminiLoading ? 'Preparing Treatment Plan...' : 'View Treatment Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Alternative Predictions */}
          <div className="md:col-span-4">
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl p-6 h-full flex flex-col">
              <h4 className="font-headline-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">search_insights</span>
                Possible Alternatives
              </h4>
              <p className="font-body-md text-on-surface-variant mb-4 text-sm">Other conditions that share similar visual symptoms.</p>
              <div className="space-y-3 mt-auto">
                {(() => {
                  // Build a clean list of alternatives: skip primary, filter NaN/invalid conf
                  const alts = Object.entries(predictionData.top_predictions)
                    .filter(([key]) => key !== predictionData.prediction)
                    .map(([key, val]) => ({ name: key, conf: Number(val) }))
                    .filter(({ name, conf }) =>
                      name &&
                      !isNaN(conf) &&
                      isFinite(conf) &&
                      /[a-zA-Z]/.test(name) // must contain a letter — not just a number index
                    )
                    .sort((a, b) => b.conf - a.conf)
                    .slice(0, 3);

                  if (alts.length === 0) {
                    return <p className="text-sm text-on-surface-variant italic">No close alternatives detected.</p>;
                  }

                  return alts.map(({ name, conf }, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">spa</span>
                        </div>
                        <span className="font-label-lg text-on-surface capitalize">{name.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-label-lg text-on-surface-variant">{(conf * 100).toFixed(0)}%</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Disease Info from Gemini (if available) */}
        {geminiTreatment && (
          <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl p-6 md:p-8 mb-8">
            <h4 className="font-headline-md text-on-surface mb-2 flex items-center gap-2 capitalize">
              <span className="material-symbols-outlined text-primary">info</span>
              About {diseaseName}
            </h4>
            <p className="font-body-lg text-on-surface-variant mb-6 leading-relaxed">
              {geminiTreatment.diagnosis_description}
            </p>
            {geminiTreatment.key_symptoms && geminiTreatment.key_symptoms.length > 0 && (
              <div>
                <h5 className="font-label-lg text-on-surface mb-3">Key Symptoms</h5>
                <ul className="space-y-1">
                  {geminiTreatment.key_symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-on-surface-variant font-body-md text-sm">
                      <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 shrink-0">fiber_manual_record</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Gemini Loading State */}
        {isGeminiLoading && !geminiTreatment && (
          <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
            <p className="font-body-md text-on-surface-variant">Generating AI treatment plan with Gemini...</p>
          </div>
        )}


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

export default DiagnosisResults;
