import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Droplet, ArrowRight, ShieldCheck, AlertTriangle, 
  Layers, DollarSign, RefreshCw, FileText, CheckCircle2, ChevronRight, 
  Info, Users, Shield, BookOpen, AlertCircle, TrendingUp, TrendingDown,
  ArrowLeft, Download, Share2, ClipboardList, CheckSquare, Settings, Wrench,
  MapPin, Leaf, Activity, ChevronDown, Check, CloudRain, Sun, Sprout, ShieldAlert
} from 'lucide-react';
import { t } from '../../utils/translations';
import { generateRecommendations, getGeminiVarieties } from '../../utils/aiRecommendationEngine';
import { getSoilHealthSummary } from '../../data/soilNutrientEngine';
import { generateAnnualStrategy } from '../../utils/annualPlannerEngine';

const CROPS_LIST_IDS = ['wheat', 'rice', 'maize', 'bajra', 'mustard', 'gram', 'cotton', 'soybean'];

// ── Seasons Definition ────────────────────────────────────────────────
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

export default function AnnualPlanner({
  profile,
  farms = [],
  selectedFarmIndex = 0,
  setSelectedFarmIndex,
  weatherData,
  language,
  setActiveDashboardTab,
  setFarms
}) {
  const activeFarm = farms[selectedFarmIndex];

  // ── Step State ──────────────────────────────────────────────────────
  // 'setup' | 'wizard' | 'strategy'
  const [step, setStep] = useState('setup');
  
  // Preferred Crops & Varieties (Hybrid Planning)
  const [wizardPreferences, setWizardPreferences] = useState({
    Kharif: { crop: '', variety: '' },
    Rabi: { crop: '', variety: '' },
    Zaid: { crop: '', variety: '' }
  });

  
  // Setup Options
  const [setupMode, setSetupMode] = useState('saved'); // 'saved' | 'manual'
  const [selectedFarmId, setSelectedFarmId] = useState(selectedFarmIndex);

  // Setup Form values
  const [setupForm, setSetupForm] = useState({
    location: activeFarm?.name ? `${activeFarm.village || ''}, ${activeFarm.district || ''}, ${activeFarm.state || ''}` : 'Pratapgarh, Rajasthan',
    district: activeFarm?.district || 'Pratapgarh',
    state: activeFarm?.state || 'Rajasthan',
    area: activeFarm?.area || '5',
    unit: activeFarm?.unit || 'Acres',
    soilType: activeFarm?.soil?.type || 'Loamy',
    irrigationSource: activeFarm?.water?.sources?.[0] || 'Borewell',
    farmingObjective: 'Maximum Profit',
    budgetRange: 'Medium (₹10,000 - ₹25,000)',
    farmingMethod: 'Conventional'
  });

  // Sync manual fields if saved farm changes
  useEffect(() => {
    if (activeFarm && setupMode === 'saved') {
      setSetupForm({
        location: `${activeFarm.village || ''}, ${activeFarm.district || ''}, ${activeFarm.state || ''}`,
        district: activeFarm.district || '',
        state: activeFarm.state || '',
        area: activeFarm.area || '5',
        unit: activeFarm.unit || 'Acres',
        soilType: activeFarm.soil?.type || 'Loamy',
        irrigationSource: activeFarm.water?.sources?.[0] || 'Borewell',
        farmingObjective: 'Maximum Profit',
        budgetRange: 'Medium (₹10,000 - ₹25,000)',
        farmingMethod: activeFarm.crop?.farmingType || 'Conventional'
      });
    }
  }, [activeFarm, setupMode]);

  // ── Wizard State ────────────────────────────────────────────────────
  const [wizardSeasonIndex, setWizardSeasonIndex] = useState(0); // 0 (Kharif), 1 (Rabi), 2 (Zaid)
  const [wizardCrops, setWizardCrops] = useState({ Kharif: null, Rabi: null, Zaid: null });
  const [seasonRecs, setSeasonRecs] = useState([]);

  // Generate crop recommendations for the current wizard season step
  useEffect(() => {
    if (step !== 'wizard') return;

    const currentSeason = SEASONS[wizardSeasonIndex];
    // Formulate a temporary farm object based on form parameters
    const tempFarm = {
      state: setupForm.state,
      district: setupForm.district,
      soil: { type: setupForm.soilType },
      water: { sources: [setupForm.irrigationSource.toLowerCase()] },
      area: setupForm.area
    };

    // Filter list of crops based on traditional season suitability
    let seasonalCrops = CROPS_LIST_IDS;
    if (currentSeason === 'Kharif') {
      seasonalCrops = ['rice', 'maize', 'cotton', 'soybean', 'bajra'];
    } else if (currentSeason === 'Rabi') {
      seasonalCrops = ['wheat', 'mustard', 'gram'];
    } else {
      seasonalCrops = ['bajra', 'maize']; // Short/catch crops for Zaid
    }

    const loadRecommendations = async () => {
      // 1. Try Gemini API first
      console.log(`[AnnualPlanner] Querying Gemini for ${currentSeason} varieties...`);
      const geminiResult = await getGeminiVarieties(
        currentSeason,
        setupForm.state,
        setupForm.soilType,
        setupForm.irrigationSource
      );

      if (geminiResult && Array.isArray(geminiResult) && geminiResult.length > 0) {
        console.log(`[AnnualPlanner] Successfully loaded ${geminiResult.length} varieties from Gemini!`);
        const mappedGemini = geminiResult.map((v, idx) => {
          const mspVal = parseInt(v.price) || 2200;
          const yieldVal = parseFloat(v.yield) || 20;
          const areaVal = parseFloat(setupForm.area) || 5.0;
          const projectedRevenue = Math.round(yieldVal * areaVal * mspVal);
          const estimatedCost = Math.round(areaVal * 12000);
          const projectedProfit = projectedRevenue - estimatedCost;

          return {
            id: `gemini-${v.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: v.name,
            description: v.description,
            institution: 'Gemini AI Recommendation',
            maturityDays: parseInt(v.duration) || 120,
            yieldPotential: yieldVal,
            seedRate: 40,
            spacingCm: '20×5',
            waterRequirement: 350,
            irrigationCount: 4,
            diseaseResistance: 4,
            pestResistance: 3,
            droughtTolerance: 3,
            floodTolerance: 2,
            heatTolerance: 4,
            suitableSoils: [setupForm.soilType],
            suitableStates: [setupForm.state],
            cropRotationBonus: {},
            nutrientRequirement: { N: 120, P: 60, K: 40 },
            organicAlternatives: { FYM: 10000 },
            msp: mspVal,
            livePrice: mspVal,
            projectedProfit,
            badges: ['Gemini AI Recommended', 'Optimal Fit'],
            cropName: currentSeason === 'Kharif' ? 'Rice' : (currentSeason === 'Rabi' ? 'Wheat' : 'Maize'),
            suitabilityScore: 90 - idx * 5
          };
        });
        setSeasonRecs(mappedGemini);
        return;
      }

      // 2. Fall back to local ICAR database
      console.log(`[AnnualPlanner] Gemini API quota limit/error. Using local ICAR recommendations database.`);
      const allVarieties = [];
      seasonalCrops.forEach(cId => {
        const cropRecs = generateRecommendations(cId, tempFarm, profile, weatherData, null);
        if (cropRecs && cropRecs.length > 0) {
          allVarieties.push(...cropRecs.map(v => ({
            ...v,
            cropName: cId.charAt(0).toUpperCase() + cId.slice(1)
          })));
        }
      });

      const filteredRecs = allVarieties
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, 3);
      setSeasonRecs(filteredRecs);
    };

    loadRecommendations();
  }, [step, wizardSeasonIndex, setupForm, weatherData, profile]);

  // ── Strategy & Detail Panel State ──────────────────────────────────
  const [strategyData, setStrategyData] = useState(null);
  const [activeSeasonTab, setActiveSeasonTab] = useState('Kharif');
  const [activeStrategyWorkspace, setActiveStrategyWorkspace] = useState('overview');
  const [nutrientMode, setNutrientMode] = useState('conventional');
  const [savedPlansHistory, setSavedPlansHistory] = useState(() => JSON.parse(localStorage.getItem('km_annual_plans_history') || '[]'));

  // ── Handlers ────────────────────────────────────────────────────────
  const handleStartWizard = () => {
    // Build initial wizardCrops from preferences
    const initialWizardCrops = { Kharif: null, Rabi: null, Zaid: null };
    let firstEmptySeasonIndex = -1;

    SEASONS.forEach((season, index) => {
      const pref = wizardPreferences[season];
      if (pref && pref.crop) {
        initialWizardCrops[season] = {
          id: `pref-${pref.crop.toLowerCase()}`,
          name: pref.variety || pref.crop,
          description: `Farmer preferred selection for ${season}.`,
          cropName: pref.crop,
          isFarmerSelected: true,
          yieldPotential: 25,
          livePrice: 2200,
          seedRate: 40,
          waterRequirement: 500,
          duration: 120,
          badges: ['Farmer Selected']
        };
      } else if (firstEmptySeasonIndex === -1) {
        firstEmptySeasonIndex = index;
      }
    });

    setWizardCrops(initialWizardCrops);

    // If all seasons are selected, jump straight to strategy
    if (firstEmptySeasonIndex === -1) {
      const targetFarm = farms[selectedFarmId] || {
        name: 'Manual Strategy Farm',
        state: setupForm.state,
        district: setupForm.district,
        soil: { type: setupForm.soilType },
        water: { sources: [setupForm.irrigationSource.toLowerCase()] },
        area: setupForm.area,
        unit: setupForm.unit
      };
      
      const strategy = generateAnnualStrategy(initialWizardCrops, targetFarm, setupForm.farmingMethod.toLowerCase());
      setStrategyData(strategy);
      setStep('strategy');
    } else {
      setWizardSeasonIndex(firstEmptySeasonIndex);
      setStep('wizard');
    }
  };

  const handleSelectCrop = (crop) => {
    const currentSeason = SEASONS[wizardSeasonIndex];
    setWizardCrops(prev => ({ ...prev, [currentSeason]: crop }));

    // Find next empty season
    let nextIndex = wizardSeasonIndex + 1;
    while (nextIndex < 3 && wizardPreferences[SEASONS[nextIndex]]?.crop) {
      nextIndex++;
    }

    // Advance wizard or generate strategy
    if (nextIndex < 3) {
      setWizardSeasonIndex(nextIndex);
    } else {
      // Complete selection -> Generate strategy
      const targetFarm = farms[selectedFarmId] || {
        name: 'Manual Strategy Farm',
        state: setupForm.state,
        district: setupForm.district,
        soil: { type: setupForm.soilType },
        water: { sources: [setupForm.irrigationSource.toLowerCase()] },
        area: setupForm.area,
        unit: setupForm.unit
      };
      
      const finalCrops = {
        Kharif: wizardCrops.Kharif || (wizardSeasonIndex === 0 ? crop : null),
        Rabi: wizardCrops.Rabi || (wizardSeasonIndex === 1 ? crop : null),
        Zaid: wizardCrops.Zaid || (wizardSeasonIndex === 2 ? crop : null)
      };

      const strategy = generateAnnualStrategy(finalCrops, targetFarm, setupForm.farmingMethod.toLowerCase());

      setStrategyData(strategy);
      setStep('strategy');
    }
  };

  const handleSaveAnnualPlan = () => {
    if (!activeFarm || !strategyData) return;

    // Create live tasks list for dashboard
    const generatedTasks = [];
    Object.entries(strategyData.details).forEach(([season, details]) => {
      details.calendar.forEach((act, idx) => {
        generatedTasks.push({
          id: `task-annual-${season}-${idx}`,
          title: `${act.activity} (${season} Crop)`,
          category: act.activity.includes('Fertilizer') || act.activity.includes('dressing') ? 'Fertilizer' : (act.activity.includes('Harvest') ? 'Harvesting' : 'Land Prep'),
          priority: idx === 0 || act.activity.includes('Harvest') ? 'High' : 'Medium',
          time: '07:30 AM',
          duration: act.duration,
          why: act.outcome,
          resources: act.resources,
          benefit: act.outcome,
          status: 'pending'
        });
      });
    });

    // Populate active farm crop confirmedPlan
    const updatedConfirmedPlan = {
      cropName: strategyData.timeline[0]?.cropName || 'Wheat',
      cropIcon: strategyData.timeline[0]?.cropName?.toLowerCase() === 'rice' ? '🌱' : '🌾',
      healthScore: 90,
      growthProgress: 0,
      harvestDays: 120,
      expectedYield: strategyData.timeline[0]?.estimatedYield || '24 Qtl',
      estimatedProfit: strategyData.financialSummary.netProfit,
      weatherStatus: 'Optimized',
      diseaseRisk: 'Low',
      waterStatus: 'Pre-sowing Setup',
      timelineStageIndex: 1,
      healthMetrics: {
        overall: 90,
        water: 95,
        nutrient: 88,
        disease: 5,
        weather: 20,
        growth: 5,
        readiness: 5
      },
      tasks: generatedTasks,
      actionFeed: [
        {
          id: 'cf-feed-annual-1',
          type: 'weather',
          title: 'Annual Plan Sowing Window Active',
          problem: 'Weather conditions are matching annual projection ranges.',
          reason: 'Expected local parameters are within agronomic window.',
          action: 'Initiate preparation activities defined in the Annual Calendar.',
          benefit: 'Ensures crops follow target maturation curve.',
          actionText: 'Review Sowing Window'
        }
      ]
    };

    const updatedFarms = [...farms];
    if (updatedFarms[selectedFarmIndex]) {
      updatedFarms[selectedFarmIndex].crop = {
        ...updatedFarms[selectedFarmIndex].crop,
        confirmedPlan: updatedConfirmedPlan
      };
      setFarms(updatedFarms);
    }

    // Save plan history record
    const newPlanRecord = {
      id: `plan-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      farmName: activeFarm.name,
      objective: setupForm.farmingObjective,
      crops: Object.entries(wizardCrops).map(([s, c]) => `${s}: ${c?.name || 'Fallow'}`).join(', '),
      cost: strategyData.financialSummary.totalCost,
      profit: strategyData.financialSummary.netProfit
    };

    const updatedHistory = [newPlanRecord, ...savedPlansHistory];
    setSavedPlansHistory(updatedHistory);
    localStorage.setItem('km_annual_plans_history', JSON.stringify(updatedHistory));

    alert('🎉 Annual Farming Strategy saved successfully! Your daily work checklist on the Dashboard has been updated with these tasks.');
    setActiveDashboardTab('dashboard');
  };

  const handleDuplicatePlan = (pastPlan) => {
    alert(`Duplicating strategy from ${pastPlan.date}. Re-calculating recommendations based on current weather parameters...`);
    handleStartWizard();
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans max-w-6xl mx-auto pb-12">
      
      {/* ── 1. SETUP PAGE ─────────────────────────────────────────────────── */}
      {step === 'setup' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 via-white to-secondary/5 border border-primary/20 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Calendar className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="text-xs text-primary font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-primary/10 inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Master Farm Assistant
              </span>
              <h2 className="font-display font-black text-3xl text-on-surface mt-4 tracking-tight">
                Plan Your Farming Year
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-xl leading-relaxed">
                Establish an intelligent crop rotation, monthly activities, and resource budgets for the entire year. We'll guide you step-by-step.
              </p>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSetupMode('saved')}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                setupMode === 'saved'
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-outline-variant hover:border-primary/40 hover:bg-surface-container-lowest text-on-surface'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${setupMode === 'saved' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Use Saved Farm</h3>
                  <p className={`text-xs mt-0.5 ${setupMode === 'saved' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    Start with your existing farm profile
                  </p>
                </div>
              </div>
              {setupMode === 'saved' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setSetupMode('manual')}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                setupMode === 'manual'
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-outline-variant hover:border-primary/40 hover:bg-surface-container-lowest text-on-surface'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${setupMode === 'manual' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Create Manual Plan</h3>
                  <p className={`text-xs mt-0.5 ${setupMode === 'manual' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    Enter details for a new scenario
                  </p>
                </div>
              </div>
              {setupMode === 'manual' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm space-y-8 relative">
            <h3 className="font-display font-extrabold text-lg text-on-surface flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Farm Parameters
            </h3>
            
            {setupMode === 'saved' ? (
              <div className="space-y-6">
                <div className="relative">
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Select Farm Profile</label>
                  <div className="relative">
                    <select 
                      value={selectedFarmId}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        setSelectedFarmId(idx);
                        setSelectedFarmIndex(idx);
                      }}
                      className="w-full h-14 border-2 border-outline-variant rounded-2xl px-5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest appearance-none cursor-pointer transition-colors"
                    >
                      {farms.map((f, i) => (
                        <option key={i} value={i}>{f.name} • {f.area} {f.unit} in {f.district}, {f.state}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
                
                {/* Auto-filled metadata cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest hover:border-primary/30 transition-colors">
                    <span className="text-[10px] font-black text-primary block uppercase tracking-wider mb-1">Soil Type</span>
                    <strong className="text-on-surface text-sm">{setupForm.soilType}</strong>
                  </div>
                  <div className="p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest hover:border-primary/30 transition-colors">
                    <span className="text-[10px] font-black text-blue-600 block uppercase tracking-wider mb-1">Water Source</span>
                    <strong className="text-on-surface text-sm capitalize">{setupForm.irrigationSource}</strong>
                  </div>
                  <div className="p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest hover:border-primary/30 transition-colors">
                    <span className="text-[10px] font-black text-green-600 block uppercase tracking-wider mb-1">Land Area</span>
                    <strong className="text-on-surface text-sm">{setupForm.area} {setupForm.unit}</strong>
                  </div>
                  <div className="p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest hover:border-primary/30 transition-colors">
                    <span className="text-[10px] font-black text-purple-600 block uppercase tracking-wider mb-1">Farming Type</span>
                    <strong className="text-on-surface text-sm">{setupForm.farmingMethod}</strong>
                  </div>
                </div>

                {/* Soil Health Card alert */}
                {activeFarm?.soil ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex gap-3 text-green-900 font-semibold items-start">
                    <div className="bg-green-100 p-2 rounded-xl shrink-0">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Soil Health Card Active</h4>
                      <p className="text-xs text-green-800/80 mt-1">Live NPK data parsed. Using exact nutrient gaps for precise fertilizer recommendations and cost reduction.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-900 font-semibold items-start">
                    <div className="bg-amber-100 p-2 rounded-xl shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Generalized Data Used</h4>
                      <p className="text-xs text-amber-800/80 mt-1">No Soil Health Card detected. Using generalized SAU regional baseline values. For higher accuracy, consider uploading your soil card.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">State</label>
                  <input 
                    type="text" 
                    value={setupForm.state}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full h-14 border-2 border-outline-variant rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">District</label>
                  <input 
                    type="text" 
                    value={setupForm.district}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full h-14 border-2 border-outline-variant rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Area Size</label>
                    <input 
                      type="number" 
                      value={setupForm.area}
                      onChange={(e) => setSetupForm(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full h-14 border-2 border-outline-variant rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="w-1/3 relative">
                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Unit</label>
                    <select 
                      value={setupForm.unit}
                      onChange={(e) => setSetupForm(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full h-14 border-2 border-outline-variant rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-primary bg-white transition-all appearance-none"
                    >
                      <option>Acres</option>
                      <option>Hectares</option>
                      <option>Bigha</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-4 top-[38px] text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Soil Type</label>
                  <select 
                    value={setupForm.soilType}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, soilType: e.target.value }))}
                    className="w-full h-14 border-2 border-outline-variant rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-primary bg-white transition-all appearance-none"
                  >
                    <option>Clayey</option>
                    <option>Loamy</option>
                    <option>Sandy</option>
                    <option>Black Cotton</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-4 top-[38px] text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            )}

            {/* Common planning preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/40">
              <div className="relative">
                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Primary Objective</label>
                <div className="relative">
                  <select 
                    value={setupForm.farmingObjective}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, farmingObjective: e.target.value }))}
                    className="w-full h-14 border-2 border-outline-variant rounded-2xl px-5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest appearance-none transition-colors"
                  >
                    <option>Maximum Profit</option>
                    <option>Water Saving</option>
                    <option>Organic Farming</option>
                    <option>High Yield</option>
                    <option>Soil Improvement</option>
                    <option>Crop Rotation</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
              <div className="relative">
                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Farming Method</label>
                <div className="relative">
                  <select 
                    value={setupForm.farmingMethod}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, farmingMethod: e.target.value }))}
                    className="w-full h-14 border-2 border-outline-variant rounded-2xl px-5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest appearance-none transition-colors"
                  >
                    <option>Conventional</option>
                    <option>Organic</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Preferred Crops & Varieties (Hybrid Planning) */}
            <div className="pt-6 border-t border-outline-variant/40">
              <h3 className="font-black text-sm text-on-surface mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Preferred Crops &amp; Varieties (Optional)
              </h3>
              <p className="text-[11px] text-on-surface-variant mb-4">
                Know what you want to grow? Select your preferred crops and varieties for each season. Leave blank to let our AI recommend the best options.
              </p>
              
              <div className="space-y-4">
                {/* Kharif */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40">
                  <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" /> Kharif (Monsoon — June to October)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Select Crop</label>
                      <div className="relative">
                        <select 
                          value={wizardPreferences.Kharif.crop}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Kharif: {...prev.Kharif, crop: e.target.value, variety: '', customCrop: ''}}))}
                          className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                        >
                          <option value="">🤖 AI Recommendation</option>
                          <optgroup label="── Cereals ──">
                            <option value="Rice">Rice (Dhan)</option>
                            <option value="Maize">Maize (Makka)</option>
                            <option value="Bajra">Bajra (Pearl Millet)</option>
                            <option value="Jowar">Jowar (Sorghum)</option>
                            <option value="Ragi">Ragi (Finger Millet)</option>
                            <option value="Kodo Millet">Kodo Millet</option>
                            <option value="Foxtail Millet">Foxtail Millet</option>
                          </optgroup>
                          <optgroup label="── Pulses ──">
                            <option value="Arhar">Arhar / Tur Dal (Pigeon Pea)</option>
                            <option value="Moong">Moong (Green Gram)</option>
                            <option value="Urad">Urad (Black Gram)</option>
                            <option value="Moth Bean">Moth Bean</option>
                            <option value="Cowpea">Cowpea (Lobia)</option>
                          </optgroup>
                          <optgroup label="── Oilseeds ──">
                            <option value="Soybean">Soybean</option>
                            <option value="Groundnut">Groundnut (Mungfali)</option>
                            <option value="Castor">Castor (Arandi)</option>
                            <option value="Sesame">Sesame (Til)</option>
                            <option value="Sunflower">Sunflower</option>
                          </optgroup>
                          <optgroup label="── Cash Crops ──">
                            <option value="Cotton">Cotton (Kapas)</option>
                            <option value="Sugarcane">Sugarcane (Ganna)</option>
                            <option value="Jute">Jute</option>
                            <option value="Tobacco">Tobacco</option>
                          </optgroup>
                          <optgroup label="── Vegetables ──">
                            <option value="Brinjal">Brinjal (Baingan)</option>
                            <option value="Okra">Okra (Bhindi)</option>
                            <option value="Bottle Gourd">Bottle Gourd (Lauki)</option>
                            <option value="Bitter Gourd">Bitter Gourd (Karela)</option>
                            <option value="Tinda">Tinda (Indian Round Gourd)</option>
                            <option value="Tomato">Tomato</option>
                            <option value="Chilli">Chilli (Mirch)</option>
                          </optgroup>
                          <optgroup label="── Others ──">
                            <option value="Other">✏️ Other (Enter custom crop)</option>
                          </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                      {wizardPreferences.Kharif.crop === 'Other' && (
                        <input
                          type="text"
                          placeholder="Type your crop name..."
                          value={wizardPreferences.Kharif.customCrop || ''}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Kharif: {...prev.Kharif, customCrop: e.target.value}}))}
                          className="mt-2 w-full border border-primary/50 rounded-lg p-2 text-xs focus:outline-none focus:border-primary bg-white"
                        />
                      )}
                    </div>
                    {wizardPreferences.Kharif.crop && wizardPreferences.Kharif.crop !== 'Other' && (
                      <div className="relative">
                        <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Preferred Variety</label>
                        <div className="relative">
                          <select 
                            value={wizardPreferences.Kharif.variety}
                            onChange={(e) => setWizardPreferences(prev => ({...prev, Kharif: {...prev.Kharif, variety: e.target.value}}))}
                            className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                          >
                            <option value="">🤖 Let AI Decide</option>
                            {wizardPreferences.Kharif.crop === 'Rice' && (<>
                              <option value="PR-126">PR-126</option>
                              <option value="Pusa Basmati 1509">Pusa Basmati 1509</option>
                              <option value="Arize 6444 Gold">Arize 6444 Gold</option>
                              <option value="Samba Mahsuri">Samba Mahsuri</option>
                              <option value="MTU-1010">MTU-1010</option>
                            </>)}
                            {wizardPreferences.Kharif.crop === 'Maize' && (<>
                              <option value="DKC 9144">DKC 9144</option>
                              <option value="P3401">Pioneer P3401</option>
                              <option value="NK 6240">NK 6240</option>
                            </>)}
                            {wizardPreferences.Kharif.crop === 'Cotton' && (<>
                              <option value="Bollgard II">Bollgard II (Bt)</option>
                              <option value="RCH 134 BT">RCH 134 BT</option>
                              <option value="MRC 7017 BT">MRC 7017 BT</option>
                            </>)}
                            {wizardPreferences.Kharif.crop === 'Soybean' && (<>
                              <option value="JS 335">JS 335</option>
                              <option value="NRC 37">NRC 37</option>
                              <option value="MAUS 158">MAUS 158</option>
                            </>)}
                            {wizardPreferences.Kharif.crop === 'Arhar' && (<>
                              <option value="Asha (UPAS 120)">Asha (UPAS 120)</option>
                              <option value="Maruti">Maruti</option>
                            </>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rabi */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40">
                  <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-500" /> Rabi (Winter — November to March)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Select Crop</label>
                      <div className="relative">
                        <select 
                          value={wizardPreferences.Rabi.crop}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Rabi: {...prev.Rabi, crop: e.target.value, variety: '', customCrop: ''}}))}
                          className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                        >
                          <option value="">🤖 AI Recommendation</option>
                          <optgroup label="── Cereals ──">
                            <option value="Wheat">Wheat (Gehun)</option>
                            <option value="Barley">Barley (Jau)</option>
                            <option value="Oat">Oat (Jai)</option>
                          </optgroup>
                          <optgroup label="── Pulses ──">
                            <option value="Gram">Gram / Chickpea (Chana)</option>
                            <option value="Lentil">Lentil (Masoor)</option>
                            <option value="Pea">Field Pea (Matar)</option>
                            <option value="Rajma">Rajma (Kidney Bean)</option>
                          </optgroup>
                          <optgroup label="── Oilseeds ──">
                            <option value="Mustard">Mustard (Sarson)</option>
                            <option value="Linseed">Linseed (Alsi)</option>
                            <option value="Safflower">Safflower (Kardi)</option>
                            <option value="Sunflower">Sunflower (Rabi)</option>
                          </optgroup>
                          <optgroup label="── Vegetables ──">
                            <option value="Potato">Potato (Aloo)</option>
                            <option value="Onion">Onion (Pyaaz)</option>
                            <option value="Garlic">Garlic (Lahsun)</option>
                            <option value="Cauliflower">Cauliflower (Phool Gobhi)</option>
                            <option value="Cabbage">Cabbage (Patta Gobhi)</option>
                            <option value="Spinach">Spinach (Palak)</option>
                            <option value="Carrot">Carrot (Gajar)</option>
                            <option value="Radish">Radish (Mooli)</option>
                            <option value="Turnip">Turnip (Shalgam)</option>
                            <option value="Methi">Methi (Fenugreek)</option>
                          </optgroup>
                          <optgroup label="── Cash Crops ──">
                            <option value="Sugarcane">Sugarcane (Rabi planting)</option>
                          </optgroup>
                          <optgroup label="── Others ──">
                            <option value="Other">✏️ Other (Enter custom crop)</option>
                          </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                      {wizardPreferences.Rabi.crop === 'Other' && (
                        <input
                          type="text"
                          placeholder="Type your crop name..."
                          value={wizardPreferences.Rabi.customCrop || ''}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Rabi: {...prev.Rabi, customCrop: e.target.value}}))}
                          className="mt-2 w-full border border-primary/50 rounded-lg p-2 text-xs focus:outline-none focus:border-primary bg-white"
                        />
                      )}
                    </div>
                    {wizardPreferences.Rabi.crop && wizardPreferences.Rabi.crop !== 'Other' && (
                      <div className="relative">
                        <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Preferred Variety</label>
                        <div className="relative">
                          <select 
                            value={wizardPreferences.Rabi.variety}
                            onChange={(e) => setWizardPreferences(prev => ({...prev, Rabi: {...prev.Rabi, variety: e.target.value}}))}
                            className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                          >
                            <option value="">🤖 Let AI Decide</option>
                            {wizardPreferences.Rabi.crop === 'Wheat' && (<>
                              <option value="HD-2967">HD-2967</option>
                              <option value="PBW-725">PBW-725</option>
                              <option value="DBW-187">Karan Vandana (DBW-187)</option>
                              <option value="GW-322">Lok-1 (GW-322)</option>
                              <option value="K-307">K-307</option>
                            </>)}
                            {wizardPreferences.Rabi.crop === 'Mustard' && (<>
                              <option value="Pusa Bold">Pusa Bold</option>
                              <option value="RH-749">RH-749</option>
                              <option value="RH-8812">RH-8812</option>
                            </>)}
                            {wizardPreferences.Rabi.crop === 'Gram' && (<>
                              <option value="JG-11">JG-11</option>
                              <option value="Pusa 256">Pusa 256</option>
                              <option value="KAK-2">KAK-2</option>
                            </>)}
                            {wizardPreferences.Rabi.crop === 'Potato' && (<>
                              <option value="Kufri Jyoti">Kufri Jyoti</option>
                              <option value="Kufri Pukhraj">Kufri Pukhraj</option>
                              <option value="Kufri Chipsona">Kufri Chipsona</option>
                            </>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zaid */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40">
                  <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-500" /> Zaid (Summer — April to June)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Select Crop</label>
                      <div className="relative">
                        <select 
                          value={wizardPreferences.Zaid.crop}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Zaid: {...prev.Zaid, crop: e.target.value, variety: '', customCrop: ''}}))}
                          className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                        >
                          <option value="">🤖 AI Recommendation</option>
                          <optgroup label="── Short Duration Pulses ──">
                            <option value="Green Gram">Green Gram (Moong)</option>
                            <option value="Black Gram">Black Gram (Urad)</option>
                            <option value="Cowpea">Cowpea (Lobia)</option>
                          </optgroup>
                          <optgroup label="── Vegetables ──">
                            <option value="Watermelon">Watermelon (Tarbooz)</option>
                            <option value="Muskmelon">Muskmelon (Kharbooja)</option>
                            <option value="Cucumber">Cucumber (Kheera)</option>
                            <option value="Pumpkin">Pumpkin (Kaddu)</option>
                            <option value="Sponge Gourd">Sponge Gourd (Turai)</option>
                            <option value="Snake Gourd">Snake Gourd</option>
                            <option value="Ridge Gourd">Ridge Gourd (Tinda)</option>
                            <option value="Amaranth">Amaranth (Chaulai)</option>
                            <option value="Cluster Bean">Cluster Bean (Guar)</option>
                          </optgroup>
                          <optgroup label="── Fodder & Cover Crops ──">
                            <option value="Bajra Fodder">Bajra Fodder</option>
                            <option value="Jowar Fodder">Jowar Fodder</option>
                            <option value="Maize Fodder">Maize Fodder</option>
                            <option value="Sunhemp">Sunhemp (Green Manure)</option>
                            <option value="Dhaincha">Dhaincha (Green Manure)</option>
                          </optgroup>
                          <optgroup label="── Others ──">
                            <option value="Sesame">Sesame (Til)</option>
                            <option value="Sunflower">Sunflower (Summer)</option>
                            <option value="Jute">Jute</option>
                            <option value="Other">✏️ Other (Enter custom crop)</option>
                          </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                      {wizardPreferences.Zaid.crop === 'Other' && (
                        <input
                          type="text"
                          placeholder="Type your crop name..."
                          value={wizardPreferences.Zaid.customCrop || ''}
                          onChange={(e) => setWizardPreferences(prev => ({...prev, Zaid: {...prev.Zaid, customCrop: e.target.value}}))}
                          className="mt-2 w-full border border-primary/50 rounded-lg p-2 text-xs focus:outline-none focus:border-primary bg-white"
                        />
                      )}
                    </div>
                    {wizardPreferences.Zaid.crop && wizardPreferences.Zaid.crop !== 'Other' && (
                      <div className="relative">
                        <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Preferred Variety</label>
                        <div className="relative">
                          <select 
                            value={wizardPreferences.Zaid.variety}
                            onChange={(e) => setWizardPreferences(prev => ({...prev, Zaid: {...prev.Zaid, variety: e.target.value}}))}
                            className="w-full border border-outline-variant rounded-lg p-2 pr-8 text-xs focus:outline-none focus:border-primary appearance-none bg-white"
                          >
                            <option value="">🤖 Let AI Decide</option>
                            {wizardPreferences.Zaid.crop === 'Watermelon' && (<>
                              <option value="Sugar Baby">Sugar Baby</option>
                              <option value="Arka Manik">Arka Manik</option>
                              <option value="Durgapura Meetha">Durgapura Meetha</option>
                            </>)}
                            {wizardPreferences.Zaid.crop === 'Green Gram' && (<>
                              <option value="Pusa Vishal">Pusa Vishal</option>
                              <option value="HUM 1">HUM 1</option>
                              <option value="SML 668">SML 668</option>
                            </>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartWizard}
              className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold h-16 rounded-2xl text-sm shadow-[0_8px_16px_rgba(33,197,93,0.25)] hover:shadow-[0_12px_24px_rgba(33,197,93,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-6"
            >
              <span>Generate AI Plan & Select Crops</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Saved annual plans history log */}
          {savedPlansHistory.length > 0 && (
            <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="font-display font-extrabold text-lg text-on-surface flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" /> 
                Past Annual Plans
              </h3>
              <div className="grid gap-4">
                {savedPlansHistory.map(plan => (
                  <div key={plan.id} className="p-5 border border-outline-variant/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest hover:border-primary/30 transition-colors">
                    <div>
                      <strong className="text-on-surface text-base block font-black">Plan - {plan.date}</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Obj: {plan.objective}
                        </span>
                        <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                          Crops: {plan.crops}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDuplicatePlan(plan)}
                      className="text-sm font-bold text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                    >
                      Duplicate Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SEASON-BY-SEASON PLANNING WIZARD ───────────────────────────── */}
      {step === 'wizard' && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" 
                style={{ width: `${(wizardSeasonIndex / 2) * 100}%` }}
              />
              
              {SEASONS.map((season, idx) => (
                <div key={season} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors duration-300 ${
                    wizardSeasonIndex > idx ? 'bg-primary text-white' : 
                    wizardSeasonIndex === idx ? 'bg-white border-4 border-primary text-primary shadow-lg' : 
                    'bg-white border-4 border-surface-container text-outline'
                  }`}>
                    {wizardSeasonIndex > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    wizardSeasonIndex >= idx ? 'text-on-surface' : 'text-outline'
                  }`}>{season}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-display font-black text-2xl text-on-surface">
                  Select <span className="text-primary">{SEASONS[wizardSeasonIndex]}</span> Crop
                </h3>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  AI-ranked recommendations based on your soil, {SEASONS[wizardSeasonIndex]} weather forecast, and {setupForm.farmingObjective.toLowerCase()} objective.
                </p>
              </div>
              <div className="hidden md:flex gap-1 text-[10px] font-black uppercase text-on-surface-variant tracking-widest bg-surface-container-low px-3 py-1.5 rounded-full">
                Step {wizardSeasonIndex + 1} of 3
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {seasonRecs.map((crop, idx) => (
                <div 
                  key={crop.id}
                  className={`bg-white border-2 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group ${
                    idx === 0 
                      ? 'border-primary shadow-[0_8px_24px_rgba(33,197,93,0.15)] hover:shadow-[0_12px_32px_rgba(33,197,93,0.25)]' 
                      : 'border-outline-variant/60 shadow-sm hover:border-primary/50 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectCrop(crop)}
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-black text-xl text-on-surface">{crop.name}</h4>
                        <span className="text-xs text-on-surface-variant font-bold block mt-0.5">{crop.institution}</span>
                      </div>
                      {idx === 0 && (
                        <div className="flex items-center gap-1 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider animate-pulse-slow">
                          <Sparkles className="w-3 h-3" /> Best Match
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Yield Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface-variant flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Est. Yield</span>
                          <span className="text-on-surface">{crop.yieldPotential} Qtl</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(parseInt(crop.yieldPotential) * 2, 100)}%` }} />
                        </div>
                      </div>

                      {/* Profit Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface-variant flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Live Market Rate</span>
                          <span className="text-green-700">₹{crop.livePrice || crop.msp}/Qtl</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>

                      {/* Water Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface-variant flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> Water Need</span>
                          <span className="text-blue-700">{crop.waterRequirement} mm</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(parseInt(crop.waterRequirement) / 10, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className={`w-full mt-6 font-bold text-sm py-3 rounded-xl transition-all ${
                    idx === 0 
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-md' 
                      : 'bg-surface-container text-on-surface group-hover:bg-primary group-hover:text-white'
                  }`}>
                    Select {crop.name}
                  </button>
                </div>
              ))}

              {/* Fallow land rest option */}
              <div 
                className="bg-[#faf7f2] border-2 border-[#e6dcc3] rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-amber-500/50 hover:shadow-md group"
                onClick={() => handleSelectCrop({ id: 'fallow', name: 'Leave Fallow', cropName: 'Fallow Recovery' })}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 mb-2">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xl text-amber-900">Leave Land Fallow</h4>
                    <span className="text-xs text-amber-800 font-bold block mt-0.5">Soil Recovery Season</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-amber-900/80 mt-2">
                    Advised for organic matter recovery. Sowing a cover crop during this time can increase succeeding yield by up to 15%.
                  </p>
                </div>

                <button className="w-full mt-6 font-bold text-sm py-3 rounded-xl bg-amber-200/50 text-amber-900 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  Rest Soil This Season
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. STRATEGY WORKSPACE ────────────────────────────────────────── */}
      {step === 'strategy' && strategyData && (
        <div className="space-y-6">
          
          {/* Header Controls */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-on-surface">Annual Farming Strategy</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Complete optimized roadmap for {setupForm.area} {setupForm.unit} in {setupForm.district}</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setStep('setup')}
                className="flex-1 sm:flex-none bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container font-bold text-sm px-5 py-3 rounded-2xl transition-all"
              >
                Start Over
              </button>
              <button 
                onClick={handleSaveAnnualPlan}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Save & Activate
              </button>
            </div>
          </div>

          {/* Connected Horizontal Timeline */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
            <h3 className="font-display font-black text-base text-on-surface mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Your Crop Rotation Journey
            </h3>
            
            <div className="flex flex-col md:flex-row items-stretch gap-4 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-surface-container -translate-y-1/2 z-0 rounded-full" />
              
              {strategyData.timeline.map((item, idx) => {
                const isActive = activeSeasonTab === item.season;
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveSeasonTab(item.season)}
                    className={`flex-1 relative z-10 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                      isActive 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                        : 'border-surface-container bg-white hover:border-primary/40 hover:bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isActive ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-on-surface'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {item.season}
                      </span>
                    </div>
                    
                    <strong className="text-on-surface text-lg block font-black font-display leading-tight">{item.cropName}</strong>
                    <span className="text-xs text-on-surface-variant font-bold block mt-1">
                      {item.variety !== 'N/A' ? `${item.variety} • ${item.duration}` : 'Soil rest & recovery'}
                    </span>
                    
                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {wizardPreferences[item.season]?.crop ? (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold py-1 px-2 rounded border border-blue-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Farmer Selected
                        </span>
                      ) : item.cropName !== 'Fallow' ? (
                        <span className="text-[10px] bg-primary/10 text-primary font-extrabold py-1 px-2 rounded border border-primary/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Recommended
                        </span>
                      ) : null}
                    </div>

                    {/* Mismatch Warning */}
                    {wizardPreferences[item.season]?.crop && item.waterRequirement && item.waterRequirement > 700 && setupForm.irrigationSource.toLowerCase() === 'rainfed' && (
                      <div className="mt-3 text-[10px] bg-orange-50 text-orange-800 border border-orange-200 rounded p-2">
                        <div className="font-bold flex items-center gap-1 mb-1">
                          <ShieldAlert className="w-3 h-3" /> Condition Mismatch
                        </div>
                        Requires high water. Rainfed may be risky.
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setWizardPreferences(prev => ({...prev, [item.season]: {crop: '', variety: ''}}));
                            setStep('setup');
                          }}
                          className="text-orange-900 underline font-bold mt-1 block hover:text-orange-700"
                        >
                          Use AI Recommendation Instead
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workspace Content split */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Modern Sidebar */}
            <div className="lg:col-span-1 bg-white border border-outline-variant/60 rounded-3xl p-4 shadow-sm h-fit">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block px-4 mb-3 mt-2">
                {activeSeasonTab} Plan
              </span>
              <nav className="space-y-1.5">
                {[
                  { id: 'overview', label: 'Season Overview', icon: Info },
                  { id: 'calendar', label: 'Monthly Calendar', icon: Calendar },
                  { id: 'nutrients', label: 'Smart Nutrient Plan', icon: Layers },
                  { id: 'water', label: 'Water Strategy', icon: Droplet },
                  { id: 'pests', label: 'Pest Prevention', icon: AlertTriangle },
                  { id: 'schemes', label: 'Govt. Subsidies', icon: Shield },
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeStrategyWorkspace === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStrategyWorkspace(tab.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all relative overflow-hidden ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                      <IconComp className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-on-surface-variant/70'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Workspace detail area */}
            <div className="lg:col-span-3 bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm min-h-[500px]">
              
              {/* ── Tab: Overview ── */}
              {activeStrategyWorkspace === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                      <Info className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-xl text-on-surface">
                      {strategyData.details[activeSeasonTab].overview.title}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
                      <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Primary Objective</span>
                      <strong className="text-sm text-on-surface">{strategyData.details[activeSeasonTab].overview.objective}</strong>
                    </div>
                    <div className="p-5 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
                      <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Expected Timeline</span>
                      <strong className="text-sm text-on-surface">{strategyData.details[activeSeasonTab].overview.timelineText}</strong>
                    </div>
                    <div className="p-5 border border-outline-variant/50 rounded-2xl bg-surface-container-lowest sm:col-span-2">
                      <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Financial Outlook
                      </span>
                      <strong className="text-base text-green-700 block mt-1">{strategyData.details[activeSeasonTab].overview.profitability}</strong>
                    </div>
                  </div>
                    
                  <div className="p-5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-2xl text-amber-900 mt-2">
                    <h5 className="font-bold text-sm flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Key Considerations
                    </h5>
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                      {strategyData.details[activeSeasonTab].overview.warnings}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Tab: Calendar ── */}
              {activeStrategyWorkspace === 'calendar' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-xl text-on-surface">
                      Monthly Action Plan
                    </h4>
                  </div>
                  
                  <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-container-high before:to-transparent pt-4 pb-4">
                    {strategyData.details[activeSeasonTab].calendar.map((act, idx) => (
                      <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                        {/* Timeline Node */}
                        <div className="absolute left-0 md:left-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-white border-4 border-primary -translate-x-1/2 shadow-sm group-hover:scale-125 transition-transform" />
                        
                        {/* Content Card */}
                        <div className="ml-8 md:ml-0 md:w-[calc(50%-2rem)] md:odd:pr-8 md:even:pl-8">
                          <div className="p-5 bg-white border-2 border-outline-variant/40 rounded-2xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md inline-block mb-3">
                              {act.month}
                            </span>
                            <h5 className="font-black text-base text-on-surface mb-2">{act.activity}</h5>
                            <div className="space-y-1.5 text-xs text-on-surface-variant font-medium mb-3">
                              <p className="flex justify-between"><span>Timing:</span> <strong className="text-on-surface">{act.date}</strong></p>
                              <p className="flex justify-between"><span>Duration:</span> <strong className="text-on-surface">{act.duration}</strong></p>
                              <p className="flex justify-between"><span>Est. Cost:</span> <strong className="text-on-surface">₹{act.cost.toLocaleString('en-IN')}</strong></p>
                            </div>
                            <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container">
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Expected Outcome</span>
                              <p className="text-xs text-on-surface font-semibold">{act.outcome}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab: Nutrients ── */}
              {activeStrategyWorkspace === 'nutrients' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-black text-xl text-on-surface">
                        Nutrient Planner
                      </h4>
                    </div>
                    <div className="bg-surface-container-lowest p-1 rounded-xl border flex">
                      <button 
                        onClick={() => setNutrientMode('conventional')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          nutrientMode === 'conventional' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Inorganic
                      </button>
                      <button 
                        onClick={() => setNutrientMode('organic')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          nutrientMode === 'organic' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Organic
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed bg-surface-container-lowest p-4 rounded-2xl border">
                    <Info className="w-4 h-4 inline-block mr-2 text-primary -mt-0.5" />
                    {strategyData.details[activeSeasonTab].nutrients.summary}
                  </p>

                  <div className="grid gap-4">
                    {strategyData.details[activeSeasonTab].nutrients.items.map((item, idx) => (
                      <div key={idx} className="p-5 border-2 border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 transition-all bg-white shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-white bg-primary px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              {item.stage}
                            </span>
                          </div>
                          <strong className="text-on-surface text-lg block font-black mt-2">{item.name}</strong>
                          <p className="text-xs text-on-surface-variant font-medium mt-1">
                            Recommended Brands: <span className="font-bold">{item.brands}</span>
                          </p>
                        </div>
                        <div className="sm:text-right bg-surface-container-lowest p-3 rounded-xl border border-surface-container w-full sm:w-auto">
                          <strong className="text-primary block text-2xl font-black">{item.qty} <span className="text-sm">{item.unit}</span></strong>
                          <span className="text-xs text-on-surface-variant font-bold block mt-1">Est. Cost: ₹{item.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab: Water ── */}
              {activeStrategyWorkspace === 'water' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Droplet className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-xl text-on-surface">
                      Water Management
                    </h4>
                  </div>
                  
                  <div className="grid gap-5">
                    {strategyData.details[activeSeasonTab].water.items.map((item, idx) => (
                      <div key={idx} className="p-5 border-2 border-outline-variant/40 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <strong className="text-on-surface text-lg font-black">{item.event}</strong>
                            <div className="text-xs text-on-surface-variant font-bold mt-1">{item.stage}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-black text-blue-700">{item.durationHours} hrs pumping</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-on-surface-variant">Volume required</span>
                            <span className="text-blue-800">{item.waterLiters} L/acre</span>
                          </div>
                          <div className="w-full bg-blue-50 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }} />
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs flex gap-2 items-start text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-medium">{item.savingAdvisory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab: Pests ── */}
              {activeStrategyWorkspace === 'pests' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                    <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-xl text-on-surface">
                      Pest & Disease Prevention
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {strategyData.details[activeSeasonTab].pests.map((pest, idx) => (
                      <div key={idx} className="p-5 border-2 border-outline-variant/40 rounded-2xl bg-white shadow-sm hover:border-red-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <strong className="text-on-surface text-lg font-black leading-tight pr-2">{pest.name}</strong>
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-1 rounded-md shrink-0">
                            {pest.probability} Risk
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-green-800 uppercase block mb-1">Organic Prevention</span>
                            <p className="text-xs text-on-surface font-medium">{pest.organic}</p>
                          </div>
                          <div className="bg-surface-container-lowest border p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Chemical Control</span>
                            <p className="text-xs text-on-surface font-medium">{pest.chemical}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab: Schemes ── */}
              {activeStrategyWorkspace === 'schemes' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-xl text-on-surface">
                      Govt. Schemes & Subsidies
                    </h4>
                  </div>
                  
                  <div className="grid gap-4">
                    {strategyData.details[activeSeasonTab].schemes.map((scheme, idx) => (
                      <div key={idx} className="p-5 border-2 border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 transition-all bg-white shadow-sm group">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <strong className="text-on-surface text-base font-black">{scheme.name}</strong>
                          </div>
                          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{scheme.benefits}</p>
                        </div>
                        <a 
                          href={scheme.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white font-bold text-sm px-5 py-2.5 rounded-xl shrink-0 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          Apply Now <ChevronRight className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
