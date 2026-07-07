import React, { useState, useRef } from 'react';
import { generateDiseaseTreatmentPlan } from '../../utils/aiRecommendationEngine';

export default function DiseaseDiagnosis({ weatherData, activeFarm, farms, setFarms, selectedFarmIndex }) {
  const [mode, setMode] = useState('input'); // 'input' | 'loading' | 'results'
  const [farmSource, setFarmSource] = useState('saved'); // 'saved' | 'manual'
  
  const [manualCrop, setManualCrop] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [rawPrediction, setRawPrediction] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('inorganic'); // 'inorganic' | 'organic'

  const fileInputRef = useRef(null);

  const currentCrop = farmSource === 'saved' ? (activeFarm?.crop?.name || 'Wheat') : manualCrop;
  const rawLocation = farmSource === 'saved' ? `${activeFarm?.village || ''} ${activeFarm?.district || ''} ${activeFarm?.state || ''}`.trim() : manualLocation;
  const currentLocation = rawLocation.replace(/\s+/g, ', ') || 'Unknown Location';
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
      // 1. Call Python ML ONNX Pipeline
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('crop', currentCrop);
      
      const mlResponse = await fetch('/ml-api/v1/diagnosis/predict', {
        method: 'POST',
        body: formData
      });
      
      if (!mlResponse.ok) {
        const errText = await mlResponse.text();
        throw new Error(`ML Pipeline failed: ${mlResponse.status} ${errText}`);
      }
      
      const mlData = await mlResponse.json();
      setRawPrediction(mlData);

      // 2. Call Groq AI Recommendation Engine
      const aiData = await generateDiseaseTreatmentPlan(currentCrop, mlData.disease, currentArea, weatherData, currentLocation);
      
      if (!aiData) {
         throw new Error("AI Recommendation Engine failed to generate a treatment plan.");
      }
      
      setTreatmentPlan(aiData);
      
      // 3. Save to History if saved farm
      if (farmSource === 'saved' && activeFarm && setFarms) {
        const updatedFarms = [...farms];
        const farmToUpdate = { ...updatedFarms[selectedFarmIndex] };
        
        const newHistoryItem = {
          date: new Date().toISOString(),
          disease: mlData.disease,
          confidence: mlData.confidence,
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
      alert("Added to Today's Work / Calendar!");
    } else {
      alert("Must use a Saved Farm to add to calendar.");
    }
  };

  if (mode === 'loading') {
    return (
      <div className="bg-white border rounded-card p-12 shadow-sm max-w-4xl mx-auto animate-fade-in-up font-sans text-center space-y-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <h2 className="font-display font-extrabold text-2xl text-on-surface">Analyzing Leaf Imagery...</h2>
        <p className="text-on-surface-variant">Our EfficientNet deep learning model is analyzing the cellular structure of your crop.</p>
        <p className="text-xs text-primary font-bold animate-pulse">Running AI Treatment Generation...</p>
      </div>
    );
  }

  if (mode === 'results' && rawPrediction && treatmentPlan) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in-up font-sans">
        {/* Back Button */}
        <button 
          onClick={() => setMode('input')} 
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Diagnosis Results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Diagnosis */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 pb-4">
                <h2 className="font-bold text-lg text-gray-900">Submitted plant photo</h2>
              </div>
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={imagePreview} alt="Uploaded Leaf" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-xl text-gray-900">Diagnosis: {rawPrediction.disease}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">
                  {treatmentPlan.description}
                </p>
                
                <div className="pt-2">
                  <h4 className="font-bold text-[17px] text-gray-900 mb-3">Key Symptoms</h4>
                  <ul className="text-[15px] text-gray-600 space-y-2 list-disc pl-5">
                    {treatmentPlan.symptoms?.map((sym, idx) => (
                      <li key={idx} className="pl-1">{sym}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Treatment Plan */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 mb-2">Treatment Plan</h2>
              <p className="text-[15px] text-gray-500 mb-6">
                Follow these recommendations to treat the issue and protect your crops. Cures and suggestions are tailored for your region ({currentLocation}).
              </p>
              
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full">
                <button 
                  onClick={() => setActiveTab('inorganic')} 
                  className={`flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all ${activeTab === 'inorganic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Inorganic Cure
                </button>
                <button 
                  onClick={() => setActiveTab('organic')} 
                  className={`flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all ${activeTab === 'organic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Organic Cure
                </button>
              </div>

              {/* Cure Cards */}
              <div className="space-y-4">
                {activeTab === 'inorganic' ? (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm animate-fade-in-up">
                    <h3 className="font-bold text-[17px] text-gray-900 mb-3">{treatmentPlan.inorganicCure?.name}</h3>
                    <p className="text-[15px] text-gray-700 mb-2 leading-relaxed">
                      <span className="font-bold text-gray-900">Application:</span> {treatmentPlan.inorganicCure?.application}
                    </p>
                    <p className="text-[14px] text-red-500 leading-relaxed mt-3">
                      <span className="font-bold">Warning:</span> {treatmentPlan.inorganicCure?.warning}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm animate-fade-in-up">
                    <h3 className="font-bold text-[17px] text-gray-900 mb-3">{treatmentPlan.organicCure?.name}</h3>
                    <p className="text-[15px] text-gray-700 mb-2 leading-relaxed">
                      <span className="font-bold text-gray-900">Application:</span> {treatmentPlan.organicCure?.application}
                    </p>
                    <p className="text-[14px] text-red-500 leading-relaxed mt-3">
                      <span className="font-bold">Warning:</span> {treatmentPlan.organicCure?.warning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Treatment Schedule */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm mt-8 overflow-hidden">
              <div className="p-6 pb-2">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[22px]">calendar_today</span>
                  Treatment Schedule
                </h3>
              </div>
              
              <div className="w-full">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-gray-500 font-medium text-[15px]">
                  <div className="col-span-2">Week</div>
                  <div className="col-span-7">Activity</div>
                  <div className="col-span-3 text-right">Action</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {treatmentPlan.schedule?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-2">
                        <span className="font-bold text-[15px] text-gray-900">{item.week}</span>
                      </div>
                      <div className="col-span-7 pr-4">
                        <p className="text-[15px] text-gray-700 leading-relaxed">{item.activity}</p>
                      </div>
                      <div className="col-span-3 text-right">
                        <button 
                          onClick={() => addToCalendar(item.activity)}
                          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-lg px-3 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Add to Calendar
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'input'
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl font-bold">photo_camera</span> Disease Diagnosis
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Select a farm or enter details manually, then provide an image or symptoms.</p>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {/* Farm Source Toggle */}
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          <button 
            onClick={() => setFarmSource('saved')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${farmSource === 'saved' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Use a Saved Farm
          </button>
          <button 
            onClick={() => setFarmSource('manual')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${farmSource === 'manual' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Enter Details Manually
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">Crop Name*</label>
            {farmSource === 'saved' ? (
              <div className="w-full bg-surface-container-low/50 border border-surface-container-high rounded-xl p-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{activeFarm?.crop?.name || 'No Farm Selected'}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  value={manualCrop} 
                  onChange={(e) => setManualCrop(e.target.value)} 
                  className="w-full bg-surface-container-low/50 border border-primary/50 focus:border-primary rounded-xl p-3 text-sm outline-none transition-all"
                  placeholder="e.g. Wheat"
                />
                <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant text-lg">mic</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">Location*</label>
            {farmSource === 'saved' ? (
              <div className="w-full bg-surface-container-low/50 border border-surface-container-high rounded-xl p-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-on-surface">{activeFarm?.location || 'Unknown'}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  value={manualLocation} 
                  onChange={(e) => setManualLocation(e.target.value)} 
                  className="w-full bg-surface-container-low/50 border border-primary/50 focus:border-primary rounded-xl p-3 text-sm outline-none transition-all"
                  placeholder="e.g. Pratapgarh, Rajasthan"
                />
                <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant text-lg">mic</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Zone */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-surface-container-high flex gap-4">
            <button className="pb-2 border-b-2 border-primary text-primary font-bold text-xs">Image Upload</button>
            <button className="pb-2 text-on-surface-variant hover:text-on-surface font-bold text-xs">Describe Symptoms</button>
          </div>
          
          <div className="border-2 border-dashed border-outline-variant/80 rounded-2xl p-8 text-center bg-surface-container-low/20 flex flex-col items-center justify-center min-h-[250px] relative">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            
            {imagePreview ? (
              <div className="space-y-4 flex flex-col items-center w-full">
                <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-lg shadow-sm border border-surface-container-high" />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-white border border-outline-variant rounded-xl px-4 py-2 text-xs font-bold hover:bg-surface-container flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span> Change Image
                </button>
              </div>
            ) : (
              <div className="space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="bg-primary-container/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Upload a clear photo of the affected plant part.</h4>
                  <p className="text-[11px] text-on-surface-variant mt-1">Accepts PNG, JPG (Max 8MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex">
          <button
            onClick={handleDiagnose}
            disabled={!imageFile || !currentCrop}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold shadow-sm transition-all ${(!imageFile || !currentCrop) ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-primary hover:bg-secondary text-white hover:-translate-y-0.5 hover:shadow-md'}`}
          >
            <span className="material-symbols-outlined text-[18px]">psychiatry</span> Diagnose Problem
          </button>
        </div>
      </div>
    </div>
  );
}
