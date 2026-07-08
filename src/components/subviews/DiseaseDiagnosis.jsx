import React, { useState, useRef } from 'react';
import { diagnoseDisease } from '../../utils/diagnosisService';
import { 
  ArrowLeft, ShieldAlert, Activity, CheckCircle2, AlertTriangle, 
  Thermometer, Droplets, Wind, Calendar, ShieldCheck, Leaf, 
  CalendarClock, Stethoscope, Beaker
} from 'lucide-react';

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
      // 1. Call Multimodal AI Service (abstracted Gemini call)
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
      
      // Set the raw prediction for backward compatibility with UI state
      setRawPrediction({
        disease: aiData.diagnosisSummary.diseaseName,
        confidence: aiData.diagnosisSummary.confidence
      });
      
      setTreatmentPlan(aiData);
      
      // 3. Save to History if saved farm
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
      alert("Added to Today's Work / Farm Journey!");
    } else {
      alert("Must use a Saved Farm to add to calendar.");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (mode === 'loading') {
    return (
      <div className="bg-white border rounded-card p-12 shadow-sm max-w-4xl mx-auto animate-fade-in-up font-sans text-center space-y-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <h2 className="font-display font-extrabold text-2xl text-gray-900">Analyzing Leaf Imagery...</h2>
        <p className="text-gray-500">Our EfficientNet deep learning model is analyzing the cellular structure of your crop.</p>
        <p className="text-xs text-primary font-bold animate-pulse">Running AI Treatment Generation...</p>
      </div>
    );
  }

  if (mode === 'results' && rawPrediction && treatmentPlan) {
    const { diagnosisSummary, diseaseProfile, treatments, schedule, riskAssessment, preventionAndBestPractices } = treatmentPlan;
    
    return (
      <div className="max-w-7xl mx-auto animate-fade-in-up font-sans pb-12">
        {/* Back Button */}
        <button 
          onClick={() => setMode('input')} 
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Diagnosis Results
        </button>

        {/* Top Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Stethoscope className="w-5 h-5" />
              <span className="font-semibold text-sm">Diagnosis</span>
            </div>
            <h3 className="font-bold text-xl text-gray-900">{diagnosisSummary?.diseaseName || rawPrediction.disease}</h3>
            <p className="text-sm text-gray-500 mt-1">Confidence: <span className="font-semibold text-primary">{diagnosisSummary?.confidence || 'High'}</span></p>
          </div>
          
          <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${getSeverityColor(diagnosisSummary?.severity)}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold text-sm">Severity Level</span>
            </div>
            <h3 className="font-bold text-xl capitalize">{diagnosisSummary?.severity || 'Moderate'}</h3>
            <p className="text-sm mt-1 opacity-90">Requires immediate attention</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between md:col-span-2">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Activity className="w-5 h-5" />
              <span className="font-semibold text-sm">Immediate Action & Prognosis</span>
            </div>
            <p className="font-medium text-gray-900 text-[15px] leading-snug">{diagnosisSummary?.immediateAction}</p>
            <div className="flex items-center gap-1.5 mt-2 text-sm font-bold text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              {diagnosisSummary?.canRecover}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Profile */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="w-full h-72 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={imagePreview} alt="Uploaded Leaf" className="w-full h-full object-cover" />
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2 mb-4">Disease Profile</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Scientific Name</p>
                      <p className="font-semibold text-gray-900 italic">{diseaseProfile?.scientificName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Category</p>
                      <p className="font-semibold text-gray-900">{diseaseProfile?.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Spread Method</p>
                      <p className="font-semibold text-gray-900">{diseaseProfile?.spreadMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Affected Parts</p>
                      <p className="font-semibold text-gray-900">{diseaseProfile?.affectedParts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Economic Impact</h4>
                  <p className="text-sm text-orange-900 leading-relaxed">{diseaseProfile?.economicImpact}</p>
                  <p className="text-sm font-bold text-red-600 mt-2">Expected Yield Loss: {diseaseProfile?.expectedYieldLoss}</p>
                </div>

                <div>
                  <h4 className="font-bold text-[16px] text-gray-900 mb-3">Early Symptoms</h4>
                  <ul className="text-[14.5px] text-gray-700 space-y-1.5 list-disc pl-5 marker:text-primary">
                    {diseaseProfile?.earlySymptoms?.map((sym, idx) => (
                      <li key={idx} className="pl-1">{sym}</li>
                    ))}
                  </ul>
                </div>
                
                {diseaseProfile?.advancedSymptoms?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[16px] text-gray-900 mb-3">Advanced Symptoms</h4>
                    <ul className="text-[14.5px] text-gray-700 space-y-1.5 list-disc pl-5 marker:text-red-500">
                      {diseaseProfile?.advancedSymptoms?.map((sym, idx) => (
                        <li key={idx} className="pl-1">{sym}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-blue-500" />
                Disease Risk Assessment
              </h3>
              <div className="bg-blue-50 text-blue-900 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4" /> Weather Impact
                </p>
                <p className="text-sm">{riskAssessment?.weatherImpact}</p>
              </div>
              <p className="text-[14.5px] text-gray-700 leading-relaxed">
                {riskAssessment?.explanation}
              </p>
            </div>
          </div>

          {/* Right Panel: Treatments & Schedule */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Treatments Section */}
            <div>
              <h2 className="font-bold text-2xl text-gray-900 mb-2">Comprehensive Treatment Plan</h2>
              <p className="text-[15px] text-gray-500 mb-6">
                Calculated for {currentArea} Acre(s) in {currentLocation}.
              </p>
              
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full">
                <button 
                  onClick={() => setActiveTab('inorganic')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[15px] font-bold rounded-lg transition-all ${activeTab === 'inorganic' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Beaker className="w-4 h-4" /> Inorganic Options
                </button>
                <button 
                  onClick={() => setActiveTab('organic')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[15px] font-bold rounded-lg transition-all ${activeTab === 'organic' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Leaf className="w-4 h-4" /> Organic Options
                </button>
              </div>

              <div className="space-y-6">
                {(treatments?.[activeTab] || []).map((cure, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in-up">
                    <div className={`p-4 border-b ${activeTab === 'inorganic' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                      <h3 className="font-bold text-lg text-gray-900">{cure.productName}</h3>
                      <p className="text-sm font-semibold text-gray-600 mt-1">Active Ingredient: {cure.activeIngredient}</p>
                    </div>
                    
                    <div className="p-5 space-y-5">
                      <div>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                          <span className="font-semibold text-gray-900">Purpose: </span> 
                          {cure.whyRecommended}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Quantity ({currentArea} Acre)</p>
                          <p className="font-bold text-gray-900 flex items-start gap-1.5">
                            <Droplets className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {cure.totalQuantityForFarm}
                          </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Dosage per Acre</p>
                          <p className="font-semibold text-gray-900">{cure.dosagePerAcre}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Application Method</p>
                          <p className="font-semibold text-gray-900">{cure.applicationMethod}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Best Timing</p>
                          <p className="font-semibold text-gray-900">{cure.bestTiming}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Interval</p>
                          <p className="font-semibold text-gray-900">{cure.interval}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Pre-Harvest Interval</p>
                          <p className="font-semibold text-gray-900">{cure.preHarvestInterval}</p>
                        </div>
                      </div>

                      {cure.warnings?.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-red-800 flex items-center gap-1.5 mb-2">
                            <ShieldAlert className="w-4 h-4" /> Safety Warnings
                          </h4>
                          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                            {cure.warnings.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!treatments?.[activeTab] || treatments?.[activeTab].length === 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-gray-500">No {activeTab} treatments found in the recommendation plan.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Treatment Schedule */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <CalendarClock className="w-6 h-6 text-primary" />
                  Action Timeline
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {schedule?.map((item, idx) => (
                  <div key={idx} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[15px] text-gray-900">{item.stage}</span>
                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">{item.estimatedDate}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        item.priorityLevel === 'High' ? 'bg-red-100 text-red-700' :
                        item.priorityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.priorityLevel} Priority
                      </span>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed mb-4">{item.activity}</p>
                    
                    <button 
                      onClick={() => addToCalendar(`${item.stage}: ${item.activity}`)}
                      className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-lg px-3.5 py-1.5 text-sm font-bold text-primary hover:bg-primary/5 transition-colors shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      Add to Farm Journey
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention & Best Practices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Prevention & Best Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preventionAndBestPractices?.map((practice, idx) => (
                  <div key={idx} className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                    <h4 className="font-bold text-[15px] text-gray-900 mb-1.5">{practice.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{practice.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // mode === 'input'
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined notranslate text-primary text-2xl font-bold">photo_camera</span> Disease Diagnosis
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Select a farm or enter details manually, then provide an image or symptoms.</p>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {/* Farm Source Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setFarmSource('saved')} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${farmSource === 'saved' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Use a Saved Farm
          </button>
          <button 
            onClick={() => setFarmSource('manual')} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${farmSource === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Enter Details Manually
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Crop Name*</label>
            {farmSource === 'saved' ? (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{activeFarm?.crop?.name || 'No Farm Selected'}</span>
                <span className="material-symbols-outlined notranslate text-gray-400 text-lg">lock</span>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  value={manualCrop} 
                  onChange={(e) => setManualCrop(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl p-3 text-sm outline-none transition-all"
                  placeholder="e.g. Wheat"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Location*</label>
            {farmSource === 'saved' ? (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">{activeFarm?.location || 'Unknown'}</span>
                <span className="material-symbols-outlined notranslate text-gray-400 text-lg">lock</span>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  value={manualLocation} 
                  onChange={(e) => setManualLocation(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl p-3 text-sm outline-none transition-all"
                  placeholder="e.g. Pratapgarh, Rajasthan"
                />
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Zone */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-200 flex gap-4">
            <button className="pb-2 border-b-2 border-primary text-primary font-bold text-sm">Image Upload</button>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-gray-50/50 flex flex-col items-center justify-center min-h-[250px] relative">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            
            {imagePreview ? (
              <div className="space-y-4 flex flex-col items-center w-full">
                <img src={imagePreview} alt="Preview" className="max-h-56 object-contain rounded-lg shadow-sm border border-gray-200" />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined notranslate text-[18px]">upload</span> Change Image
                </button>
              </div>
            ) : (
              <div className="space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <span className="material-symbols-outlined notranslate text-3xl">add_photo_alternate</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Upload a clear photo of the affected plant part.</h4>
                  <p className="text-xs text-gray-500 mt-1">Accepts PNG, JPG (Max 8MB)</p>
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
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold shadow-sm transition-all ${(!imageFile || !currentCrop) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary text-white hover:-translate-y-0.5 hover:shadow-md'}`}
          >
            <span className="material-symbols-outlined notranslate text-[20px]">psychiatry</span> Diagnose Problem
          </button>
        </div>
      </div>
    </div>
  );
}
