// KisanMitra Annual Farming Strategy Planner Engine
// Generates detailed, customizable annual schedules, nutrient plans, water management plans,
// pest calendars, and market/selling projections based on selected crops per season.

import { parseSoilData, calculateNutrientPlan } from '../data/soilNutrientEngine';
import { getDiseasesForCrop } from '../data/cropIntelligence';

// ── Seasons Definition ────────────────────────────────────────────────
export const SEASONS_CONFIG = {
  Kharif: { name: 'Kharif', startMonth: 'June', endMonth: 'October', duration: '5 months' },
  Rabi: { name: 'Rabi', startMonth: 'November', endMonth: 'March', duration: '5 months' },
  Zaid: { name: 'Zaid', startMonth: 'April', endMonth: 'May', duration: '2 months' }
};

// ── Brand Recommendations per Nutrient ────────────────────────────────
const BRAND_MAP = {
  Urea: ['IFFCO Urea', 'KRIBHCO Urea', 'Chambal Uttam Urea'],
  DAP: ['IFFCO DAP', 'IPL DAP', 'Paradeep DAP'],
  MOP: ['IFFCO MOP', 'IPL Potash', 'Zuari MOP'],
  Vermicompost: ['Local KVK Cooperative Vermicompost', 'Sardar Organic Vermicompost'],
  Rhizobium: ['National Fertilizers Ltd (NFL) Bio-cult', 'KRIBHCO Rhizobium'],
  Azotobacter: ['IFFCO Azotobacter', 'NFL Bio-fertilizer'],
  PSB: ['IFFCO PSB', 'KRIBHCO Phosphate Solubilizer'],
  trichoderma: ['Trichoguard (Biocon)', 'IFFCO Trichoderma viride'],
  jeevamrutha: ['Self-prepared cow dung/urine bio-formulation']
};

/**
 * Generate a complete visual timeline and detailed planning strategy.
 * 
 * @param {Object} selectedCrops - { Kharif: cropObj, Rabi: cropObj, Zaid: cropObj }
 * @param {Object} farm - Farm metadata (soil, area, water source, state, district)
 * @param {string} mode - 'conventional' | 'organic' | 'integrated'
 * @returns {Object} Complete Annual Farming Strategy
 */
export function generateAnnualStrategy(selectedCrops, farm, mode = 'conventional') {
  const area = parseFloat(farm?.area) || 2.5;
  const state = farm?.state || 'Maharashtra';
  const district = farm?.district || 'Nashik';
  const soilData = farm?.soil ? parseSoilData(farm.soil) : null;
  const hasSoilCard = farm?.soil?.source === 'card';

  const strategy = {
    timeline: [],
    details: {},
    financialSummary: { totalCost: 0, totalRevenue: 0, netProfit: 0 }
  };

  Object.entries(selectedCrops).forEach(([season, crop]) => {
    if (!crop || crop.id === 'fallow') {
      // Fallow Season
      strategy.timeline.push({
        season,
        cropName: 'Fallow Land',
        variety: 'N/A',
        startMonth: SEASONS_CONFIG[season].startMonth,
        harvestMonth: SEASONS_CONFIG[season].endMonth,
        duration: SEASONS_CONFIG[season].duration,
        estimatedProfit: 0,
        status: 'Fallow Recovery'
      });

      strategy.details[season] = {
        overview: {
          title: 'Soil Recovery & Rest Season',
          objective: 'Incorporate green manures or cover crops to restore soil organic carbon, moisture, and beneficial microbiomes.',
          timelineText: `${SEASONS_CONFIG[season].startMonth} - ${SEASONS_CONFIG[season].endMonth}`,
          profitability: 'No direct crop revenue. Long-term yield improvement of subsequent Kharif crops by 15-20%.',
          suitability: 'Highly recommended for sustainable farming practice.',
          warnings: 'Avoid leaving land completely bare; apply straw mulch or sow Dhaincha/Sunn hemp to prevent erosion.'
        },
        calendar: [
          {
            month: SEASONS_CONFIG[season].startMonth,
            activity: 'Cover crop sowing',
            date: '10th Day of Season',
            duration: '1 day',
            resources: 'Dhaincha (Green Manure) seeds (15 kg/acre)',
            cost: Math.round(area * 400),
            outcome: 'Establishes root nodules to fix nitrogen naturally.'
          },
          {
            month: SEASONS_CONFIG[season].endMonth,
            activity: 'Green manure incorporation',
            date: '45th Day of Season',
            duration: '2 days',
            resources: 'Tractor with Disc Harrow or Rotavator',
            cost: Math.round(area * 1200),
            outcome: 'Mixes cover crop residues into the soil, boosting Soil Organic Carbon (SOC) by 0.15%.'
          }
        ],
        nutrients: {
          items: [],
          summary: 'No synthetic chemical application recommended. Green manuring acts as a biological nutrient replenisher.',
          hasSoilCard
        },
        water: {
          items: [],
          warnings: 'Maintain minimal moisture to support biological degradation of incorporated green manures.'
        },
        pests: [],
        schemes: [
          {
            name: 'Sub-Mission on Agroforestry & Green Manuring Subsidies',
            benefits: 'Free green manure seed distribution from local KVK office.',
            link: 'https://agricoop.nic.in/'
          }
        ]
      };
      return;
    }

    // Crop Sowing details based on season
    const isKharif = season === 'Kharif';
    const isRabi = season === 'Rabi';
    const cropId = crop.id.toLowerCase();
    const varietyName = crop.name || 'Karan Vandana';
    const duration = crop.maturityDays || 120;
    
    // Revenue calculations
    const yieldPotential = crop.yieldPotential || 22;
    const pricePerQtl = crop.livePrice || crop.msp || 2200;
    const estRevenue = Math.round(yieldPotential * area * pricePerQtl);
    const estCost = Math.round(area * (cropId === 'rice' ? 14000 : (cropId === 'sugarcane' ? 25000 : 11000)));
    const estProfit = estRevenue - estCost;

    strategy.financialSummary.totalRevenue += estRevenue;
    strategy.financialSummary.totalCost += estCost;
    strategy.financialSummary.netProfit += estProfit;

    // Timeline card data
    strategy.timeline.push({
      season,
      cropName: crop.cropName || crop.name,
      variety: varietyName,
      startMonth: isKharif ? 'June' : (isRabi ? 'November' : 'April'),
      harvestMonth: isKharif ? 'October' : (isRabi ? 'March' : 'June'),
      duration: `${duration} days`,
      estimatedYield: `${Math.round(yieldPotential * area)} Quintals`,
      estimatedProfit: estProfit,
      waterRequirement: `${crop.waterRequirement || 400} mm`,
      diseaseRisk: crop.riskAssessment?.disease || 'Medium',
      status: 'Planned'
    });

    // Monthly Calendar activities
    const calendar = [];
    const baseMonthIdx = isKharif ? 0 : (isRabi ? 5 : 10);
    const months = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
    
    calendar.push({
      month: months[baseMonthIdx % 12],
      activity: 'Land Preparation & Basal Fertilization',
      date: '1st Week',
      duration: '3-4 days',
      resources: 'Tractor, MB Plough, organic compost / FYM, Basal fertilizer dose',
      cost: Math.round(area * 2500),
      outcome: 'A loose, well-aerated seedbed ready for sowing with initial nutrients.'
    });

    calendar.push({
      month: months[(baseMonthIdx + 1) % 12],
      activity: 'Sowing / Transplanting & Weed Management',
      date: '1st - 2nd Week',
      duration: '2 days',
      resources: 'Healthy seeds, seed treatment bio-agents, pre-emergence herbicide',
      cost: Math.round(area * 3000),
      outcome: 'Optimal seed germinations and control over early weed competition.'
    });

    calendar.push({
      month: months[(baseMonthIdx + 2) % 12],
      activity: 'Top Dressing & Disease Monitoring',
      date: '3rd Week',
      duration: '1 day',
      resources: 'Urea top-dressing (for conventional) / Bio-fert (for organic), Neem oil spray',
      cost: Math.round(area * 1500),
      outcome: 'Vegetative surge support and early barrier against pests.'
    });

    calendar.push({
      month: months[(baseMonthIdx + 3) % 12],
      activity: 'Second Top Dressing & Final weeding',
      date: '2nd Week',
      duration: '2 days',
      resources: 'Potash dressing, manual labor / post-emergence weed spray',
      cost: Math.round(area * 2000),
      outcome: 'Healthy tillering/branching and prepares fields for flowering.'
    });

    calendar.push({
      month: months[(baseMonthIdx + 4) % 12],
      activity: 'Harvesting, Threshing & Market Sale',
      date: 'Last Week',
      duration: '4-5 days',
      resources: 'Harvester combine / manual sickles, tarpaulins, APMC Mandi transport booking',
      cost: Math.round(area * 4000),
      outcome: `Clean harvest of estimated ${Math.round(yieldPotential * area)} Qtl of grains sold at best net rate.`
    });

    // Nutrient Plan
    const nutrientReq = crop.nutrientRequirement || { N: 100, P: 50, K: 40 };
    const organicAlts = crop.organicAlternatives || { FYM: 10000, vermicompost: 2500 };
    const rawNutrients = calculateNutrientPlan(soilData, nutrientReq, area, mode, organicAlts);
    const nutrientItems = (rawNutrients.items || []).map(item => {
      const matchBrands = BRAND_MAP[item.name.split(' (')[0]] || BRAND_MAP[item.name] || ['Local Agri Co-op'];
      return {
        ...item,
        qty: item.qty,
        method: item.stage.toLowerCase().includes('basal') ? 'Broadcasting / Soil Incorporation' : 'Top Dressing / Foliar Spray',
        brands: matchBrands.slice(0, 2).join(' or '),
        subsidy: item.name.toLowerCase().includes('urea') || item.name.toLowerCase().includes('dap') ? 'Yes (factored in cost)' : 'No'
      };
    });

    // Water Management
    const waterDemand = crop.waterRequirement || 400;
    const irrCount = crop.irrigationCount || 4;
    const waterItems = [];
    for (let i = 1; i <= irrCount; i++) {
      waterItems.push({
        event: `Irrigation Event #${i}`,
        stage: i === 1 ? 'Crown Root Initiation (21 DAS)' : (i === 2 ? 'Late Tillering (45 DAS)' : (i === 3 ? 'Flowering (65 DAS)' : 'Milk/Grain Filling (85 DAS)')),
        daysAfterSowing: i === 1 ? 21 : (i === 2 ? 45 : (i === 3 ? 65 : 85)),
        durationHours: Math.round(area * 4),
        waterLiters: Math.round(area * 45000),
        savingAdvisory: 'Use Drip/Sprinkler to reduce water consumption by 40%. Monitor rainfall to skip scheduled pump runs.'
      });
    }

    // Proactive Pests & Disease prevention
    const diseases = getDiseasesForCrop(cropId);
    const pestsList = diseases.map(d => ({
      name: d.name,
      probability: d.humidityThreshold > 80 ? 'High (Humidity-triggered)' : 'Medium',
      symptoms: 'Initial yellow spots or powdery residue on lower leaves.',
      prevention: 'Seed treatment before sowing.',
      chemical: d.treatment,
      organic: d.organicTreatment,
      costEstimate: Math.round(area * 600)
    }));

    // Government Schemes
    const stateFm = state.toLowerCase();
    const seasonSchemes = [
      {
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        benefits: 'Low premium crop insurance (1.5% for Rabi, 2.0% for Kharif) guarding against drought/flood.',
        link: 'https://pmfby.gov.in/'
      }
    ];

    if (cropId === 'rice') {
      seasonSchemes.push({
        name: 'NFSM - Rice Subsidy Development Program',
        benefits: '₹500/acre subsidy on certified seed procurement.',
        link: 'https://nfsm.gov.in/'
      });
    } else if (cropId === 'wheat') {
      seasonSchemes.push({
        name: 'NFSM - Wheat Seed Distribution Subsidy',
        benefits: 'High-yielding variety seeds distributed at 50% discount at block cooperatives.',
        link: 'https://nfsm.gov.in/'
      });
    }

    strategy.details[season] = {
      overview: {
        title: `${crop.cropName || crop.name} Sowing Strategy`,
        objective: `Achieve high grain weight and quality through timely sowing and nutrient management.`,
        timelineText: isKharif ? 'June - October' : 'November - March',
        profitability: `Estimated Net profit: ₹${estProfit.toLocaleString('en-IN')}`,
        suitability: `Perfect fit for ${district}'s historical temperature range.`,
        warnings: isKharif ? 'Monitor monsoonal breaks to coordinate irrigation.' : 'Protect from late heat stress during grain filling.'
      },
      calendar,
      nutrients: {
        items: nutrientItems,
        summary: rawNutrients.summary,
        hasSoilCard
      },
      water: {
        items: waterItems,
        warnings: 'Ensure no waterlogging during seed germination and early stage.'
      },
      pests: pestsList,
      schemes: seasonSchemes
    };
  });

  return strategy;
}
