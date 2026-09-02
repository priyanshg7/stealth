import React, { useState, useRef } from 'react';
import { diagnoseDisease } from '../../utils/diagnosisService';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { UploadZone } from '../diagnosis/UploadZone';
import { DiseaseProfileCard } from '../diagnosis/DiseaseProfileCard';
import { TreatmentPlanTabs } from '../diagnosis/TreatmentPlanTabs';
import { ActionTimeline } from '../diagnosis/ActionTimeline';

export default function DiseaseDiagnosis({ weatherData, activeFarm, farms, setFarms, selectedFarmIndex }) {
  const [mode, setMode] = useState('input'); // 'input' | 'loading' | 'results'
  const [farmSource, setFarmSource] = useState('saved'); // 'saved' | 'manual'
  
  const [manualCrop, setManualCrop] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const fileInputRef = useRef(null);

  const currentCrop = farmSource === 'saved' ? (activeFarm?.crop?.name || 'Wheat') : manualCrop;
  const savedLocation = [activeFarm?.village, activeFarm?.district, activeFarm?.state].filter(Boolean).join(', ');
  const currentLocation = farmSource === 'saved' ? (savedLocation || 'Unknown Location') : (manualLocation || 'Unknown Location');
  const currentArea = farmSource === 'saved' ? (activeFarm?.area || 1) : 1;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!imageFile || !currentCrop) {
      alert("Please provide an image and select a crop.");
      return;
    }
    
    setMode('loading');
    try {
      const farmDetails = {
        crop: currentCrop,
        areaAcres: currentArea,
        location: currentLocation,
        weather: weatherData
      };
      
      const aiData = await diagnoseDisease(imageFile, farmDetails);
      
      if (!aiData || !aiData.diagnosisSummary) {
         throw new Error("AI Recommendation Engine failed to generate a treatment plan.");
      }
      
      setTreatmentPlan(aiData);
      
      if (farmSource === 'saved' && activeFarm && setFarms) {
        const updatedFarms = [...farms];
        const farmToUpdate = { ...updatedFarms[selectedFarmIndex] };
        
        const newHistoryItem = {
          date: new Date().toISOString(),
          disease: aiData.diagnosisSummary.diseaseName,
          confidence: aiData.diagnosisSummary.confidence,
          treatment: aiData
        };
        
        farmToUpdate.diagnosisHistory = farmToUpdate.diagnosisHistory ? [...farmToUpdate.diagnosisHistory] : [];
        farmToUpdate.diagnosisHistory.push(newHistoryItem);
        
        updatedFarms[selectedFarmIndex] = farmToUpdate;
        setFarms(updatedFarms);
      }

      setMode('results');
    } catch (err) {
      console.error(err);
      alert("Diagnosis failed: " + err.message);
      setMode('input');
    }
  };

  const addToCalendar = (activityText) => {
    if (farmSource === 'saved' && activeFarm && setFarms) {
      const updatedFarms = [...farms];
      const farmToUpdate = { ...updatedFarms[selectedFarmIndex] };
      
      farmToUpdate.tasks = farmToUpdate.tasks ? [...farmToUpdate.tasks] : [];
      farmToUpdate.tasks.push({
        id: 'diag-' + Date.now(),
        title: 'Treatment: ' + activityText,
        type: 'disease_management',
        date: new Date().toISOString().split('T')[0],
        completed: false,
        source: 'AI Diagnosis'
      });
      
      updatedFarms[selectedFarmIndex] = farmToUpdate;
      setFarms(updatedFarms);
      alert(`Added "${activityText}" to active farm calendar.`);
    } else {
      alert(`Task added: "${activityText}"`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {mode === 'results' && (
        <button
          type="button"
          onClick={() => setMode('input')}
          className="bg-white hover:bg-surface-container text-on-surface border border-outline-variant font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Leaf Diagnosis</span>
        </button>
      )}

      {mode === 'loading' && (
        <div className="bg-white rounded-3xl p-12 border border-outline-variant/60 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-display font-bold text-lg text-on-surface">Running Crop Health Orchestrator...</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            Analyzing leaf image features, cross-referencing weather risk factors, and calculating exact chemical dosage per acre.
          </p>
        </div>
      )}

      {mode === 'input' && (
        <UploadZone
          farmSource={farmSource}
          setFarmSource={setFarmSource}
          activeFarm={activeFarm}
          manualCrop={manualCrop}
          setManualCrop={setManualCrop}
          manualLocation={manualLocation}
          setManualLocation={setManualLocation}
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
          handleDiagnose={handleDiagnose}
          currentCrop={currentCrop}
          currentLocation={currentLocation}
        />
      )}

      {mode === 'results' && treatmentPlan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <DiseaseProfileCard
            diagnosisSummary={treatmentPlan.diagnosisSummary}
            weatherRisk={treatmentPlan.weatherRiskFactor}
            cropName={currentCrop}
          />

          <TreatmentPlanTabs
            treatmentPlan={treatmentPlan}
            areaAcres={currentArea}
          />

          <ActionTimeline
            timeline={treatmentPlan.actionTimeline || treatmentPlan.recoveryRoadmap}
            addToCalendar={addToCalendar}
          />
        </div>
      )}
    </div>
  );
}
