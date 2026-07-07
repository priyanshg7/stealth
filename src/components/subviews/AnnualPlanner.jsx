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
import { generateCropSchedule } from '../../utils/farmScheduleEngine';
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
  setFarms,
  seasonPlanConfirmed,
  setSeasonPlanConfirmed
}) {
  const activeFarm = farms[selectedFarmIndex];
  const hasActivePlan = !!activeFarm?.crop?.confirmedPlan;

  // ── Step State ──────────────────────────────────────────────────────
  // 'active-overview' | 'setup' | 'wizard' | 'strategy' | 'history'
  const [step, setStep] = useState(() => {
    return hasActivePlan ? 'active-overview' : 'setup';
  });

  useEffect(() => {
    if (hasActivePlan) {
      setStep('active-overview');
    } else if (step === 'active-overview') {
      setStep('setup');
    }
  }, [selectedFarmIndex, hasActivePlan]);
  
  const [viewingHistoryPlan, setViewingHistoryPlan] = useState(false);
  const [historyPlanData, setHistoryPlanData] = useState(null);
  
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
            waterRequirement: v.waterRequirement || 350,
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
            badges: Array.isArray(v.badges) ? v.badges : ['Gemini AI Recommended', 'Optimal Fit'],
            cropName: v.cropName || (currentSeason === 'Kharif' ? 'Rice' : (currentSeason === 'Rabi' ? 'Wheat' : 'Maize')),
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

    const currentYear = new Date().getFullYear();
    const seasonSowingDates = {
      Kharif: `${currentYear}-06-15`,
      Rabi: `${currentYear}-11-05`,
      Zaid: `${currentYear}-04-05`
    };

    // Generate tasks list using the farmScheduleEngine for each season
    const generatedTasks = [];
    Object.entries(wizardCrops).forEach(([season, crop]) => {
      if (crop && crop.id !== 'fallow') {
        const sowingDate = seasonSowingDates[season];
        const duration = crop.maturityDays || 120;
        const cropTasks = generateCropSchedule({
          cropName: crop.cropName || crop.name,
          varietyName: crop.name,
          sowingDate: sowingDate,
          area: setupForm.area,
          irrigationMethods: [setupForm.irrigationSource.toLowerCase()],
          farmingMethod: setupForm.farmingMethod,
          durationDays: duration,
          existingTasks: []
        });

        const seasonTasks = cropTasks.map(t => ({
          ...t,
          id: `${t.id}-${season}`,
          title: `${t.title} (${season})`,
          season: season
        }));

        generatedTasks.push(...seasonTasks);
      }
    });

    // Determine current active crop based on season of the year
    const todayMonth = new Date().getMonth();
    let activeSeason = 'Kharif';
    if (todayMonth >= 10 || todayMonth <= 2) {
      activeSeason = 'Rabi';
    } else if (todayMonth >= 3 && todayMonth <= 4) {
      activeSeason = 'Zaid';
    }

    const activeCropInfo = wizardCrops[activeSeason] || wizardCrops.Kharif || wizardCrops.Rabi || wizardCrops.Zaid;
    const activeCropName = activeCropInfo?.cropName || activeCropInfo?.name || 'Wheat';
    const activeSowingDate = seasonSowingDates[activeSeason] || `${currentYear}-06-15`;

    const addDaysLocal = (dateStr, days) => {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };
    const activeHarvestDate = addDaysLocal(activeSowingDate, activeCropInfo?.maturityDays || 120);

    // Populate active farm crop confirmedPlan
    const updatedConfirmedPlan = {
      cropName: activeCropName,
      cropIcon: activeCropName.toLowerCase() === 'rice' ? '🌱' : (activeCropName.toLowerCase() === 'wheat' ? '🌾' : '🌽'),
      healthScore: 90,
      growthProgress: 0,
      harvestDays: activeCropInfo?.maturityDays || 120,
      expectedYield: `${activeCropInfo?.yieldPotential || 22} Quintals/Acre`,
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
      // Archive old crop if present
      const oldCrop = updatedFarms[selectedFarmIndex].crop;
      if (oldCrop && oldCrop.name) {
        if (!updatedFarms[selectedFarmIndex].cropHistory) {
          updatedFarms[selectedFarmIndex].cropHistory = [];
        }
        const isDuplicate = updatedFarms[selectedFarmIndex].cropHistory.some(
          h => h.name === oldCrop.name && h.sowingDate === oldCrop.sowingDate
        );
        if (!isDuplicate) {
          updatedFarms[selectedFarmIndex].cropHistory.push({
            ...oldCrop,
            archivedAt: new Date().toISOString()
          });
        }
      }

      updatedFarms[selectedFarmIndex].crop = {
        name: activeCropName,
        variety: activeCropInfo?.name || 'Karan Vandana',
        stage: 'Sowing / Preparation',
        sowingDate: activeSowingDate,
        harvestDate: activeHarvestDate,
        previousCrop: setupForm.farmingMethod,
        farmingType: setupForm.farmingMethod,
        confirmedPlan: updatedConfirmedPlan
      };
      updatedFarms[selectedFarmIndex].area = setupForm.area;
      updatedFarms[selectedFarmIndex].unit = setupForm.unit;
      updatedFarms[selectedFarmIndex].district = setupForm.district;
      updatedFarms[selectedFarmIndex].state = setupForm.state;

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
      profit: strategyData.financialSummary.netProfit,
      fullStrategy: strategyData,
      wizardCrops: wizardCrops,
      setupForm: setupForm
    };

    const updatedHistory = [newPlanRecord, ...savedPlansHistory];
    setSavedPlansHistory(updatedHistory);
    localStorage.setItem('km_annual_plans_history', JSON.stringify(updatedHistory));

    setSeasonPlanConfirmed(true);
    alert('🎉 Annual Farming Strategy saved successfully! Your daily work checklist on the Dashboard has been updated with these tasks.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('active-overview');
  };

  const handleViewHistoryPlan = (pastPlan) => {
    if (pastPlan.fullStrategy) {
      setStrategyData(pastPlan.fullStrategy);
      setWizardCrops(pastPlan.wizardCrops);
      setSetupForm(pastPlan.setupForm || setupForm);
      setViewingHistoryPlan(true);
      setStep('strategy');
    } else {
      alert("This historical plan was saved in a previous version and cannot be fully viewed in read-only mode.");
    }
  };

  const handleDuplicatePlan = (pastPlan) => {
    alert(`Duplicating strategy from ${pastPlan.date}. Re-calculating recommendations based on current weather parameters...`);
    handleStartWizard();
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans max-w-6xl mx-auto pb-12">
      
      {/* ── 0. ACTIVE PLAN OVERVIEW ─────────────────────────────────────────────────── */}
      {step === 'active-overview' && activeFarm?.crop?.confirmedPlan && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white rounded-card border-2 border-primary/20 shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <CheckCircle2 className="w-48 h-48 text-primary" />
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{activeFarm.crop.confirmedPlan.cropIcon || '🌱'}</span>
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-on-surface">Active Farming Plan</h2>
                  <p className="text-sm text-on-surface-variant font-medium">Currently driving your farm dashboard.</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                   <span className="bg-[#e6f4ea] text-[#0f5132] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 border border-[#cbf0d7]">
                     <span className="w-2 h-2 rounded-full bg-[#0f5132] animate-pulse" />
                     Live Status
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Active Crop</div>
                  <div className="font-bold text-sm text-on-surface">{activeFarm.crop.name}</div>
                  <div className="text-xs text-primary font-semibold truncate">{activeFarm.crop.variety}</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Target Farm</div>
                  <div className="font-bold text-sm text-on-surface">{activeFarm.name}</div>
                  <div className="text-xs text-on-surface-variant truncate">{activeFarm.area} {activeFarm.unit}</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Current Stage</div>
                  <div className="font-bold text-sm text-on-surface">{activeFarm.crop.stage}</div>
                  <div className="text-xs text-on-surface-variant">{activeFarm.crop.growthProgress || 0}% Completed</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Last Updated</div>
                  <div className="font-bold text-sm text-on-surface">{new Date().toLocaleDateString()}</div>
                  <div className="text-xs text-on-surface-variant">Active Tracking</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveDashboardTab('dashboard')}
                  className="bg-primary hover:bg-[#004e20] text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  View Today's Tasks
                </button>
                <button
                  onClick={() => setActiveDashboardTab('journey')}
                  className="bg-white border-2 border-primary/20 text-primary hover:bg-primary/5 font-extrabold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Farm Journey
                </button>
                
                <div className="flex-grow"></div>
                
                <button
                  onClick={() => setStep('history')}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-extrabold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Plan History
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm("Creating a new plan will replace your current active plan. The old plan will be saved in your history. Do you want to continue?")) {
                      setStep('setup');
                    }
                  }}
                  className="bg-white border border-outline-variant hover:border-error/40 hover:text-error text-on-surface-variant font-extrabold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create New Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 0.5. PLAN HISTORY ─────────────────────────────────────────────────── */}
      {step === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('active-overview')} className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high">
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <h2 className="font-display font-extrabold text-2xl text-on-surface">Annual Plan History</h2>
          </div>
          
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
             {(!savedPlansHistory || savedPlansHistory.length === 0) ? (
                <div className="p-12 text-center text-on-surface-variant">
                   <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-bold">No historical plans found.</p>
                   <p className="text-xs mt-1">Previous annual plans will appear here.</p>
                </div>
             ) : (
                <div className="divide-y divide-outline-variant/30">
                  {savedPlansHistory.map((pastPlan, i) => (
                    <div key={i} className="p-6 hover:bg-surface-container-lowest transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-on-surface">{pastPlan.farmName}</h3>
                            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase">Archived</span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-bold">
                            Created: {pastPlan.date}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {pastPlan.crops}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {pastPlan.fullStrategy ? (
                          <button
                            onClick={() => handleViewHistoryPlan(pastPlan)}
                            className="bg-white border border-outline-variant hover:border-primary/40 text-primary font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Archive
                          </button>
                        ) : (
                           <span className="text-xs text-on-surface-variant/50 italic py-2.5">Data Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      )}

      {/* ── 1. SETUP PAGE ─────────────────────────────────────────────────── */}
      {step === 'setup' && (
        <div className="space-y-6">
          {hasActivePlan && (
            <div className="bg-warning-container/30 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface">You already have an active farming plan.</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Creating a new annual plan will override your current active dashboard tasks.</p>
              </div>
              <button onClick={() => setStep('active-overview')} className="ml-auto text-xs font-bold text-primary hover:underline">Cancel</button>
            </div>
          )}
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

          {/* Removed saved annual plans history log from here, it now lives in the 'history' step */}
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
              {seasonRecs.map((crop, idx) => {
                const estimatedProfitValue = Math.round((crop.livePrice || crop.msp) * crop.yieldPotential * (parseFloat(setupForm.area) || 1) * 0.65); // 65% margin estimate
                return (
                <div 
                  key={crop.id}
                  className={`bg-white border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 h-auto min-h-[450px] rounded-[24px] group relative ${
                    idx === 0 
                      ? 'border-2 border-[#0c8a47] ring-1 ring-[#0c8a47]/20 shadow-md translate-y-[-2px]' 
                      : 'border-outline-variant/60 shadow-sm hover:border-[#0c8a47]/40 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectCrop(crop)}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-extrabold text-xl text-on-surface">{crop.name}</h4>
                        <span className="text-xs text-on-surface-variant font-bold block mt-0.5">{crop.institution}</span>
                      </div>
                      {idx === 0 && (
                        <div className="flex items-center gap-1 bg-[#0c8a47] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider animate-pulse-slow shrink-0">
                          <Sparkles className="w-3 h-3" /> Best Match
                        </div>
                      )}
                    </div>

                    {/* Estimated Net Profit Row */}
                    <div className="space-y-1 bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/30">
                      <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-on-surface-variant" /> Estimated Net Profit
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl font-black text-[#0c8a47]">₹{estimatedProfitValue.toLocaleString()}</span>
                        <span className="text-[11px] text-on-surface-variant font-bold">for {setupForm.area || 1} {setupForm.unit || 'Acre'}</span>
                      </div>
                    </div>

                    {/* Key Technical Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-[10px] border-y border-outline-variant/40 py-3 font-bold text-on-surface-variant">
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Est. Yield</span> <span className="text-on-surface font-extrabold">{crop.yieldPotential} Qtl</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Duration</span> <span className="text-on-surface font-extrabold">{crop.maturityDays} days</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Water Req.</span> <span className="text-on-surface font-extrabold">{crop.waterRequirement} mm</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Disease Resist.</span> <span className="text-on-surface font-extrabold block truncate">{crop.diseaseResistance >= 4 ? 'High' : 'Moderate'}</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Irrigation</span> <span className="text-on-surface font-extrabold">{crop.irrigationCount} cycles</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Soil Type</span> <span className="text-on-surface font-extrabold block truncate" title={crop.suitableSoils?.join(', ')}>{crop.suitableSoils?.join(', ')}</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Sells Price</span> <span className="text-[#0c8a47] font-black">₹{crop.livePrice || crop.msp}/Qtl</span></div>
                      <div><span className="text-[8px] text-on-surface-variant/80 uppercase block tracking-wider">Market Demand</span> <span className="text-on-surface font-extrabold">{crop.exportDemand || 'Medium'}</span></div>
                    </div>

                    {/* Dynamic Agronomist "Why this?" text */}
                    <div className="text-[11px] leading-relaxed text-on-surface-variant h-[90px] overflow-y-auto pr-1">
                      <strong className="text-on-surface text-xs font-bold block mb-1">Why this?</strong>
                      <ul className="list-disc pl-4 space-y-1.5 text-on-surface-variant font-medium">
                        {crop.keyTraits?.map((trait, tIdx) => <li key={tIdx}>{trait}</li>)}
                        <li>{crop.premiumGrade ? 'Premium grade commands higher market value.' : 'Standard mandi staple.'}</li>
                        {crop.waterRequirement <= 500 && <li>Water efficient crop suitable for limited irrigation.</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className={`w-full font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      idx === 0 
                        ? 'bg-[#0c8a47] text-white hover:bg-[#096a36] shadow-md' 
                        : 'bg-surface-container text-on-surface hover:bg-[#0c8a47] hover:text-white'
                    }`}>
                      <Check className={`w-4 h-4 ${idx === 0 ? 'text-white' : 'opacity-70 group-hover:text-white group-hover:opacity-100'}`} />
                      Select {crop.name}
                    </button>
                  </div>
                </div>
                );
              })}

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
              <div className="flex items-center gap-2 text-primary mb-2">
                <button 
                  onClick={() => {
                    if (viewingHistoryPlan) {
                      setStep('history');
                      setViewingHistoryPlan(false);
                    } else {
                      setStep('setup');
                    }
                  }} 
                  className="flex items-center gap-1.5 text-xs font-bold hover:underline bg-primary/10 px-2 py-1 rounded-md"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to {viewingHistoryPlan ? 'History' : 'Setup'}
                </button>
                {viewingHistoryPlan && (
                  <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-2">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Read Only (Archived)
                  </span>
                )}
              </div>
              <h2 className="font-display font-black text-2xl text-on-surface">Annual Farming Strategy</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Complete optimized roadmap for {setupForm.area} {setupForm.unit} in {setupForm.district}</p>
            </div>
            {!viewingHistoryPlan && (
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
            )}
          </div>

          {/* Continuous Vertical "Final Year-Long Plan" */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display font-black text-2xl text-on-surface mb-8 border-b pb-4">
              Final Year-Long Plan
            </h3>
            
            <div className="space-y-16">
              {['Kharif', 'Rabi', 'Zaid'].map((season) => {
                const details = strategyData.details[season];
                const timelineInfo = strategyData.timeline.find(t => t.season === season);
                
                if (!details || !timelineInfo) return null;
                
                return (
                  <div key={season} className="relative">
                    {/* Season Header */}
                    <div className="mb-6">
                      <h4 className="font-display font-black text-2xl text-[#0c8a47]">
                        {season} Season: {timelineInfo.cropName} {timelineInfo.variety !== 'N/A' ? `(${timelineInfo.variety})` : ''}
                      </h4>
                      <p className="text-sm text-on-surface-variant font-bold mt-1">
                        {details.overview.timelineText} • {details.overview.objective}
                      </p>
                    </div>

                    <div className="space-y-10">
                      {/* Monthly Activity Calendar Table */}
                      <div>
                        <h5 className="font-display font-black text-lg text-on-surface mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-on-surface-variant" />
                          Monthly Activity Calendar
                        </h5>
                        <div className="overflow-x-auto rounded-xl border border-outline-variant/40">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-surface-container-lowest border-b border-outline-variant/40">
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-32">Month</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">Key Activities</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                              {details.calendar.map((act, idx) => (
                                <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                                  <td className="p-4 text-sm font-bold text-on-surface">{act.month}</td>
                                  <td className="p-4 text-sm font-medium text-on-surface-variant">
                                    <span className="text-primary font-bold">{act.activity}:</span> {act.outcome}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Fertilizer & Nutrient Schedule */}
                      <div>
                        <h5 className="font-display font-black text-lg text-on-surface mb-3 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-on-surface-variant" />
                          Fertilizer & Nutrient Schedule
                        </h5>
                        
                        {/* Inorganic/Organic Toggle */}
                        <div className="flex bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/40 mb-4 w-fit">
                          <button 
                            onClick={() => setNutrientMode('conventional')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                              nutrientMode === 'conventional' ? 'bg-white text-primary shadow-sm border border-outline-variant/20' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            Inorganic Plan
                          </button>
                          <button 
                            onClick={() => setNutrientMode('organic')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                              nutrientMode === 'organic' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            Organic Plan
                          </button>
                        </div>

                        {details.nutrients.items.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-outline-variant/40">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/40">
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-48">Stage</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-48">Fertilizer</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-32">Quantity</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">Method</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/20">
                                {details.nutrients.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                                    <td className="p-4 text-sm font-bold text-[#b54a4a]">{item.stage}</td>
                                    <td className="p-4 text-sm font-bold text-on-surface">{item.name}</td>
                                    <td className="p-4 text-sm font-bold text-on-surface">{item.qty} {item.unit}</td>
                                    <td className="p-4 text-sm font-medium text-on-surface-variant">{item.method}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-center">
                            <p className="text-sm font-bold text-on-surface-variant">{details.nutrients.summary}</p>
                          </div>
                        )}
                      </div>

                      {/* Pest & Disease Prevention */}
                      {timelineInfo.cropName !== 'Fallow Land' && (
                        <div>
                          <h5 className="font-display font-black text-lg text-on-surface mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-on-surface-variant" />
                            Pest & Disease Prevention
                          </h5>
                          
                          {details.pests && details.pests.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-outline-variant/40">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-surface-container-lowest border-b border-outline-variant/40">
                                    <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-40">Threat</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-48">Symptoms</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">Organic Prevention</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">Chemical Control</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                  {details.pests.map((pest, idx) => (
                                    <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                                      <td className="p-4">
                                        <strong className="text-sm font-bold text-red-700 block">{pest.name}</strong>
                                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">{pest.probability} Risk</span>
                                      </td>
                                      <td className="p-4 text-xs font-medium text-on-surface-variant">{pest.symptoms}</td>
                                      <td className="p-4 text-xs font-medium text-green-700 bg-green-50/30">{pest.organic || pest.prevention}</td>
                                      <td className="p-4 text-xs font-medium text-on-surface-variant">{pest.chemical}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex items-start gap-3">
                              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <p className="text-sm font-medium text-on-surface-variant">
                                No critical seasonal pests flagged for this specific crop variety in your region. However, maintain general vigilance. Implement standard crop rotation and clean cultivation practices to prevent soil-borne diseases. Use neem-oil sprays preventatively if unusual weather patterns emerge.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Water Management */}
                      {details.water && details.water.items && details.water.items.length > 0 && (
                        <div>
                          <h5 className="font-display font-black text-lg text-on-surface mb-3 flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-blue-500" />
                            Water Management
                          </h5>
                          <div className="overflow-x-auto rounded-xl border border-outline-variant/40">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-blue-50/50 border-b border-outline-variant/40">
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-48">Irrigation Event</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">Growth Stage</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-36">Volume (L/acre)</th>
                                  <th className="p-4 text-xs font-black uppercase tracking-wider text-on-surface-variant w-32">Pump Duration</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/20">
                                {details.water.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 text-sm font-bold text-blue-700">{item.event}</td>
                                    <td className="p-4 text-xs font-medium text-on-surface-variant">{item.stage}</td>
                                    <td className="p-4 text-sm font-bold text-on-surface">{item.waterLiters?.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-sm font-bold text-on-surface">{item.durationHours} hrs</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs flex gap-2 items-start text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{details.water.items[0]?.savingAdvisory || details.water.warnings}</span>
                          </div>
                        </div>
                      )}

                      {/* Government Schemes & Subsidies */}
                      {details.schemes && details.schemes.length > 0 && (
                        <div>
                          <h5 className="font-display font-black text-lg text-on-surface mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-on-surface-variant" />
                            Government Schemes & Subsidies
                          </h5>
                          <div className="grid gap-3">
                            {details.schemes.map((scheme, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/40 hover:border-primary/30 transition-all group">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                                    <strong className="text-sm font-black text-on-surface">{scheme.name}</strong>
                                  </div>
                                  <p className="text-xs text-on-surface-variant font-medium ml-6">{scheme.benefits}</p>
                                </div>
                                <a 
                                  href={scheme.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white font-bold text-xs px-4 py-2 rounded-lg shrink-0 transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
                                >
                                  Apply <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="mt-12 pt-8 border-t-2 border-outline-variant/40">
              <h4 className="font-display font-black text-xl text-on-surface mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Annual Financial Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-green-600 block mb-1">Total Revenue</span>
                  <strong className="text-2xl font-black text-green-800">₹{strategyData.financialSummary.totalRevenue.toLocaleString('en-IN')}</strong>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-red-600 block mb-1">Total Cost</span>
                  <strong className="text-2xl font-black text-red-800">₹{strategyData.financialSummary.totalCost.toLocaleString('en-IN')}</strong>
                </div>
                <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-primary block mb-1">Estimated Net Profit</span>
                  <strong className="text-2xl font-black text-primary">₹{strategyData.financialSummary.netProfit.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
