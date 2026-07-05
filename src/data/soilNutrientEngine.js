// KisanMitra Soil Nutrient Gap Analysis Engine
// Based on ICAR/State Agricultural University fertilizer recommendation tables
// Supports Conventional, Organic (NCONF), and Integrated nutrient modes

// ── Nutrient sufficiency ranges (mg/kg for micronutrients, kg/ha for NPK) ──
const SUFFICIENCY_RANGES = {
  nitrogen:   { low: 280, medium: 560, unit: 'kg/ha' },   // KMnO4 extractable
  phosphorus: { low: 10, medium: 25, unit: 'kg/ha' },     // Olsen's method
  potassium:  { low: 120, medium: 280, unit: 'kg/ha' },   // Ammonium acetate
  organicCarbon: { low: 0.5, medium: 0.75, unit: '%' },
  pH:         { acidic: 6.5, alkaline: 8.5 },
  ec:         { normal: 1.0, saline: 4.0, unit: 'dS/m' },
  sulphur:    { low: 10, medium: 20, unit: 'mg/kg' },
  zinc:       { low: 0.6, medium: 1.2, unit: 'mg/kg' },
  iron:       { low: 4.5, medium: 9.0, unit: 'mg/kg' },
  copper:     { low: 0.2, medium: 0.5, unit: 'mg/kg' },
  manganese:  { low: 2.0, medium: 4.0, unit: 'mg/kg' },
  boron:      { low: 0.5, medium: 1.0, unit: 'mg/kg' }
};

// ── Fertilizer nutrient content (%) ──────────────────────────────────
const FERTILIZER_CONTENT = {
  urea:       { N: 46, cost: 267 },     // ₹/50kg bag (subsidized)
  dap:        { N: 18, P: 46, cost: 1350 },
  mop:        { K: 60, cost: 870 },
  ssp:        { P: 16, S: 11, cost: 450 },
  znso4:      { Zn: 33, cost: 130 },    // ₹/kg
  feso4:      { Fe: 19, cost: 80 },
  borax:      { B: 11, cost: 120 },
  gypsum:     { S: 18, Ca: 23, cost: 250 }, // ₹/50kg
  cuso4:      { Cu: 25, cost: 250 },
  mnso4:      { Mn: 30, cost: 100 }
};

// ── Organic input specifications (NCONF Package of Practice) ──────────
const ORGANIC_INPUTS = {
  FYM:          { N: 0.5, P: 0.25, K: 0.5, cost: 1.5, unit: 'kg', label: 'Farm Yard Manure (FYM)', why: 'Provides slow-release NPK, improves soil structure and water-holding capacity.' },
  vermicompost: { N: 1.5, P: 0.7, K: 1.0, cost: 8, unit: 'kg', label: 'Vermicompost', why: 'Rich in humic acids and beneficial microbes. Enhances root zone biology.' },
  neemCake:     { N: 5.0, P: 1.0, K: 1.5, cost: 20, unit: 'kg', label: 'Neem Cake Powder', why: 'Natural nematicide, slow nitrogen release, suppresses soil-borne pathogens.' },
  rhizobium:    { N: 'biofixer', cost: 30, unit: 'packets', label: 'Rhizobium Bio-culture', why: 'Symbiotic nitrogen fixer for leguminous crops (Gram, Soybean). Fixes 30-80 kg N/ha.' },
  azotobacter:  { N: 'biofixer', cost: 30, unit: 'packets', label: 'Azotobacter Bio-fertilizer', why: 'Free-living nitrogen fixer. Fixes 15-20 kg N/ha for cereals.' },
  PSB:          { P: 'solubilizer', cost: 30, unit: 'packets', label: 'Phosphorus Solubilizing Bacteria (PSB)', why: 'Converts locked soil phosphorus into plant-available form. Equivalent to 25-30 kg P₂O₅/ha.' },
  trichoderma:  { cost: 50, unit: 'packets', label: 'Trichoderma viride', why: 'Biocontrol agent against soil-borne diseases (Fusarium wilt, root rot). Essential for seed/soil treatment.' },
  jeevamrutha:  { N: 0.1, P: 0.05, K: 0.1, cost: 2.5, unit: 'litres', label: 'Jeevamrutha Solution', why: 'Traditional organic preparation that stimulates soil microbial activity massively.' }
};

/**
 * Classify a soil nutrient level as Low / Medium / High
 */
function classifyNutrient(value, nutrientKey) {
  const range = SUFFICIENCY_RANGES[nutrientKey];
  if (!range || value === undefined || value === null || value === '') return 'Medium';
  const v = parseFloat(value);
  if (isNaN(v)) return 'Medium';
  if (v < range.low) return 'Low';
  if (v < range.medium) return 'Medium';
  return 'High';
}

/**
 * Parse soil data from farm object into standardized format
 */
export function parseSoilData(farmSoil) {
  if (!farmSoil) return null;

  const parseVal = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      if (v.toLowerCase() === 'low') return 200;
      if (v.toLowerCase() === 'medium') return 400;
      if (v.toLowerCase() === 'high') return 600;
      return parseFloat(v) || 0;
    }
    return 0;
  };

  return {
    nitrogen: { value: parseVal(farmSoil.nitrogen), class: classifyNutrient(parseVal(farmSoil.nitrogen), 'nitrogen') },
    phosphorus: { value: parseVal(farmSoil.phosphorus), class: classifyNutrient(parseVal(farmSoil.phosphorus), 'phosphorus') },
    potassium: { value: parseVal(farmSoil.potassium), class: classifyNutrient(parseVal(farmSoil.potassium), 'potassium') },
    pH: { value: parseFloat(farmSoil.ph) || 7.0 },
    organicCarbon: { value: parseFloat(farmSoil.carbon) || 0.55, class: classifyNutrient(parseFloat(farmSoil.carbon) || 0.55, 'organicCarbon') },
    sulphur: { value: parseFloat(farmSoil.sulphur) || 0, class: classifyNutrient(parseFloat(farmSoil.sulphur) || 0, 'sulphur') },
    zinc: { value: parseFloat(farmSoil.zinc) || 0, class: classifyNutrient(parseFloat(farmSoil.zinc) || 0, 'zinc') },
    iron: { value: parseFloat(farmSoil.iron) || 0, class: classifyNutrient(parseFloat(farmSoil.iron) || 0, 'iron') },
    type: farmSoil.type || 'Loamy',
    source: farmSoil.source || 'manual'
  };
}

/**
 * Calculate nutrient gap and fertilizer recommendations
 * @param {Object} soilData - Parsed soil data
 * @param {Object} cropRequirement - { N, P, K, Zn, Fe, S, B } from cropIntelligence
 * @param {number} areaAcres - Farm area in acres
 * @param {string} mode - 'conventional' | 'organic' | 'integrated'
 * @param {Object} organicAlts - Organic alternatives from cropIntelligence
 * @returns {Object} Fertilizer plan with quantities, costs, and explanations
 */
export function calculateNutrientPlan(soilData, cropRequirement, areaAcres, mode = 'conventional', organicAlts = {}) {
  const area = parseFloat(areaAcres) || 1;
  const req = cropRequirement || { N: 120, P: 60, K: 40 };

  // Convert per-hectare requirements to per-acre (1 acre = 0.405 ha)
  const acreMultiplier = 0.405;

  const nReq = (req.N || 120) * acreMultiplier * area;
  const pReq = (req.P || 60) * acreMultiplier * area;
  const kReq = (req.K || 40) * acreMultiplier * area;

  // Adjustment based on soil status
  const nAdjust = soilData?.nitrogen?.class === 'High' ? 0.75 : (soilData?.nitrogen?.class === 'Low' ? 1.25 : 1.0);
  const pAdjust = soilData?.phosphorus?.class === 'High' ? 0.75 : (soilData?.phosphorus?.class === 'Low' ? 1.25 : 1.0);
  const kAdjust = soilData?.potassium?.class === 'High' ? 0.75 : (soilData?.potassium?.class === 'Low' ? 1.25 : 1.0);

  const adjustedN = Math.round(nReq * nAdjust);
  const adjustedP = Math.round(pReq * pAdjust);
  const adjustedK = Math.round(kReq * kAdjust);

  if (mode === 'conventional') {
    return getConventionalPlan(adjustedN, adjustedP, adjustedK, req, area, soilData);
  } else if (mode === 'organic') {
    return getOrganicPlan(adjustedN, adjustedP, adjustedK, area, organicAlts);
  } else {
    // Integrated: 50% chemical + 50% organic
    const chemPlan = getConventionalPlan(Math.round(adjustedN * 0.5), Math.round(adjustedP * 0.5), Math.round(adjustedK * 0.5), req, area, soilData);
    const orgPlan = getOrganicPlan(Math.round(adjustedN * 0.5), Math.round(adjustedP * 0.5), Math.round(adjustedK * 0.5), area, organicAlts);
    return {
      mode: 'integrated',
      label: 'Integrated Nutrient Management (INM)',
      chemical: chemPlan.items,
      organic: orgPlan.items,
      items: [...chemPlan.items, ...orgPlan.items],
      totalCost: chemPlan.totalCost + orgPlan.totalCost,
      summary: `Balanced 50/50 approach: Chemical fertilizers provide immediate nutrition, while organic inputs build long-term soil health. Total cost: ₹${(chemPlan.totalCost + orgPlan.totalCost).toLocaleString('en-IN')}.`,
      soilHealthImpact: 'Positive — organic component improves soil biology while chemical inputs address immediate nutrient gaps.'
    };
  }
}

function getConventionalPlan(nKg, pKg, kKg, req, area, soilData) {
  const items = [];

  // DAP provides both N and P
  const dapKg = Math.round((pKg / (FERTILIZER_CONTENT.dap.P / 100)));
  const nFromDap = Math.round(dapKg * FERTILIZER_CONTENT.dap.N / 100);
  items.push({
    name: 'DAP (Diammonium Phosphate)', qty: dapKg, unit: 'kg',
    stage: 'Basal application during sowing',
    cost: Math.round((dapKg / 50) * FERTILIZER_CONTENT.dap.cost),
    why: `Supplies ${pKg} kg P₂O₅/acre and ${nFromDap} kg N/acre for vigorous root development.`
  });

  // Urea for remaining N
  const remainingN = Math.max(0, nKg - nFromDap);
  const ureaKg = Math.round(remainingN / (FERTILIZER_CONTENT.urea.N / 100));
  items.push({
    name: 'Urea (Nitrogen Source)', qty: ureaKg, unit: 'kg',
    stage: 'Split: ⅓ basal + ⅓ at tillering (21 DAS) + ⅓ at flowering',
    cost: Math.round((ureaKg / 50) * FERTILIZER_CONTENT.urea.cost),
    why: `Supplies ${remainingN} kg N/acre for vegetative growth and grain filling.`
  });

  // MOP for K
  const mopKg = Math.round(kKg / (FERTILIZER_CONTENT.mop.K / 100));
  items.push({
    name: 'MOP (Muriate of Potash)', qty: mopKg, unit: 'kg',
    stage: 'Basal application during sowing',
    cost: Math.round((mopKg / 50) * FERTILIZER_CONTENT.mop.cost),
    why: `Supplies ${kKg} kg K₂O/acre for stalk strength and grain weight.`
  });

  // Micronutrients
  if (req.Zn || soilData?.zinc?.class === 'Low') {
    const znKg = Math.round(area * 10);
    items.push({
      name: 'Zinc Sulphate (ZnSO₄)', qty: znKg, unit: 'kg',
      stage: 'Basal application or foliar spray at 30 DAS',
      cost: Math.round(znKg * FERTILIZER_CONTENT.znso4.cost),
      why: soilData?.zinc?.class === 'Low' ? 'Soil zinc is deficient — critical for preventing Khaira disease and leaf chlorosis.' : 'Standard zinc supplement for optimal grain quality.'
    });
  }

  if (req.S) {
    const gypsumKg = Math.round(area * 40);
    items.push({
      name: 'Gypsum (Sulphur source)', qty: gypsumKg, unit: 'kg',
      stage: 'Basal application',
      cost: Math.round((gypsumKg / 50) * FERTILIZER_CONTENT.gypsum.cost),
      why: 'Supplies sulphur for oilseed/pulse crops (critical for protein synthesis).'
    });
  }

  const totalCost = items.reduce((s, i) => s + i.cost, 0);

  return {
    mode: 'conventional',
    label: 'Conventional Chemical Fertilization',
    items,
    totalCost,
    summary: `Soil-test-based recommendation: ${nKg} kg N, ${pKg} kg P₂O₅, ${kKg} kg K₂O per acre. Total input cost: ₹${totalCost.toLocaleString('en-IN')}. Government subsidy on urea, DAP, and MOP is already factored.`,
    soilHealthImpact: 'Neutral — provides immediate crop nutrition but does not improve soil organic matter.'
  };
}

function getOrganicPlan(nKg, pKg, kKg, area, organicAlts) {
  const items = [];

  // FYM for base nutrition
  const fymKg = organicAlts.FYM || Math.round(area * 10000);
  items.push({
    name: ORGANIC_INPUTS.FYM.label, qty: fymKg, unit: 'kg',
    stage: 'Apply 15-20 days before sowing during last ploughing',
    cost: Math.round(fymKg * ORGANIC_INPUTS.FYM.cost),
    why: ORGANIC_INPUTS.FYM.why
  });

  // Vermicompost
  const vcKg = organicAlts.vermicompost || Math.round(area * 2500);
  items.push({
    name: ORGANIC_INPUTS.vermicompost.label, qty: vcKg, unit: 'kg',
    stage: 'Mix with soil at sowing / apply in furrows',
    cost: Math.round(vcKg * ORGANIC_INPUTS.vermicompost.cost),
    why: ORGANIC_INPUTS.vermicompost.why
  });

  // Neem Cake
  if (organicAlts.neemCake) {
    items.push({
      name: ORGANIC_INPUTS.neemCake.label, qty: organicAlts.neemCake, unit: 'kg',
      stage: 'Basal application with FYM',
      cost: Math.round(organicAlts.neemCake * ORGANIC_INPUTS.neemCake.cost),
      why: ORGANIC_INPUTS.neemCake.why
    });
  }

  // Bio-fertilizers
  if (organicAlts.azotobacter) {
    items.push({
      name: ORGANIC_INPUTS.azotobacter.label, qty: organicAlts.azotobacter, unit: 'packets',
      stage: 'Seed treatment before sowing',
      cost: Math.round(organicAlts.azotobacter * ORGANIC_INPUTS.azotobacter.cost),
      why: ORGANIC_INPUTS.azotobacter.why
    });
  }

  if (organicAlts.rhizobium) {
    items.push({
      name: ORGANIC_INPUTS.rhizobium.label, qty: organicAlts.rhizobium, unit: 'packets',
      stage: 'Seed inoculation (mix with jaggery solution)',
      cost: Math.round(organicAlts.rhizobium * ORGANIC_INPUTS.rhizobium.cost),
      why: ORGANIC_INPUTS.rhizobium.why
    });
  }

  if (organicAlts.PSB) {
    items.push({
      name: ORGANIC_INPUTS.PSB.label, qty: organicAlts.PSB, unit: 'packets',
      stage: 'Soil incorporation or seed treatment',
      cost: Math.round(organicAlts.PSB * ORGANIC_INPUTS.PSB.cost),
      why: ORGANIC_INPUTS.PSB.why
    });
  }

  if (organicAlts.trichoderma) {
    items.push({
      name: ORGANIC_INPUTS.trichoderma.label, qty: organicAlts.trichoderma, unit: 'packets',
      stage: 'Seed treatment + soil drenching',
      cost: Math.round(organicAlts.trichoderma * ORGANIC_INPUTS.trichoderma.cost),
      why: ORGANIC_INPUTS.trichoderma.why
    });
  }

  // Jeevamrutha for ongoing nutrition
  const jeevLitres = Math.round(area * 200);
  items.push({
    name: ORGANIC_INPUTS.jeevamrutha.label, qty: jeevLitres, unit: 'litres',
    stage: 'Weekly soil drenching with irrigation water',
    cost: Math.round(jeevLitres * ORGANIC_INPUTS.jeevamrutha.cost),
    why: ORGANIC_INPUTS.jeevamrutha.why
  });

  const totalCost = items.reduce((s, i) => s + i.cost, 0);

  return {
    mode: 'organic',
    label: 'NCONF Organic Nutrient Package',
    items,
    totalCost,
    summary: `Zero-chemical plan based on NCONF (National Centre of Organic & Natural Farming) guidelines. Builds soil health over 2-3 seasons. Total input cost: ₹${totalCost.toLocaleString('en-IN')}.`,
    soilHealthImpact: 'Highly Positive — dramatically improves soil organic carbon, microbial diversity, and water retention within 2-3 crop cycles.'
  };
}

/**
 * Generate a soil health summary card for UI display
 */
export function getSoilHealthSummary(farmSoil) {
  const parsed = parseSoilData(farmSoil);
  if (!parsed) return null;

  const deficiencies = [];
  if (parsed.nitrogen.class === 'Low') deficiencies.push('Nitrogen');
  if (parsed.phosphorus.class === 'Low') deficiencies.push('Phosphorus');
  if (parsed.potassium.class === 'Low') deficiencies.push('Potassium');
  if (parsed.organicCarbon.class === 'Low') deficiencies.push('Organic Carbon');
  if (parsed.zinc.class === 'Low') deficiencies.push('Zinc');
  if (parsed.iron.class === 'Low') deficiencies.push('Iron');

  const pHStatus = parsed.pH.value < 6.5 ? 'Acidic' : (parsed.pH.value > 8.5 ? 'Alkaline' : 'Normal');
  const overallScore = Math.round(
    ((parsed.nitrogen.class === 'High' ? 3 : parsed.nitrogen.class === 'Medium' ? 2 : 1) +
     (parsed.phosphorus.class === 'High' ? 3 : parsed.phosphorus.class === 'Medium' ? 2 : 1) +
     (parsed.potassium.class === 'High' ? 3 : parsed.potassium.class === 'Medium' ? 2 : 1) +
     (parsed.organicCarbon.class === 'High' ? 3 : parsed.organicCarbon.class === 'Medium' ? 2 : 1) +
     (pHStatus === 'Normal' ? 3 : 1.5)) / 15 * 100
  );

  return {
    parsed,
    overallScore,
    pHStatus,
    deficiencies,
    isHealthy: deficiencies.length === 0 && pHStatus === 'Normal',
    recommendation: deficiencies.length > 0
      ? `Your soil is deficient in: ${deficiencies.join(', ')}. The AI Nutrient Planner will calculate exact corrective fertilizer quantities.`
      : 'Your soil nutrient profile is adequate. Standard maintenance doses recommended.'
  };
}
