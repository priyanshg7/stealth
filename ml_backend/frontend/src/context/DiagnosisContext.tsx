import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CropHealthDecisionResponse, DiseaseInfo } from '../models/diagnosis';

interface DiagnosisState {
  caseId: string | null;
  selectedCrop: string;
  location: string;
  uploadedImage: string | null; // Data URL for preview
  predictionData: CropHealthDecisionResponse | null;
  geminiTreatment: DiseaseInfo | null;
}

interface DiagnosisContextType extends DiagnosisState {
  setCaseId: (id: string) => void;
  setSelectedCrop: (crop: string) => void;
  setLocation: (loc: string) => void;
  setUploadedImage: (url: string | null) => void;
  setPredictionData: (data: CropHealthDecisionResponse | null) => void;
  setGeminiTreatment: (data: DiseaseInfo | null) => void;
  clearState: () => void;
}

const initialState: DiagnosisState = {
  caseId: null,
  selectedCrop: '',
  location: '',
  uploadedImage: null,
  predictionData: null,
  geminiTreatment: null,
};

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

export const DiagnosisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DiagnosisState>(() => {
    const saved = sessionStorage.getItem('diagnosis_state');
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    sessionStorage.setItem('diagnosis_state', JSON.stringify(state));
  }, [state]);

  const setCaseId = React.useCallback((caseId: string) => setState((s) => ({ ...s, caseId })), []);
  const setSelectedCrop = React.useCallback((selectedCrop: string) => setState((s) => ({ ...s, selectedCrop })), []);
  const setLocation = React.useCallback((location: string) => setState((s) => ({ ...s, location })), []);
  const setUploadedImage = React.useCallback((uploadedImage: string | null) => setState((s) => ({ ...s, uploadedImage })), []);
  const setPredictionData = React.useCallback((predictionData: CropHealthDecisionResponse | null) => setState((s) => ({ ...s, predictionData })), []);
  const setGeminiTreatment = React.useCallback((geminiTreatment: DiseaseInfo | null) => setState((s) => ({ ...s, geminiTreatment })), []);
  
  const clearState = React.useCallback(() => {
    setState(initialState);
    sessionStorage.removeItem('diagnosis_state');
  }, []);

  return (
    <DiagnosisContext.Provider value={{ ...state, setCaseId, setSelectedCrop, setLocation, setUploadedImage, setPredictionData, setGeminiTreatment, clearState }}>
      {children}
    </DiagnosisContext.Provider>
  );
};

export const useDiagnosisContext = () => {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosisContext must be used within a DiagnosisProvider');
  }
  return context;
};
