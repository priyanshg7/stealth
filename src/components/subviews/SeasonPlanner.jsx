import React, { useState, useEffect } from 'react';
import { 
  Check, ArrowRight, Info, Sparkles, AlertCircle, Calendar, 
  MapPin, ShoppingBag, Droplet, Layers, Sprout, 
  TrendingUp, ShieldAlert, FileText, Settings, Award, ArrowLeft,
  ChevronRight, RefreshCw, FileCheck, Clock, Mic, Compass,
  ChevronDown, ChevronUp, Users, Wrench, Shield, DollarSign, CheckCircle2,
  CheckSquare, Activity, ClipboardList, AlertTriangle
} from 'lucide-react';
import { generateRecommendations, getGeminiVarietiesForCrop } from '../../utils/aiRecommendationEngine';
import { calculateNutrientPlan, parseSoilData } from '../../data/soilNutrientEngine';
import { generateCropSchedule } from '../../utils/farmScheduleEngine';

// Hardcoded CROP_VARIETIES and DEFAULT_VARIETY_DATA have been removed to use real-time AI recommendations.

const FALLBACK_VARIETY = {
  id: 'generic',
  name: 'Standard Regional Variety',
  description: 'Standard regional choice matching typical local weather patterns and soil specifications.',
  profitPerAcre: 40000,
  whyThisTemplate: 'This variety is a standard recommendation given local configurations.',
  sowingMonth: 'November',
  duration: '120 days',
  water: '400 mm',
  diseaseResistance: 'Medium',
  marketDemand: 'Standard',
  maturity: 'Medium',
  suitableSoil: 'Alluvial / Clay Loam',
  price: '₹2,100/Qtl',
  yield: '20 Qtl/Acre',
  badges: ['Best Fit'],
  yieldPotential: 20,
  livePrice: 2100,
  seedRate: 40
};


export default function SeasonPlanner({
  profile,
  farms,
  selectedFarmIndex,
  setSelectedFarmIndex,
  setFarms,
  seasonPlanConfirmed,
  setSeasonPlanConfirmed,
  language,
  setActiveDashboardTab,
  weatherData
}) {
  const activeFarm = farms[selectedFarmIndex];
  const hasActivePlan = !!activeFarm?.crop?.confirmedPlan;

  const [step, setStep] = useState(() => {
    return hasActivePlan ? 'active-overview' : 'input';
  }); // 'active-overview' | 'input' | 'recommendations' | 'plan' | 'history'

  useEffect(() => {
    if (hasActivePlan) {
      setStep('active-overview');
    } else if (step === 'active-overview') {
      setStep('input');
    }
  }, [selectedFarmIndex, hasActivePlan]);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'manual'
  const [selectedSavedFarmId, setSelectedSavedFarmId] = useState('');
  const [viewingActivePlan, setViewingActivePlan] = useState(false);
  const [viewingHistoryPlan, setViewingHistoryPlan] = useState(false);
  const [historyCropData, setHistoryCropData] = useState(null);
  const [fertilizerMode, setFertilizerMode] = useState('conventional');
  const [profitScenario, setProfitScenario] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);

  // Collapsible sections state for the Blueprint Page
  const [collapsed, setCollapsed] = useState({
    overview: false,
    sowing: false,
    seeds: false,
    landPrep: false,
    irrigation: false,
    nutrients: false,
    pests: false,
    waterAwd: false,
    profitCalc: false
  });

  const toggleCollapse = (sec) => {
    setCollapsed(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Form input fields (fully detailed to encompass onboarding fields)
  const [formFields, setFormFields] = useState({
    farmName: 'Manual Simulation',
    cropName: 'rice',
    location: 'Pratapgarh, Rajasthan',
    lat: '24.0321',
    lng: '74.7812',
    area: '5',
    unit: 'Acres',
    plantingMonth: 'July',
    lastCrop: 'Wheat',
    soilType: 'Clay Soil',
    irrigation: ['rainfed', 'canal'],
    waterSources: ['canal', 'rain'],
    ph: '6.8',
    carbon: '0.62',
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'High',
    farmingMethod: 'Conventional',
    budgetRange: '25000',
    targetMarket: 'Mandi',
    yieldObjective: '28',
    machinery: ['tractor', 'rotavator'],
    laborResource: '3 Helpers Available',
    preferredVariety: ''
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationError, setRecommendationError] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [isFarmerSelected, setIsFarmerSelected] = useState(false);
  const [varietyMismatchWarning, setVarietyMismatchWarning] = useState(null);
  
  // Custom calculator expenses
  const [costs, setCosts] = useState({
    seed: 7500,
    fertilizer: 12500,
    pesticide: 6000,
    irrigation: 5000,
    labor: 16000,
    machinery: 10000,
    transportation: 4000,
    misc: 3000,
    expectedPrice: 4200,
    expectedYield: 28
  });

  // Pre-fill dropdown select option when farms exist
  useEffect(() => {
    if (farms.length > 0 && !selectedSavedFarmId) {
      setSelectedSavedFarmId(selectedFarmIndex.toString());
    }
  }, [farms, selectedFarmIndex]);

  // Handle Saved Farm pre-fill fields
  useEffect(() => {
    if (activeTab === 'saved' && farms[selectedFarmIndex]) {
      const farmObj = farms[selectedFarmIndex];
      setFormFields(prev => ({
        ...prev,
        farmName: farmObj.name || 'Saved Plot',
        cropName: farmObj.crop?.name?.toLowerCase() || 'wheat',
        location: `${farmObj.village || 'Pimpalgaon'}, ${farmObj.district || 'Nashik'}, ${farmObj.state || 'Maharashtra'}`,
        lat: farmObj.lat || '20.0059',
        lng: farmObj.lng || '73.7823',
        area: farmObj.area || '2.5',
        unit: farmObj.unit || 'Acres',
        plantingMonth: farmObj.crop?.name?.toLowerCase() === 'rice' ? 'July' : 'November',
        lastCrop: farmObj.crop?.previousCrop || 'Rice',
        soilType: farmObj.soil?.type || 'Black Clay',
        irrigation: farmObj.water?.irrigationMethods || ['drip'],
        waterSources: farmObj.water?.sources || ['canal'],
        ph: farmObj.soil?.ph || '6.8',
        carbon: farmObj.soil?.carbon || '0.62',
        nitrogen: farmObj.soil?.nitrogen || 'Medium',
        phosphorus: farmObj.soil?.phosphorus || 'Medium',
        potassium: farmObj.soil?.potassium || 'High',
        farmingMethod: farmObj.crop?.farmingType || 'Conventional',
        machinery: farmObj.machinery || ['tractor'],
        laborResource: '2-3 family helpers + hired labor'
      }));
    }
  }, [activeTab, selectedFarmIndex, farms]);

  const handleSavedFarmChange = (e) => {
    const val = e.target.value;
    setSelectedSavedFarmId(val);
    setSelectedFarmIndex(parseInt(val));
  };

  // Explanation generator
  const getDynamicWhyThis = (template) => {
    if (!template || typeof template !== 'string') return '';
    const location = formFields.location || 'Pratapgarh, Rajasthan';
    const soil = formFields.soilType || 'Clay Soil';
    
    let irrStr = 'Canal Irrigation';
    if (formFields.irrigation && formFields.irrigation.length > 0) {
      irrStr = formFields.irrigation.map(i => {
        if (i === 'rainfed') return 'Rainfed';
        return i.charAt(0).toUpperCase() + i.slice(1) + ' Irrigation';
      }).join(' and ');
    }
    
    const lastCrop = formFields.lastCrop || 'Wheat';
    
    return template
      .replace(/{location}/g, location)
      .replace(/{soil}/g, soil)
      .replace(/{irrigation}/g, irrStr)
      .replace(/{lastCrop}/g, lastCrop);
  };

  const handleInputChange = (field, val) => {
    setFormFields(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // GPS Simulation
  const simulateGps = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGpsLoading(false);
      handleInputChange('location', 'Pratapgarh, Rajasthan');
      handleInputChange('lat', '24.0321');
      handleInputChange('lng', '74.7812');
    }, 1000);
  };

  const mapRecommendationsToUi = (ranked, areaVal) => {
    return ranked.map((v, idx) => {
      const livePrice = v.livePrice || v.msp || 2275;
      const profitPerAcre = Math.round(v.projectedProfit / areaVal) || 45000;
      
      const badges = [];
      if (idx === 0) badges.push('Best Fit');
      if (v.waterRequirement < 400) badges.push('Water Efficient');
      if (v.yieldPotential >= 25) badges.push('Highest Profit');
      if (v.keyTraits && v.keyTraits.length > 0) {
        badges.push(v.keyTraits[0]);
      }
      if (badges.length === 0) badges.push('Recommended');

      return {
        ...v,
        badges,
        yield: `${v.yieldPotential || 24} Qtl/Acre`,
        duration: `${v.maturityDays || 120} days`,
        water: `${v.waterRequirement || 350} mm`,
        diseaseResistance: v.diseaseResistance >= 4 ? 'High' : (v.diseaseResistance >= 3 ? 'Medium' : 'Low'),
        maturity: `${v.maturityDays || 120} days`,
        suitableSoil: (v.suitableSoils || []).join(', ') || 'Clay Loam',
        price: `₹${livePrice}/Qtl`,
        marketDemand: v.exportDemand || 'High',
        profitPerAcre
      };
    });
  };

  // Recommendations Generation using AI Recommendation Engine
  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    setVarietyMismatchWarning(null);
    setRecommendationError(null);
    setIsFarmerSelected(!!formFields.preferredVariety);

    const crop = formFields.cropName.toLowerCase();
    const activeFarm = farms[selectedFarmIndex] || {
      soil: { type: formFields.soilType || 'Loamy' },
      water: { sources: [formFields.irrigationSource?.toLowerCase() || 'borewell'] },
      area: formFields.area || '5',
      state: profile?.state || 'Maharashtra',
      district: profile?.district || 'Nashik'
    };
    const areaVal = parseFloat(formFields.area) || 5.0;

    let aiRecommendations = await getGeminiVarietiesForCrop(
      crop,
      activeFarm.state,
      activeFarm.district,
      activeFarm.soil.type,
      activeFarm.water.sources[0],
      formFields.lastCrop,
      formFields.preferredVariety
    );

    let finalRecommendations = [];
    if (aiRecommendations && Array.isArray(aiRecommendations) && aiRecommendations.length > 0) {
      // Map AI recommendations to UI format
      finalRecommendations = aiRecommendations.map(v => {
        const livePrice = parseFloat(v.price?.replace(/[^0-9]/g, '')) || 2275;
        const yieldPotential = parseFloat(v.yield) || 24;
        const profitPerAcre = v.profitPerAcre || Math.round(yieldPotential * livePrice * 0.4);
        
        return {
          ...v,
          yieldPotential,
          livePrice,
          seedRate: 40,
          profitPerAcre,
          badges: v.badges || ['Recommended']
        };
      });

      // Ensure we slice to top 3
      finalRecommendations = finalRecommendations.slice(0, 3);
      setRecommendations(finalRecommendations);
      const selected = finalRecommendations[0];
      setSelectedVariety(selected);
      
      // Set common costs
      const baseYield = selected.yieldPotential;
      const basePrice = selected.livePrice;

      setCosts({
        seed: Math.round(areaVal * (40 * 45)),
        fertilizer: Math.round(areaVal * 2500),
        pesticide: Math.round(areaVal * 1200),
        irrigation: Math.round(areaVal * 1000),
        labor: Math.round(areaVal * 3200),
        machinery: Math.round(areaVal * 2000),
        transportation: Math.round(areaVal * 800),
        misc: Math.round(areaVal * 600),
        expectedPrice: basePrice,
        expectedYield: baseYield
      });

      setIsGenerating(false);
      setStep('recommendations');
      setViewingActivePlan(false);
    } else {
      console.warn("[SeasonPlanner] Gemini API rate limited. Auto-falling back to ICAR database...");
      handleUseLocalFallback();
    }
  };

  const handleUseLocalFallback = () => {
    setRecommendationError(null);
    const crop = formFields.cropName.toLowerCase();
    const activeFarm = farms[selectedFarmIndex] || {
      soil: { type: formFields.soilType || 'Loamy' },
      water: { sources: [formFields.irrigationSource?.toLowerCase() || 'borewell'] },
      area: formFields.area || '5',
      state: profile?.state || 'Maharashtra',
      district: profile?.district || 'Nashik'
    };
    const areaVal = parseFloat(formFields.area) || 5.0;

    console.log(`[SeasonPlanner] Gemini failed or bypassed. Querying local ICAR variety database for ${crop}.`);
    const rankedRaw = generateRecommendations(crop, activeFarm, profile, weatherData, null);
    let finalRecommendations = [];

    if (rankedRaw && rankedRaw.length > 0) {
      finalRecommendations = mapRecommendationsToUi(rankedRaw, areaVal);
      
      // If farmer selected a specific variety, ensure it's at the top
      if (formFields.preferredVariety) {
        const prefLower = formFields.preferredVariety.toLowerCase();
        const matchedIdx = finalRecommendations.findIndex(v => v.name.toLowerCase().includes(prefLower));
        if (matchedIdx > 0) {
          const matched = finalRecommendations.splice(matchedIdx, 1)[0];
          finalRecommendations.unshift(matched);
        } else if (matchedIdx === -1) {
          // Variety not in database, we should still evaluate it using a mock entry based on top recommendation
          const mockEntry = {
             ...finalRecommendations[0],
             id: 'custom-' + Date.now(),
             name: formFields.preferredVariety,
             description: `Custom farmer-selected variety. Evaluated based on baseline parameters for ${crop}.`,
             badges: ['Farmer Selected']
          };
          finalRecommendations.unshift(mockEntry);
        }
      }
    } else {
       // Failsafe for custom typed-in crops that do not exist locally either
       console.warn(`[SeasonPlanner] Crop ${crop} not found in local database.`);
       const genericRec = {
         id: 'generic-' + Date.now(),
         name: formFields.preferredVariety || `Standard ${formFields.cropName} Variety`,
         description: `Standard regional choice for ${formFields.cropName} matching typical local weather patterns.`,
         profitPerAcre: 40000,
         whyThisTemplate: `This variety is a standard recommendation for ${formFields.cropName} given local configurations.`,
         sowingMonth: 'November',
         duration: '120 days',
         water: '400 mm',
         diseaseResistance: 'Medium',
         marketDemand: 'Standard',
         maturity: 'Medium',
         suitableSoil: activeFarm.soil.type,
         price: '₹2,100/Qtl',
         yield: '20 Qtl/Acre',
         badges: ['Best Fit'],
         yieldPotential: 20,
         livePrice: 2100,
         seedRate: 40
       };
       finalRecommendations = [genericRec];
    }

    // Ensure we slice to top 3
    finalRecommendations = finalRecommendations.slice(0, 3);
    setRecommendations(finalRecommendations);
    const selected = finalRecommendations[0];
    setSelectedVariety(selected);

    setCosts({
      seed: Math.round(areaVal * (40 * 45)),
      fertilizer: Math.round(areaVal * 2500),
      pesticide: Math.round(areaVal * 1200),
      irrigation: Math.round(areaVal * 1000),
      labor: Math.round(areaVal * 3200),
      machinery: Math.round(areaVal * 2000),
      transportation: Math.round(areaVal * 800),
      misc: Math.round(areaVal * 600),
      expectedPrice: selected.livePrice,
      expectedYield: selected.yieldPotential
    });

    setStep('recommendations');
  };


  // Select variety
  const handleSelectVariety = (v) => {
    setSelectedVariety(v);
    setCosts(prev => ({
      ...prev,
      expectedYield: v.yieldPotential || v.yield || 24,
      expectedPrice: v.livePrice || v.msp || 2275
    }));
    setStep('plan');
    setViewingActivePlan(false);
  };

  // Open the Active Plan Details page
  const handleViewActivePlan = () => {
    const activeCrop = farms[selectedFarmIndex]?.crop;
    if (activeCrop?.confirmedPlan) {
      const cropKey = activeCrop.name.toLowerCase();
      const activeFarm = farms[selectedFarmIndex];
      const rankedRaw = generateRecommendations(cropKey, activeFarm, profile, weatherData, null);
      const ranked = mapRecommendationsToUi(rankedRaw, parseFloat(activeFarm.area) || 2.5);
      const foundVariety = ranked.find(v => v.name.toLowerCase().includes(activeCrop.variety.toLowerCase())) || ranked[0] || FALLBACK_VARIETY;
      setSelectedVariety(foundVariety);
      setStep('plan');
      setViewingActivePlan(true);
      setViewingHistoryPlan(false);
      setHistoryCropData(null);
    }
  };

  const handleViewHistoryPlan = (pastCrop) => {
    if (pastCrop?.confirmedPlan) {
      const cropKey = pastCrop.name.toLowerCase();
      const activeFarm = farms[selectedFarmIndex];
      const rankedRaw = generateRecommendations(cropKey, activeFarm, profile, weatherData, null);
      const ranked = mapRecommendationsToUi(rankedRaw, parseFloat(activeFarm.area) || 2.5);
      const foundVariety = ranked.find(v => v.name.toLowerCase().includes(pastCrop.variety.toLowerCase())) || ranked[0] || FALLBACK_VARIETY;
      setSelectedVariety(foundVariety);
      setStep('plan');
      setViewingActivePlan(false);
      setViewingHistoryPlan(true);
      setHistoryCropData(pastCrop);
    }
  };

  // Cost calculations
  const totalCost = Object.keys(costs)
    .filter(k => k !== 'expectedPrice' && k !== 'expectedYield')
    .reduce((acc, cur) => acc + costs[cur], 0);

  const calculatedArea = parseFloat(formFields.area) || 5.0;
  const currentYield = costs.expectedYield;
  const currentPrice = costs.expectedPrice;

  // Projections values
  const getScenarioValues = () => {
    let priceMult = 1.0;
    let yieldMult = 1.0;
    if (profitScenario === 'optimistic') {
      priceMult = 1.15;
      yieldMult = 1.1;
    } else if (profitScenario === 'worst') {
      priceMult = 0.85;
      yieldMult = 0.75;
    }

    const simYield = Math.round(currentYield * yieldMult * 10) / 10;
    const simPrice = Math.round(currentPrice * priceMult);
    const revenue = Math.round(simYield * calculatedArea * simPrice);
    const profit = revenue - totalCost;
    const breakEven = (totalCost / calculatedArea) / simPrice;
    const roi = ((profit / totalCost) * 100).toFixed(1);
    const profitMargin = ((profit / revenue) * 100).toFixed(1);

    return {
      simYield,
      simPrice,
      revenue,
      profit,
      breakEven: breakEven.toFixed(2),
      roi,
      profitMargin
    };
  };

  const simData = getScenarioValues();

  // Dynamic Soil-Test Based Fertilizer recommendation
  const getNutrients = () => {
    const activeFarm = farms[selectedFarmIndex];
    const cropRequirement = selectedVariety?.nutrientRequirement || { N: 120, P: 60, K: 40 };
    const organicAlts = selectedVariety?.organicAlternatives || {};
    
    // Parse soil values
    const soilData = activeFarm?.soil ? parseSoilData(activeFarm.soil) : null;
    
    // Calculate custom nutrient package based on Soil Health Card
    const nutrientPlanResult = calculateNutrientPlan(
      soilData,
      cropRequirement,
      calculatedArea,
      fertilizerMode,
      organicAlts
    );
    
    return nutrientPlanResult.items || [];
  };

  const nutrientPlan = getNutrients();
  const fertilizerSubtotalCost = nutrientPlan.reduce((acc, cur) => acc + cur.cost, 0);

  // Auto-sync cost parameters
  useEffect(() => {
    setCosts(prev => ({
      ...prev,
      fertilizer: fertilizerSubtotalCost
    }));
  }, [fertilizerMode, calculatedArea, fertilizerSubtotalCost]);

  // Activate Plan
  const handleConfirmPlan = () => {
    const cropKey = formFields.cropName.toLowerCase();
    const varietyName = selectedVariety?.name || 'Karan Vandana';
    
    // Map plantingMonth selection to a valid date
    const currentYear = new Date().getFullYear();
    const monthMap = {
      january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
      july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
      jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const mKey = (formFields.plantingMonth || 'July').toLowerCase().trim();
    const mCode = monthMap[mKey] || '07';
    const calculatedSowingDate = `${currentYear}-${mCode}-05`;
    
    const durationDays = selectedVariety ? parseInt(selectedVariety.duration) : 120;
    
    const addDaysLocal = (dateStr, days) => {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };
    const calculatedHarvestDate = addDaysLocal(calculatedSowingDate, durationDays);

    // Create live tasks list using the farmScheduleEngine
    const generatedTasks = generateCropSchedule({
      cropName: formFields.cropName,
      varietyName: varietyName,
      sowingDate: calculatedSowingDate,
      area: formFields.area,
      irrigationMethods: formFields.irrigation,
      farmingMethod: formFields.farmingMethod,
      durationDays: durationDays,
      existingTasks: []
    });

    const confirmedPlan = {
      cropName: formFields.cropName.charAt(0).toUpperCase() + formFields.cropName.slice(1),
      cropIcon: formFields.cropName.toLowerCase() === 'wheat' ? '🌾' : (formFields.cropName.toLowerCase() === 'rice' ? '🌱' : '🌽'),
      healthScore: 92,
      growthProgress: 0,
      harvestDays: durationDays,
      expectedYield: `${costs.expectedYield} Quintals/Acre`,
      estimatedProfit: simData.profit,
      weatherStatus: 'Optimized',
      diseaseRisk: 'Low',
      waterStatus: 'Pre-sowing Setup',
      timelineStageIndex: 1,
      healthMetrics: {
        overall: 92,
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
          id: 'cf-feed-1',
          type: 'weather',
          title: 'Sowing Window Forecast',
          problem: 'Weather conditions are optimal for sowing over the next 10 days.',
          reason: 'Expected mild day temperatures and moisture levels are perfect.',
          action: 'Initiate field tilling and finalize seed procurement immediately.',
          benefit: 'Avoids late-germination heat damage.',
          actionText: 'Track Sowing Window'
        }
      ],
      market: {
        recommendation: 'Plan Selling',
        expectedProfitIncrease: '₹18,000',
        recommendedMandi: formFields.targetMarket === 'Mandi' ? 'APMC Mandi Yard' : 'Local Wholesale Market',
        adjustedEarnings: `₹${costs.expectedPrice}/Quintal`,
        confidence: 92,
        trend: 'up',
        reasoning: `Selected variety ${varietyName} commands premium demand. Sells window aligns with regional supply dips.`
      },
      schemes: [
        {
          id: 'sch-1',
          name: 'PM Fasal Bima Yojana (PMFBY)',
          status: 'Eligible',
          benefits: 'Crop Insurance coverage',
          deadline: '2026-08-15',
          progress: 100,
          documents: 'Land extract details, sowing declaration',
          desc: 'Subsidized crop insurance coverage against extreme monsoon hazards.'
        }
      ],
      community: []
    };

    const updatedFarms = [...farms];
    const locParts = formFields.location.split(',');
    const vName = locParts[0]?.trim() || 'Pratapgarh';
    const dName = locParts[1]?.trim() || 'Pratapgarh';
    const sName = locParts[2]?.trim() || 'Rajasthan';

    if (updatedFarms[selectedFarmIndex]) {
      updatedFarms[selectedFarmIndex] = { ...updatedFarms[selectedFarmIndex] };
      const oldCrop = updatedFarms[selectedFarmIndex].crop;
      
      if (oldCrop && oldCrop.name) {
        let newCropHistory = updatedFarms[selectedFarmIndex].cropHistory 
          ? [...updatedFarms[selectedFarmIndex].cropHistory] 
          : [];
          
        const isDuplicate = newCropHistory.some(
          h => h.name === oldCrop.name && h.sowingDate === oldCrop.sowingDate
        );
        
        if (!isDuplicate) {
          newCropHistory = [...newCropHistory, {
            ...oldCrop,
            archivedAt: new Date().toISOString()
          }];
        }
        updatedFarms[selectedFarmIndex].cropHistory = newCropHistory;
      }

      updatedFarms[selectedFarmIndex].crop = {
        name: formFields.cropName.charAt(0).toUpperCase() + formFields.cropName.slice(1),
        variety: varietyName,
        stage: 'Sowing / Preparation',
        sowingDate: calculatedSowingDate,
        harvestDate: calculatedHarvestDate,
        previousCrop: formFields.lastCrop,
        farmingType: formFields.farmingMethod,
        confirmedPlan: confirmedPlan
      };
      
      updatedFarms[selectedFarmIndex].soil = {
        type: formFields.soilType,
        source: 'manual',
        ph: formFields.ph,
        carbon: formFields.carbon,
        nitrogen: formFields.nitrogen,
        phosphorus: formFields.phosphorus,
        potassium: formFields.potassium,
        micronutrients: 'Zinc, Iron'
      };
      updatedFarms[selectedFarmIndex].area = formFields.area;
      updatedFarms[selectedFarmIndex].unit = formFields.unit;
      updatedFarms[selectedFarmIndex].village = vName;
      updatedFarms[selectedFarmIndex].district = dName;
      updatedFarms[selectedFarmIndex].state = sName;
      
      setFarms(updatedFarms);
    } else {
      const newFarmObj = {
        name: `Simulation Farm (${formFields.cropName})`,
        state: sName,
        district: dName,
        village: vName,
        pinCode: '312601',
        lat: formFields.lat,
        lng: formFields.lng,
        boundary: [],
        plots: 1,
        area: formFields.area,
        unit: formFields.unit,
        cropHistory: [],
        crop: {
          name: formFields.cropName.charAt(0).toUpperCase() + formFields.cropName.slice(1),
          variety: varietyName,
          stage: 'Sowing / Preparation',
          sowingDate: calculatedSowingDate,
          harvestDate: calculatedHarvestDate,
          previousCrop: formFields.lastCrop,
          farmingType: formFields.farmingMethod,
          confirmedPlan: confirmedPlan
        },
        soil: {
          type: formFields.soilType,
          source: 'manual',
          ph: formFields.ph,
          carbon: formFields.carbon,
          nitrogen: formFields.nitrogen,
          phosphorus: formFields.phosphorus,
          potassium: formFields.potassium,
          micronutrients: 'Zinc, Iron'
        },
        water: {
          sources: formFields.waterSources,
          irrigationMethods: formFields.irrigation,
          availability: 'Moderate',
          reliability: 'Available',
          electricity: 'Daytime Only',
          pumpType: 'Solar',
          pumpCapacity: '3 HP'
        },
        machinery: ['tractor']
      };
      setFarms([...farms, newFarmObj]);
    }

    setSeasonPlanConfirmed(true);
    setViewingActivePlan(false);
    setViewingHistoryPlan(false);
    localStorage.setItem('km_season_confirmed', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('active-overview');
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in-up font-sans text-on-surface">
      
      {/* 0. Top Navigation / Step Tracker */}
      <div className="bg-white px-6 py-3 rounded-2xl border border-outline-variant/60 shadow-xs flex justify-between items-center text-xs font-bold font-display">
        <div className="flex items-center gap-1.5 text-primary">
          <Layers className="w-4 h-4" />
          <span>Crop Planner</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-1.5 ${step === 'input' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">1</span>
            <span>Parameters Form</span>
          </div>
          <div className={`flex items-center gap-1.5 ${step === 'recommendations' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</span>
            <span>Variety Selection</span>
          </div>
          <div className={`flex items-center gap-1.5 ${step === 'plan' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
            <span>Cultivation Action Blueprint</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-primary to-[#004e20] rounded-card p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> KisanMitra Pre-Season Recommendation Engine
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">
            One-Time Crop Cultivation Planning
          </h2>
          <p className="text-white/80 text-xs md:text-sm leading-relaxed">
            Create an intelligent pre-season cultivation strategy tailored to your soil structure, water budget, local climate, and financial objectives. Confirm the plan to activate dynamic tracking on your active dashboard.
          </p>
        </div>
        
        {/* Clickable Green Banner box */}
        {hasActivePlan && (
          <div 
            onClick={handleViewActivePlan}
            className="cursor-pointer hover:bg-white/20 transition-all bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center flex-shrink-0 md:w-56 animate-fade-in"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">PLAN ACTIVE</span>
            <span className="text-[10px] text-white/80 mt-1 leading-snug">Currently driving your dashboard & calendar</span>
          </div>
        )}
      </div>

      {/* ================= PAGE 0: ACTIVE PLAN OVERVIEW ================= */}
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
                  <h2 className="font-display font-extrabold text-2xl text-on-surface">Active Seasonal Plan</h2>
                  <p className="text-sm text-on-surface-variant font-medium">Currently tracking and generating daily tasks.</p>
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
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Crop & Variety</div>
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
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Est. Harvest</div>
                  <div className="font-bold text-sm text-on-surface">{new Date(activeFarm.crop.harvestDate).toLocaleDateString()}</div>
                  <div className="text-xs text-on-surface-variant">{activeFarm.crop.confirmedPlan.harvestDays} Days Total</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleViewActivePlan}
                  className="bg-primary hover:bg-[#004e20] text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Active Blueprint
                </button>
                <button
                  onClick={() => setActiveDashboardTab('dashboard')}
                  className="bg-white border-2 border-primary/20 text-primary hover:bg-primary/5 font-extrabold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2"
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
                      setStep('input');
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

      {/* ================= HISTORY LIST ================= */}
      {step === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep(hasActivePlan ? 'active-overview' : 'input')} className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high">
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <h2 className="font-display font-extrabold text-2xl text-on-surface">Plan History</h2>
          </div>
          
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
             {(!activeFarm?.cropHistory || activeFarm.cropHistory.length === 0) ? (
                <div className="p-12 text-center text-on-surface-variant">
                   <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-bold">No historical plans found.</p>
                   <p className="text-xs mt-1">Previous plans will appear here when you create new ones.</p>
                </div>
             ) : (
                <div className="divide-y divide-outline-variant/30">
                  {activeFarm.cropHistory.slice().reverse().map((pastCrop, i) => (
                    <div key={i} className="p-6 hover:bg-surface-container-lowest transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{pastCrop.confirmedPlan?.cropIcon || '🌾'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-on-surface">{pastCrop.name} <span className="text-on-surface-variant text-sm font-medium">({pastCrop.variety})</span></h3>
                            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase">Archived</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Sown: {new Date(pastCrop.sowingDate).toLocaleDateString()} · 
                            Archived: {new Date(pastCrop.archivedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewHistoryPlan(pastCrop)}
                        className="bg-white border border-outline-variant hover:border-primary/40 text-primary font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 flex-shrink-0"
                      >
                        <FileText className="w-4 h-4" />
                        View Archive
                      </button>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      )}

      {/* ================= PAGE 1: INPUT FORM (LANDING PAGE - ALWAYS VISIBLE TO PLAN AGAIN) ================= */}
      {step === 'input' && (
        <div className="space-y-6 animate-fade-in-up">
          
          {hasActivePlan && (
            <div className="bg-warning-container/30 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface">You already have an active plan.</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Creating a new plan here will archive the existing one.</p>
              </div>
              <button onClick={() => setStep('active-overview')} className="ml-auto text-xs font-bold text-primary hover:underline">Cancel</button>
            </div>
          )}
          
          {/* 1. New: Year-Long Planning Promo Card */}
          <div className="bg-[#e6f4ea] border border-[#cbf0d7] rounded-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-primary">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-sm text-[#0f5132] flex items-center gap-1.5">
                  New: Year-Long Planning
                </h4>
                <p className="text-xs text-[#0f5132]/95 leading-relaxed font-semibold">
                  Strategically plan your crop cycle across the entire year with intelligent, multi-season recommendations.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveDashboardTab('planner')}
              className="bg-primary hover:bg-[#004e20] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0"
            >
              <span>Start Year-Long Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Single Crop Title & History Button */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-outline-variant/30 pb-4">
            <h3 className="font-display font-extrabold text-xl text-on-surface">Single Crop Recommendation</h3>
            <button
              onClick={() => setStep('history')}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Plan History
            </button>
          </div>
          
          <p className="text-xs text-on-surface-variant font-medium">
            Choose a saved farm or enter details manually for a single crop plan.
          </p>

          {/* Tab Selector rounded bar */}
          <div className="bg-[#f0f4f9] p-1 rounded-full flex border border-slate-200 max-w-lg mx-auto shadow-2xs">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2.5 px-6 rounded-full text-xs font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-white text-on-surface shadow-sm border border-slate-200/50'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Use a Saved Farm
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-6 rounded-full text-xs font-bold transition-all ${
                activeTab === 'manual'
                  ? 'bg-white text-on-surface shadow-sm border border-slate-200/50'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Enter Details Manually
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm p-6 space-y-6">
            
            {activeTab === 'saved' && (
              <div className="max-w-md mx-auto space-y-2 border-b border-outline-variant/40 pb-4 mb-4">
                <label className="block text-xs font-bold text-on-surface-variant text-center">Select Registered Farm Plot</label>
                {farms.length === 0 ? (
                  <div className="p-3 bg-error-container/20 border border-error/20 text-error rounded-xl text-xs text-center">
                    No saved plots found. Switch to "Enter Details Manually" to simulate.
                  </div>
                ) : (
                  <select
                    value={selectedSavedFarmId}
                    onChange={handleSavedFarmChange}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface"
                  >
                    {farms.map((f, i) => (
                      <option key={i} value={i}>{f.name} ({f.area} {f.unit}) · {f.village}, {f.district}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Inputs grid styled with soft-blue input boxes and microphone icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
              
              {/* Crop Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Crop Name</label>
                <div className="relative">
                  <select
                    value={formFields.cropName}
                    onChange={(e) => handleInputChange('cropName', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary appearance-none cursor-pointer text-on-surface"
                  >
                    <optgroup label="── Cereals ──">
                      <option value="wheat">Wheat (गेहूं)</option>
                      <option value="rice">Rice (धान)</option>
                      <option value="maize">Maize (मक्का)</option>
                      <option value="bajra">Bajra (Pearl Millet)</option>
                      <option value="jowar">Jowar (Sorghum)</option>
                      <option value="ragi">Ragi (Finger Millet)</option>
                      <option value="barley">Barley (Jau)</option>
                      <option value="oat">Oat (Jai)</option>
                    </optgroup>
                    <optgroup label="── Pulses ──">
                      <option value="gram">Gram / Chickpea (Chana)</option>
                      <option value="lentil">Lentil (Masoor)</option>
                      <option value="moong">Green Gram (Moong)</option>
                      <option value="urad">Black Gram (Urad)</option>
                    </optgroup>
                    <optgroup label="── Oilseeds ──">
                      <option value="soybean">Soybean</option>
                      <option value="groundnut">Groundnut (Mungfali)</option>
                      <option value="mustard">Mustard (Sarson)</option>
                    </optgroup>
                    <optgroup label="── Cash Crops ──">
                      <option value="cotton">Cotton (Kapas)</option>
                      <option value="sugarcane">Sugarcane (Ganna)</option>
                    </optgroup>
                    <optgroup label="── Vegetables ──">
                      <option value="potato">Potato (Aloo)</option>
                      <option value="onion">Onion (Pyaaz)</option>
                      <option value="garlic">Garlic (Lahsun)</option>
                    </optgroup>
                    <optgroup label="── Fodder & Cover Crops ──">
                      <option value="bajra fodder">Bajra Fodder</option>
                      <option value="jowar fodder">Jowar Fodder</option>
                      <option value="maize fodder">Maize Fodder</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-[10px] text-on-surface-variant font-medium">Select the crop you wish to plan.</span>
              </div>

              {/* Preferred Variety */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Preferred Variety (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formFields.preferredVariety}
                    onChange={(e) => handleInputChange('preferredVariety', e.target.value)}
                    disabled={activeTab === 'saved'}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                    placeholder="e.g. Lok-1"
                  />
                  <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-[10px] text-on-surface-variant font-medium">Type a specific variety to evaluate, or leave blank for AI guidance.</span>
              </div>

              {/* Land Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Land Area (in acres)*</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formFields.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    disabled={activeTab === 'saved'}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                    placeholder="e.g. 5"
                  />
                  <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Location*</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formFields.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={activeTab === 'saved'}
                      className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                      placeholder="District, State"
                    />
                    <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                      <Mic className="w-4 h-4" />
                    </div>
                  </div>
                  {activeTab === 'manual' && (
                    <button
                      onClick={simulateGps}
                      disabled={gpsLoading}
                      type="button"
                      className="bg-[#f0f4f9] hover:bg-slate-200 border rounded-xl p-3 flex items-center justify-center text-on-surface-variant/90 transition-colors disabled:opacity-50"
                      title="Use Current GPS Coordinates"
                    >
                      <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Planting Month */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Planting Month (Optional)</label>
                <div className="relative">
                  <select
                    value={formFields.plantingMonth}
                    onChange={(e) => handleInputChange('plantingMonth', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary appearance-none text-on-surface"
                  >
                    <option value="July">July</option>
                    <option value="June">June</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Last Crop Grown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Last Crop Grown (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formFields.lastCrop}
                    onChange={(e) => handleInputChange('lastCrop', e.target.value)}
                    disabled={activeTab === 'saved'}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                    placeholder="e.g. Wheat"
                  />
                  <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant/80">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-[10px] text-on-surface-variant font-medium">This helps in recommending better nutrients to replenish the soil.</span>
              </div>

              {/* Soil Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Soil Type*</label>
                <select
                  value={formFields.soilType}
                  onChange={(e) => handleInputChange('soilType', e.target.value)}
                  disabled={activeTab === 'saved'}
                  className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                >
                  <option value="Clay Soil">Clay Soil</option>
                  <option value="Black Clay">Black Clay Soil</option>
                  <option value="Red Sandy">Red Sandy Soil</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Alluvial">Alluvial Soil</option>
                </select>
              </div>

              {/* Irrigation System */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant">Irrigation System*</label>
                <select
                  value={formFields.irrigation[0]}
                  onChange={(e) => handleInputChange('irrigation', [e.target.value])}
                  disabled={activeTab === 'saved'}
                  className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary text-on-surface disabled:opacity-70"
                >
                  <option value="Rainfed, Canal Irrigation">Rainfed, Canal Irrigation</option>
                  <option value="Canal Irrigation">Canal Irrigation</option>
                  <option value="Borewell Irrigation">Borewell Irrigation</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                  <option value="Rain-fed Only">Rain-fed Only</option>
                </select>
              </div>
            </div>

            {/* Advanced configurations collapsible section */}
            <details className="group border-t border-outline-variant/40 pt-4 text-xs font-semibold text-on-surface-variant">
              <summary className="list-none flex justify-between items-center cursor-pointer select-none text-primary font-extrabold focus:outline-none">
                <span>Advanced Planning Parameters (NPK, Resources, Budget)</span>
                <span className="material-symbols-outlined notranslate transition-transform duration-200 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1.5">Farming Method</label>
                  <select
                    value={formFields.farmingMethod}
                    onChange={(e) => handleInputChange('farmingMethod', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs focus:outline-none"
                  >
                    <option value="Conventional">Conventional (Chemical)</option>
                    <option value="Organic">Organic</option>
                    <option value="Integrated">Integrated (INM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1.5">Max Input Budget (₹/Acre)</label>
                  <input
                    type="number"
                    value={formFields.budgetRange}
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1.5">Yield Objective (Qtl/Acre)</label>
                  <input
                    type="number"
                    value={formFields.yieldObjective}
                    onChange={(e) => handleInputChange('yieldObjective', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] text-on-surface-variant">Registered Machinery</label>
                  <input
                    type="text"
                    value={formFields.machinery.join(', ')}
                    disabled
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs text-on-surface-variant opacity-75"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] text-on-surface-variant">Available Labor & Resources</label>
                  <input
                    type="text"
                    value={formFields.laborResource}
                    onChange={(e) => handleInputChange('laborResource', e.target.value)}
                    className="w-full bg-[#f0f4f9] border border-transparent rounded-xl p-3 text-xs text-on-surface"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-5 gap-3 text-center">
                  <div>
                    <label className="block text-[10px] text-on-surface-variant mb-1">pH</label>
                    <input
                      type="text"
                      value={formFields.ph}
                      onChange={(e) => handleInputChange('ph', e.target.value)}
                      className="w-full bg-[#f0f4f9] border rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant mb-1">Carbon (%)</label>
                    <input
                      type="text"
                      value={formFields.carbon}
                      onChange={(e) => handleInputChange('carbon', e.target.value)}
                      className="w-full bg-[#f0f4f9] border rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant mb-1">N</label>
                    <select
                      value={formFields.nitrogen}
                      onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                      className="w-full bg-[#f0f4f9] border rounded-xl p-2 text-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant mb-1">P</label>
                    <select
                      value={formFields.phosphorus}
                      onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                      className="w-full bg-[#f0f4f9] border rounded-xl p-2 text-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-on-surface-variant mb-1">K</label>
                    <select
                      value={formFields.potassium}
                      onChange={(e) => handleInputChange('potassium', e.target.value)}
                      className="w-full bg-[#f0f4f9] border rounded-xl p-2 text-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>

            {/* Sparkles Button */}
            <div className="flex justify-start pt-4 border-t border-outline-variant/40 gap-4">
              <button
                onClick={handleGenerateRecommendations}
                disabled={(activeTab === 'saved' && farms.length === 0) || isGenerating}
                className="bg-primary hover:bg-[#004e20] text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
                <span>{isGenerating ? 'Analyzing Farm Data...' : 'Get Variety Recommendations'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE 2: CROP VARIETY RECOMMENDATIONS ================= */}
      {step === 'recommendations' && (recommendations || recommendationError) && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('input')}
              className="p-2 border rounded-xl hover:bg-surface-container transition-colors text-xs font-bold text-on-surface-variant flex items-center gap-1.5 bg-white shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-primary" /> Back to Parameters
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-outline-variant/60 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-xl text-on-surface flex items-center gap-2">
                Crop Recommendations
              </h3>
            </div>
            {recommendations && (
              <span className="bg-primary-container/10 border border-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {recommendations.length} Varieties Evaluated
              </span>
            )}
          </div>

          {recommendationError ? (
            <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center py-16 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h4 className="text-lg font-bold text-on-surface">{recommendationError.message}</h4>
              <p className="text-sm text-on-surface-variant max-w-md text-center font-medium">
                {recommendationError.description}
              </p>
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={handleGenerateRecommendations}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary-hover shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Retry AI Analysis
                </button>
                <button 
                  onClick={handleUseLocalFallback}
                  className="px-6 py-2.5 rounded-xl bg-[#0c8a47] text-white hover:bg-[#096a36] font-bold text-sm flex items-center gap-2 shadow-xs transition-all"
                >
                  <Layers className="w-4 h-4 text-white" /> Use Local ICAR Fallback
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((v) => {
                const isBestFit = v.badges.includes('Best Fit');
                const estimatedProfitValue = Math.round(v.profitPerAcre * calculatedArea);
                return (
                  <div 
                    key={v.id}
                    onClick={() => handleSelectVariety(v)}
                    className={`cursor-pointer rounded-card border p-6 flex flex-col justify-between h-auto min-h-[450px] bg-white transition-all relative ${
                      isBestFit 
                        ? 'border-2 border-[#0c8a47] ring-1 ring-[#0c8a47]/20 shadow-md translate-y-[-2px]' 
                        : 'border-outline-variant/60 hover:border-[#0c8a47]/40 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start w-full">
                        <h4 className="font-display font-extrabold text-lg text-on-surface">{v.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {v.badges.map(b => (
                            <span key={b} className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              b === 'Best Fit' ? 'bg-[#0c8a47] text-white' : 'bg-surface-container text-on-surface-variant border'
                            }`}>
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {v.description}
                      </p>

                      {/* Estimated Net Profit Row */}
                      <div className="space-y-1 bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/30">
                        <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-on-surface-variant" /> Estimated Net Profit
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-[#0c8a47]">₹{estimatedProfitValue.toLocaleString()}</span>
                          <span className="text-[11px] text-on-surface-variant font-bold">for {calculatedArea} {formFields.unit}</span>
                        </div>
                      </div>

                      {/* Key Technical Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] border-y border-outline-variant/40 py-2.5 font-bold text-on-surface-variant">
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Est. Yield</span> <span className="text-on-surface font-extrabold">{v.yield}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Duration</span> <span className="text-on-surface font-extrabold">{v.duration}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Water Req.</span> <span className="text-on-surface font-extrabold">{v.water}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Disease Resist.</span> <span className="text-on-surface font-extrabold truncate block">{v.diseaseResistance}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Maturity</span> <span className="text-on-surface font-extrabold">{v.maturity}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Soil Type</span> <span className="text-on-surface font-extrabold">{v.suitableSoil}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Sells Price</span> <span className="text-[#0c8a47] font-black">{v.price}</span></div>
                        <div><span className="text-[8px] text-on-surface-variant/80 uppercase block">Market Demand</span> <span className="text-on-surface font-extrabold">{v.marketDemand}</span></div>
                      </div>

                      {/* Dynamic Agronomist "Why this?" text */}
                      <div className="text-[11px] leading-relaxed text-on-surface-variant h-[90px] overflow-y-auto pr-1">
                        <strong className="text-on-surface text-xs font-bold block mb-0.5">Why this?</strong>
                        {v.whyThisTemplate ? getDynamicWhyThis(v.whyThisTemplate) : (
                          <ul className="list-disc pl-4 space-y-1 text-on-surface-variant font-medium">
                            {(v.explanations || []).map((exp, eIdx) => (
                              <li key={eIdx}>{exp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => handleSelectVariety(v)}
                        type="button"
                        className="w-full bg-[#0c8a47] hover:bg-[#096a36] text-white text-xs font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>View Complete Action Plan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= PAGE 3: ACTION PLAN BLUEPRINT ================= */}
      {step === 'plan' && selectedVariety && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Action Header controls */}
          <div className="flex justify-between items-center bg-white border border-outline-variant/60 p-4 rounded-xl shadow-xs">
            <button
              onClick={() => {
                if (viewingActivePlan) {
                  setStep('input');
                  setViewingActivePlan(false);
                } else {
                  setStep('recommendations');
                }
              }}
              className="p-2 border rounded-xl hover:bg-surface-container transition-colors text-xs font-bold text-on-surface-variant flex items-center gap-1.5 bg-white shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-primary" /> 
              {viewingActivePlan ? 'Back to Planning Form' : 'Back to Variety Recommendations'}
            </button>

            {viewingActivePlan && (
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-black py-1.5 px-3 rounded-full uppercase flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Active Operational Blueprint
              </span>
            )}
            
            {!viewingActivePlan && hasActivePlan && (
              <span className="text-xs bg-yellow-100 text-yellow-800 font-extrabold py-1.5 px-3 rounded-full border border-yellow-200">
                New Plan Draft (Not Yet Implemented)
              </span>
            )}
          </div>

          {/* Badges and Warnings */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {isFarmerSelected ? (
                <span className="text-xs bg-blue-100 text-blue-800 font-extrabold py-1.5 px-3 rounded-full border border-blue-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Farmer Selected
                </span>
              ) : (
                <span className="text-xs bg-primary/10 text-primary font-extrabold py-1.5 px-3 rounded-full border border-primary/20 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Recommended
                </span>
              )}
            </div>
            
            {varietyMismatchWarning && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-orange-900 text-sm">Condition Mismatch</h4>
                    <p className="text-xs text-orange-800 mt-1">{varietyMismatchWarning}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormFields(prev => ({...prev, preferredVariety: ''}));
                    setStep('recommendations');
                    handleGenerateRecommendations();
                  }}
                  className="bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-colors"
                >
                  Show Better Alternatives
                </button>
              </div>
            )}
          </div>

          {/* 1. Crop Overview Card */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('overview')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Crop Overview</h3>
              </div>
              {collapsed.overview ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.overview && (
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-semibold animate-fade-in">
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Crop Name & Variety</span>
                  <span className="font-extrabold text-on-surface text-sm capitalize">{formFields.cropName} ({selectedVariety.name})</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Farm Name & Location</span>
                  <span className="font-extrabold text-on-surface text-sm">{formFields.farmName} ({formFields.location})</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Land Area & Units</span>
                  <span className="font-extrabold text-on-surface text-sm">{calculatedArea} {formFields.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Farming Method</span>
                  <span className="font-extrabold text-on-surface text-sm">{formFields.farmingMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Est. Cultivation Duration</span>
                  <span className="font-extrabold text-on-surface text-sm">{selectedVariety.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Est. Water Requirement</span>
                  <span className="font-extrabold text-on-surface text-sm">{selectedVariety.water}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Expected Yield Goal</span>
                  <span className="font-extrabold text-on-surface text-sm">{costs.expectedYield} Qtl/Acre</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Projected Net profit</span>
                  <span className="font-extrabold text-primary text-sm">₹{simData.profit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Suitable Soil Type</span>
                  <span className="font-extrabold text-on-surface text-sm">{selectedVariety.suitableSoil}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Recommended Season</span>
                  <span className="font-extrabold text-on-surface text-sm">{formFields.cropName === 'rice' ? 'Kharif (Monsoon)' : 'Rabi (Winter)'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">Weather Suitability</span>
                  <span className="font-extrabold text-green-700 text-sm flex items-center gap-1">Highly Optimized</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block mb-1">AI Confidence Score</span>
                  <span className="font-extrabold text-on-surface text-sm flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500 fill" /> 94%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Best Sowing Window Analysis */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('sowing')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Best Sowing Window Analysis</h3>
              </div>
              {collapsed.sowing ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.sowing && (
              <div className="p-6 space-y-4 animate-fade-in">
                <p className="text-xs text-on-surface-variant font-semibold">
                  Evaluations integrate local IMD weather models, rainfall distribution forecasts, temperature suitability trends, PMFBY insurance deadlines, and disease probabilities.
                </p>

                <div className="space-y-4">
                  {[
                    { start: 'Nov 01, 2026', end: 'Nov 12, 2026', risk: 'Low', riskColor: 'bg-green-100 text-green-800', rainConf: '92%', tempSuit: 'Optimal', insurance: 'Eligible', yieldImpact: '+12% (Highest)', marketTiming: 'Peak Selling Price', best: true, explanation: 'Optimal day temp (24°C) for sprouting. Aligns crop flowering to beat winter frosts. Complete PMFBY deadline compliance ensures full risk cover.' },
                    { start: 'Nov 13, 2026', end: 'Nov 25, 2026', risk: 'Medium', riskColor: 'bg-yellow-100 text-yellow-800', rainConf: '80%', tempSuit: 'Slightly Cold', insurance: 'Eligible', yieldImpact: 'Standard', marketTiming: 'Moderate Price Index', best: false, explanation: 'Standard window. Nights dropping to 11°C may delay germination by 3-4 days. Yield curves follow historical county baselines.' },
                    { start: 'Nov 26, 2026', end: 'Dec 10, 2026', risk: 'High', riskColor: 'bg-red-100 text-red-800', rainConf: '55%', tempSuit: 'Sub-Optimal', insurance: 'Ineligible (PMFBY deadline)', yieldImpact: '-18%', marketTiming: 'Low Price (Mandi Glut)', best: false, explanation: 'Late sowing risks. Matures during peak spring heat, causing grain shriveling. Ineligible for government subsidized insurance coverage.' }
                  ].map((w, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 relative text-xs ${
                      w.best ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-outline-variant/60 bg-white'
                    }`}>
                      {w.best && (
                        <span className="absolute -top-2.5 left-4 bg-primary text-white font-extrabold text-[8px] px-2.5 py-0.5 rounded-full uppercase">
                          Recommended Best Window
                        </span>
                      )}
                      <div className="flex-1 space-y-1.5 font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-on-surface">{w.start} — {w.end}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${w.riskColor}`}>{w.risk} Risk</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {w.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-[10px] font-bold text-on-surface md:border-l border-outline-variant/60 md:pl-4 md:w-96 flex-shrink-0">
                        <div>
                          <span className="block text-on-surface-variant text-[8px] font-bold">Rain Conf.</span>
                          <span>{w.rainConf}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Temp Suit.</span>
                          <span>{w.tempSuit}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">PMFBY Cover</span>
                          <span>{w.insurance}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Yield Impact</span>
                          <span>{w.yieldImpact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Seed Requirement & Procurement */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('seeds')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Seed Requirement & Procurement</h3>
              </div>
              {collapsed.seeds ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.seeds && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-on-surface text-sm">Calculated Seed Quantity</h4>
                  <div className="p-4 bg-surface-container rounded-xl space-y-2 text-on-surface text-center">
                    <div className="text-3xl font-black text-primary">{Math.round(calculatedArea * 40)} kg</div>
                    <div className="text-[10px] text-on-surface-variant font-bold">Total Quantity for {calculatedArea} Acres</div>
                    <div className="text-[9px] text-on-surface-variant font-semibold">Seed Rate: 40 kg/Acre | Germination: 92%</div>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                    <span className="font-bold text-primary block text-[10px]">Nursery Requirement:</span>
                    <p className="text-[10px] leading-relaxed">
                      {formFields.cropName === 'rice' 
                        ? `Required Nursery Area: ${Math.round(calculatedArea * 0.1)} Acres (1/10th of field). Spacing: 20cm x 15cm.` 
                        : 'No nursery stage required. Direct drill line sowing recommended.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-on-surface text-sm">Treatment Recipe & Subsidy</h4>
                  <ul className="list-disc pl-4 space-y-2 text-[11px] leading-relaxed">
                    <li><strong>Biological Coating:</strong> Coat seeds with Trichoderma Viride (10g/kg seed) to build early defense against seed-borne blast/rots.</li>
                    <li><strong>Bio-Fertilizer:</strong> Treat with Azotobacter bio-culture (1 packet/10kg seeds) to increase root zone nitrogen fixing.</li>
                    <li><strong>Government Subsidy:</strong> 50% direct subsidy rebate on certified seeds via DBT (Direct Benefit Transfer) portal.</li>
                  </ul>
                  <div className="text-primary font-bold text-[10px]">Estimated Seed Cost: ₹{Math.round(calculatedArea * 1500)}</div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-on-surface text-sm">Suppliers near Pratapgarh</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl flex justify-between items-center text-[10px]">
                      <div>
                        <span className="font-extrabold block text-on-surface">1. Pratapgarh Cooperative Seed Society</span>
                        <span className="text-on-surface-variant">District Center (2.4 km) · Subsidized Certified</span>
                      </div>
                      <a href="https://maps.google.com/?q=Seed+Cooperative+Pratapgarh" target="_blank" rel="noreferrer" className="bg-[#0c8a47] text-white p-1.5 rounded-lg flex items-center justify-center font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="p-2.5 bg-[#f5fbf6] border border-[#d2edd6] rounded-xl flex justify-between items-center text-[10px]">
                      <div>
                        <span className="font-extrabold block text-[#0f5132]">2. Mahadhan Agro Center (Private)</span>
                        <span className="text-[#0f5132]/80">APMC Yard (4.1 km) · Fresh Certified Stock</span>
                      </div>
                      <a href="https://maps.google.com/?q=Agro+Dealer+Pratapgarh" target="_blank" rel="noreferrer" className="bg-[#0c8a47] text-white p-1.5 rounded-lg flex items-center justify-center font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Land Preparation Plan */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('landPrep')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Land Preparation Plan</h3>
              </div>
              {collapsed.landPrep ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.landPrep && (
              <div className="p-6 space-y-4 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <p className="text-xs">
                  Chronological tilling and soil layout roadmap prepared for your **{formFields.soilType}** configuration.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Residue Shredding', timing: 'D-12 to D-10', machinery: 'Rotary Residue Slasher', labor: '1 Helper', cost: Math.round(calculatedArea * 500), safety: 'Wear eye goggles & protective dust mask.', why: 'Shreds preceding crop stubble into organic humus base, avoiding field fires.' },
                    { name: 'Deep MB Ploughing', timing: 'D-8 to D-6', machinery: 'Tractor (2-Bottom MB Plough)', labor: 'Driver Only', cost: Math.round(calculatedArea * 900), safety: 'Engage tractor differential lock on heavy clays.', why: 'Breaks deep subsoil clay hardpan to boost root expansion depth.' },
                    { name: 'Laser Land Leveling', timing: 'D-3 to D-2', machinery: 'Laser Transmitter + Leveler', labor: '2 Helpers', cost: Math.round(calculatedArea * 1100), safety: 'Verify laser receiver calibration.', why: 'Ensures water sheet consistency, eliminating dry patches and seepage.' },
                    { name: 'Manure & Composting', timing: 'D-2', machinery: 'Manure Spreader Trolley', labor: '3 Helpers', cost: Math.round(calculatedArea * 800), safety: 'Handle compost with gloves and protective footwear.', why: 'Incorporates organic carbon, helping clay soil structure retain nutrients.' },
                    { name: 'Puddling (If Rice)', timing: 'D-1', machinery: 'Tractor with Puddler', labor: 'Driver', cost: Math.round(calculatedArea * 1200), safety: 'Maintain shallow water level during puddling.', why: 'Forms an impermeable clay sub-layer, preventing percolation losses.' },
                    { name: 'Basal Fertilizer Harrow', timing: 'D-1', machinery: 'Disc Harrow cultivator', labor: '1 Helper', cost: Math.round(calculatedArea * 600), safety: 'Wear gloves during nutrient loading.', why: 'Blends starting Nitrogen/Phosphorus evenly into seed zones.' }
                  ].map((act, idx) => (
                    <div key={idx} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="bg-[#e8f5e9] text-[#0f5132] font-black px-2 py-0.5 rounded-full uppercase">{act.timing}</span>
                          <span className="text-on-surface-variant font-bold">Step {idx + 1}</span>
                        </div>
                        <h5 className="font-extrabold text-on-surface text-sm leading-snug">{act.name}</h5>
                        <p className="text-[11px] font-medium leading-relaxed">
                          {act.why}
                        </p>
                      </div>

                      <div className="border-t border-outline-variant/40 pt-2 text-[10px] leading-relaxed space-y-0.5">
                        <div>Machinery: <span className="text-on-surface font-bold">{act.machinery}</span></div>
                        <div className="flex justify-between">
                          <span>Labor: <span className="text-on-surface font-bold">{act.labor}</span></span>
                          <span>Cost: <span className="text-[#0c8a47] font-black">₹{act.cost}</span></span>
                        </div>
                        <div className="text-[9px] text-red-700 bg-red-50 p-1.5 rounded-md mt-1 leading-snug">
                          ⚠️ Safety: {act.safety}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Irrigation Management */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('irrigation')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Irrigation Management</h3>
              </div>
              {collapsed.irrigation ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.irrigation && (
              <div className="p-6 space-y-4 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <div className="p-3 bg-[#e8f5e9] border border-green-200 text-green-950 rounded-xl flex gap-2 items-center">
                  <Info className="w-4 h-4 text-[#0c8a47] flex-shrink-0" />
                  <span><strong>Weather-Aware Scheduling:</strong> Integrated with local IMD rain forecasts. The scheduler will automatically push back irrigation windows by 48 hours if regional rainfall registers above 8mm.</span>
                </div>

                <div className="space-y-3">
                  {[
                    { stage: 'Nursery / Sprouting Stage', depth: '2 cm', duration: '120 mins', freq: 'Every 4-5 days', runtime: '2 hrs/day', water: '12,000 Litres', method: 'Drip Sprinkler', why: 'Soft sprinkling maintains soil moist crust, increasing germination rate to 92%.' },
                    { stage: 'Crown Root Initiation (CRI)', depth: '5 cm', duration: '180 mins', freq: 'Single deep cycle', runtime: '3 hrs', water: '22,000 Litres', method: 'Deep Drip Line', why: 'CRI (D+21) is critical. Water deficit here limits crown root establishment.' },
                    { stage: 'Tillering Phase', depth: '3 cm', duration: '120 mins', freq: 'Every 8-10 days', runtime: '2 hrs', water: '15,000 Litres', method: 'Controlled Drip', why: 'Adequate moisture feeds tillering expansion and root-zone carbon capture.' },
                    { stage: 'Flowering & Grain Filling', depth: '4 cm', duration: '150 mins', freq: 'Every 7-8 days', runtime: '2.5 hrs', water: '18,000 Litres', method: 'Deep Drip Line', why: 'Milky stage water supply drives dry matter conversion, maximizing grain weight.' }
                  ].map((ir, idx) => (
                    <div key={idx} className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <span className="font-extrabold text-on-surface text-sm">{idx + 1}. {ir.stage}</span>
                        <p className="text-[11px] leading-relaxed">
                          {ir.why}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[10px] font-bold text-on-surface md:w-[540px] flex-shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/60 pt-3 md:pt-0 md:pl-4">
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Frequency</span>
                          <span>{ir.freq}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Depth</span>
                          <span>{ir.depth}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Runtime</span>
                          <span>{ir.runtime}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Water Quantity</span>
                          <span>{ir.water}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-on-surface-variant font-bold">Method</span>
                          <span>{ir.method}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Fertilizer Recommendation & Nutrient Management */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('nutrients')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Fertilizer Recommendation & Nutrient Management</h3>
              </div>
              {collapsed.nutrients ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.nutrients && (
              <div className="p-6 space-y-4 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3 flex-wrap gap-2">
                  <p className="text-xs">
                    Recommendations are customized to your Soil Health Card inputs (pH: **{formFields.ph}**, Carbon: **{formFields.carbon}%**).
                  </p>
                  
                  {/* Organic / Conventional toggle */}
                  <div className="bg-surface-container p-1 rounded-xl flex border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFertilizerMode('conventional')}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition-all ${
                        fertilizerMode === 'conventional' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Conventional Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setFertilizerMode('organic')}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition-all ${
                        fertilizerMode === 'organic' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Organic Schedule
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    {nutrientPlan.map((nut, idx) => (
                      <div key={idx} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex justify-between items-center">
                        <div className="space-y-1 max-w-[70%]">
                          <span className="font-extrabold text-on-surface text-sm">{nut.name}</span>
                          <span className="block text-[10px] text-on-surface-variant">Timing: {nut.stage}</span>
                          <p className="text-[10px] leading-tight text-primary font-medium">{nut.why}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-black text-on-surface text-sm block">{nut.qty} {nut.unit}</span>
                          <span className="text-[10px] text-primary font-bold">₹{nut.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/60 flex flex-col justify-between h-48">
                    <div className="space-y-2">
                      <span className="font-extrabold text-primary flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Dosage Diagnoses
                      </span>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between"><span>Nitrogen (N):</span> <span className="font-extrabold">{formFields.nitrogen}</span></div>
                        <div className="flex justify-between"><span>Phosphorus (P):</span> <span className="font-extrabold">{formFields.phosphorus}</span></div>
                        <div className="flex justify-between"><span>Potassium (K):</span> <span className="font-extrabold">{formFields.potassium}</span></div>
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/60 pt-3">
                      <div className="flex justify-between items-center font-bold text-[11px]">
                        <span>NPK Cost Subtotal:</span>
                        <span className="text-primary font-black">₹{fertilizerSubtotalCost}</span>
                      </div>
                      <span className="text-[8px] text-on-surface-variant leading-none block mt-1">*Government fertilizer subsidy factored.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. Pest & Disease Forecast */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('pests')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Pest & Disease Forecast</h3>
              </div>
              {collapsed.pests ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.pests && (
              <div className="p-6 space-y-4 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <p className="text-xs">
                  Predictive risk indicators. Analysis evaluates temperature and humidity indexes dynamically.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Stem Rust (Puccinia graminis)', prob: 'High (78%)', affected: 'Tillering Stage', symptoms: 'Yellow-orange pustules on leaves, breaking tissues.', prev: 'Avoid excessive Urea top-dressing.', chem: 'Spray Propiconazole 25% EC (200 ml/acre).', org: 'Foliar spray of Sour Buttermilk solution (5% concentration).', store: 'APMC Coop (3.5 km)', cost: '₹950', conf: '94%' },
                    { name: 'Powdery Mildew', prob: 'Medium (42%)', affected: 'Vegetative growth', symptoms: 'White powdery patches on upper leaf surfaces.', prev: 'Maintain proper plant spacing for canopy air circulation.', chem: 'Spray Tebucanazole 250 EC (150 ml/acre).', org: 'Baking Soda spray (5g/L water).', store: 'Pimpalgaon Farm Store (5.2 km)', cost: '₹750', conf: '88%' }
                  ].map((dis, idx) => (
                    <div key={idx} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-red-800">{dis.name}</span>
                          <span className="bg-red-50 text-red-950 text-[10px] px-2 py-0.5 rounded-full font-black">{dis.prob} Prob</span>
                        </div>
                        
                        <div className="text-[10px] space-y-0.5 leading-relaxed">
                          <div><strong>Affected stage:</strong> {dis.affected}</div>
                          <div><strong>Symptoms:</strong> {dis.symptoms}</div>
                          <div><strong>Preventive:</strong> {dis.prev}</div>
                        </div>

                        <div className="border-t border-outline-variant/45 pt-2 grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 bg-white rounded-lg border">
                            <span className="text-[8px] text-[#0f5132] uppercase block font-black mb-0.5">Organic Treatment</span>
                            <span className="text-on-surface leading-snug block">{dis.org}</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border">
                            <span className="text-[8px] text-red-700 uppercase block font-black mb-0.5">Chemical Option</span>
                            <span className="text-on-surface leading-snug block">{dis.chem}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/40 pt-2 flex justify-between items-center text-[10px] font-bold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {dis.store}
                        </span>
                        <span className="text-primary font-black">{dis.cost} / treatment (AI Conf: {dis.conf})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Water Management Plan (AWD) */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('waterAwd')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Water Management & AWD Protocol</h3>
              </div>
              {collapsed.waterAwd ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.waterAwd && (
              <div className="p-6 space-y-4 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <p className="text-xs">
                  Alternate Wetting and Drying (AWD) is active for **{selectedVariety.name}** under your soil configurations to save up to 30% groundwater consumption.
                </p>

                <div className="overflow-x-auto border border-outline-variant/60 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-on-surface">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant font-bold border-b border-outline-variant/80">
                        <th className="p-3">Growth Stage</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Water Quantity</th>
                        <th className="p-3">Critical Stage</th>
                        <th className="p-3">AWD / Water Conservation Tips</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest text-on-surface-variant">
                      <tr>
                        <td className="p-3 font-extrabold text-on-surface">Sowing & Seedling</td>
                        <td className="p-3">Every 4 days</td>
                        <td className="p-3">12,000 Litres</td>
                        <td className="p-3 text-red-700 font-bold">Yes</td>
                        <td className="p-3">Sprinkler use controls soil crusting; blocks water erosion.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-extrabold text-on-surface">Crown Root (CRI)</td>
                        <td className="p-3">Single cycle</td>
                        <td className="p-3">22,000 Litres</td>
                        <td className="p-3 text-red-700 font-bold">CRITICAL</td>
                        <td className="p-3">Avoid dry soil completely. Essential for root crown anchoring.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-extrabold text-on-surface">Tillering Phase</td>
                        <td className="p-3">Every 8 days</td>
                        <td className="p-3">15,000 Litres</td>
                        <td className="p-3">No</td>
                        <td className="p-3"><strong>AWD Protocol:</strong> Let soil dry for 2 days before re-watering to boost root depth.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-extrabold text-on-surface">Flowering & Milky</td>
                        <td className="p-3">Every 7 days</td>
                        <td className="p-3">18,000 Litres</td>
                        <td className="p-3 text-red-700 font-bold">Yes</td>
                        <td className="p-3">Maintain standing moisture of 2cm; avoids grain shriveling.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 9. Economic Viability & Profit Calculator */}
          <div className="bg-white rounded-card border border-outline-variant/60 shadow-sm overflow-hidden">
            <div 
              onClick={() => toggleCollapse('profitCalc')}
              className="p-5 border-b border-outline-variant/40 flex justify-between items-center cursor-pointer select-none bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-display font-extrabold text-base text-on-surface">Economic Viability & Profit Calculator</h3>
              </div>
              {collapsed.profitCalc ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!collapsed.profitCalc && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in text-xs font-semibold text-on-surface-variant">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-extrabold text-on-surface border-b border-outline-variant/40 pb-2 flex justify-between">
                    <span>Edit Production Expenses (₹)</span>
                    <span className="text-primary text-[10px]">Tweak values below to recalculate profit</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] mb-1">Seed Procurement Cost</label>
                      <input
                        type="number"
                        value={costs.seed}
                        onChange={(e) => setCosts({...costs, seed: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Fertilizers & Nutrients Cost</label>
                      <input
                        type="number"
                        value={costs.fertilizer}
                        disabled
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface font-extrabold opacity-75"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Pesticide & Fungicide Cost</label>
                      <input
                        type="number"
                        value={costs.pesticide}
                        onChange={(e) => setCosts({...costs, pesticide: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Irrigation Pump Electricity</label>
                      <input
                        type="number"
                        value={costs.irrigation}
                        onChange={(e) => setCosts({...costs, irrigation: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Labor Hire Expenses</label>
                      <input
                        type="number"
                        value={costs.labor}
                        onChange={(e) => setCosts({...costs, labor: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Machinery & Fuel Rental</label>
                      <input
                        type="number"
                        value={costs.machinery}
                        onChange={(e) => setCosts({...costs, machinery: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Transportation & Loading</label>
                      <input
                        type="number"
                        value={costs.transportation}
                        onChange={(e) => setCosts({...costs, transportation: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1">Miscellaneous Expenses</label>
                      <input
                        type="number"
                        value={costs.misc}
                        onChange={(e) => setCosts({...costs, misc: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-extrabold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-4 border-t border-outline-variant/45">
                    <div>
                      <label className="block text-[10px] text-on-surface mb-1 font-extrabold">Expected Yield (Qtl/Acre)</label>
                      <input
                        type="number"
                        value={costs.expectedYield}
                        onChange={(e) => setCosts({...costs, expectedYield: parseFloat(e.target.value) || 0})}
                        className="w-full bg-surface-container-low border border-primary/40 rounded-xl p-2.5 text-xs text-primary font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface mb-1 font-extrabold">Expected Sale Price (₹/Qtl)</label>
                      <input
                        type="number"
                        value={costs.expectedPrice}
                        onChange={(e) => setCosts({...costs, expectedPrice: parseInt(e.target.value) || 0})}
                        className="w-full bg-surface-container-low border border-primary/40 rounded-xl p-2.5 text-xs text-primary font-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/60 flex flex-col justify-between gap-4 font-bold">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-on-surface border-b border-outline-variant/40 pb-2">
                      Projections Scenario Simulator
                    </h4>

                    {/* Simulator Toggles */}
                    <div className="bg-white p-1 rounded-xl flex border border-slate-200">
                      {['worst', 'realistic', 'optimistic'].map((scen) => (
                        <button
                          key={scen}
                          type="button"
                          onClick={() => setProfitScenario(scen)}
                          className={`flex-1 py-1 rounded-lg text-[9px] uppercase tracking-wider transition-all ${
                            profitScenario === scen ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {scen === 'worst' ? 'Worst' : scen === 'realistic' ? 'Real' : 'Best'}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 border-b border-outline-variant/40 pb-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Total Input Expenses:</span>
                        <span className="text-on-surface font-extrabold">₹{totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Expected Revenue:</span>
                        <span className="text-on-surface font-extrabold">₹{simData.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Return on Investment:</span>
                        <span className="text-on-surface font-extrabold text-green-700">{simData.roi}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Break-even Yield:</span>
                        <span className="text-on-surface font-extrabold">{simData.breakEven} Qtl/Acre</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-white rounded-xl border border-primary/20 shadow-xs">
                    <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-extrabold">Estimated Net Profit</span>
                    <span className="text-2xl font-black text-primary">₹{simData.profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 10. Visual Transition & Crop Confirmation */}
          {!viewingActivePlan && (
            <div className="bg-gradient-to-br from-[#f4faf5] to-white rounded-card border-2 border-primary shadow-md p-8 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <FileCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-2xl text-on-surface leading-tight">
                  {seasonPlanConfirmed ? 'Discard Previous Plan & Implement New Plan' : 'Confirm Cultivation Strategy & Activate Live Tracker'}
                </h3>
                <p className="text-xs text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-semibold">
                  {seasonPlanConfirmed 
                    ? 'Warning: Confirming this action will completely overwrite your previously confirmed crop blueprint on the home dashboard. This updates the daily task sheets, disease alerts, Google Calendar syncs, and community feeds.' 
                    : 'Confirming this plan converts the pre-season strategy into the official KisanMitra Live Crop Planner. The AI will populate your home dashboard, today\'s work checklists, crop-growth timeline, and schedule tasks automatically on your Google Calendar.'}
                </p>
                
                <div className="p-3 bg-primary/10 border border-primary/20 text-[#0f5132] rounded-xl text-xs max-w-xl mx-auto font-bold flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>TRANSITION: Switching from "Planning Mode" into "Execution Mode".</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmPlan}
                  className="bg-primary hover:bg-[#004e20] text-white font-extrabold px-10 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>{seasonPlanConfirmed ? 'Discard Previous & Implement New Plan' : 'Confirm Crop Plan & Run Daily Tasks'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
