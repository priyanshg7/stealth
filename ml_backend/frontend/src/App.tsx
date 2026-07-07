import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DiagnosisProvider } from './context/DiagnosisContext';

const DiagnosisHome = lazy(() => import('./pages/DiagnosisHome'));
const DiagnosisResults = lazy(() => import('./pages/DiagnosisResults'));
const TreatmentPlan = lazy(() => import('./pages/TreatmentPlan'));

const App: React.FC = () => {
  return (
    <DiagnosisProvider>
      <Router>
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/diagnosis" element={<DiagnosisHome />} />
            <Route path="/diagnosis/results/:caseId" element={<DiagnosisResults />} />
            <Route path="/diagnosis/treatment/:caseId" element={<TreatmentPlan />} />
            
            {/* Redirects */}
            <Route path="/cases/:caseId" element={<Navigate to="/diagnosis/results/:caseId" replace />} />
            <Route path="/" element={<Navigate to="/diagnosis" replace />} />
            <Route path="/results" element={<Navigate to="/diagnosis" replace />} />
            <Route path="/treatment" element={<Navigate to="/diagnosis" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </DiagnosisProvider>
  );
};

export default App;
