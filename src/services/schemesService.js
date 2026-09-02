/**
 * KisanMitra Government Schemes Evaluation & Search Engine
 * Evaluates scheme eligibility, state matching, document requirements, and intent parsing.
 */

const STATES_OF_INDIA = [
  { name: 'Maharashtra', keywords: ['maharashtra', 'm.h.', 'mh '] },
  { name: 'Rajasthan', keywords: ['rajasthan', 'raj.'] },
  { name: 'Madhya Pradesh', keywords: ['madhya pradesh', 'm.p.', 'mp '] },
  { name: 'Chhattisgarh', keywords: ['chhattisgarh', 'c.g.'] },
  { name: 'Andhra Pradesh', keywords: ['andhra pradesh', 'a.p.', 'ap '] },
  { name: 'Karnataka', keywords: ['karnataka', 'kar.'] },
  { name: 'West Bengal', keywords: ['west bengal', 'w.b.', 'wb '] },
  { name: 'Puducherry', keywords: ['puducherry', 'pondicherry'] },
  { name: 'Gujarat', keywords: ['gujarat', 'guj.'] },
  { name: 'Tamil Nadu', keywords: ['tamil nadu', 't.n.', 'tn '] },
  { name: 'Uttar Pradesh', keywords: ['uttar pradesh', 'u.p.', 'up '] },
  { name: 'Punjab', keywords: ['punjab', 'pb '] },
  { name: 'Haryana', keywords: ['haryana', 'hr '] },
  { name: 'Bihar', keywords: ['bihar'] }
];

export function evaluateSchemeEligibility(scheme, profile = {}, farm = {}) {
  let schemeState = null;
  if (scheme.level === 'State') {
    const textToSearch = (scheme.name + ' ' + scheme.details + ' ' + scheme.eligibility + ' ' + (scheme.slug || '')).toLowerCase();
    for (const stateObj of STATES_OF_INDIA) {
      if (stateObj.keywords.some(kw => textToSearch.includes(kw))) {
        schemeState = stateObj.name;
        break;
      }
    }
  }

  const farmerState = farm?.state || profile?.state || '';
  const farmerCrop = farm?.crop?.name || '';
  const farmerArea = parseFloat(farm?.area) || 0;
  const farmerGender = profile?.gender || '';
  const irrigationMethods = farm?.water?.irrigationMethods || [];
  const pumpType = farm?.water?.pumpType || '';
  const farmingMethods = profile?.farmingMethod || farm?.crop?.farmingType || [];

  let status = 'Likely Eligible';
  let score = 40;
  const reasons = [];
  const missingInfo = [];

  // 1. Location Check
  if (scheme.level === 'State' && schemeState) {
    if (farmerState && schemeState.toLowerCase() !== farmerState.toLowerCase()) {
      return {
        status: 'Not Eligible',
        score: 0,
        explanation: `Only for residents of ${schemeState}. Your active farm is in ${farmerState}.`,
        missingInfo: [],
        schemeState
      };
    } else {
      score += 20;
      reasons.push(`It is a State scheme of ${schemeState}, matching your location.`);
    }
  } else {
    reasons.push("It is a Central scheme open to all states.");
  }

  // 2. Crop matching
  const textToMatch = (scheme.name + ' ' + scheme.details + ' ' + scheme.eligibility + ' ' + (scheme.tags || '') + ' ' + scheme.category).toLowerCase();
  
  if (farmerCrop) {
    const cropKeywords = {
      wheat: ['wheat', 'gehun', 'rabi'],
      rice: ['rice', 'paddy', 'dhan', 'kharif'],
      sugarcane: ['sugarcane', 'cane', 'ganna'],
      cotton: ['cotton', 'kapas'],
      soybean: ['soybean', 'soya'],
      maize: ['maize', 'makka'],
      tomato: ['tomato', 'tamatar', 'vegetable', 'horticulture'],
      chilli: ['chilli', 'mirch', 'spice', 'horticulture']
    };
    const keywords = cropKeywords[farmerCrop.toLowerCase()] || [farmerCrop.toLowerCase()];
    const matchesCrop = keywords.some(kw => textToMatch.includes(kw));
    if (matchesCrop) {
      score += 30;
      reasons.push(`Tailored for your crop: ${farmerCrop}.`);
    }
  }

  // 3. Landholding Matching
  const smallFarmerKeywords = ['small farmer', 'marginal', 'small and marginal', '2 hectare', '5 acre', 'landless', 'unregistered laborer'];
  const isSmallFarmerScheme = smallFarmerKeywords.some(kw => textToMatch.includes(kw));
  
  if (isSmallFarmerScheme) {
    if (farmerArea > 0) {
      if (farmerArea <= 5) {
        score += 25;
        reasons.push("Matches small/marginal landholding (under 5 acres).");
        status = 'Eligible';
      } else {
        return {
          status: 'Not Eligible',
          score: 10,
          explanation: `This scheme is targeted at small/marginal farmers. Your farm size is ${farmerArea} acres.`,
          missingInfo: [],
          schemeState
        };
      }
    } else {
      missingInfo.push("Land Ownership records");
      status = 'Need More Information';
    }
  }

  // 4. Irrigation/Water matching
  const dripKeywords = ['drip', 'micro-irrigation', 'sprinkler', 'micro irrigation', 'water saving'];
  const matchesDrip = dripKeywords.some(kw => textToMatch.includes(kw));
  if (matchesDrip) {
    if (irrigationMethods.includes('drip') || irrigationMethods.includes('sprinkler')) {
      score += 25;
      reasons.push("Matches your drip/sprinkler irrigation system.");
      status = 'Eligible';
    } else {
      score += 5;
    }
  }

  const solarKeywords = ['solar pump', 'kusum', 'solar water pump', 'solar power', 'renewable pump'];
  const matchesSolar = solarKeywords.some(kw => textToMatch.includes(kw));
  if (matchesSolar) {
    if (pumpType.toLowerCase().includes('solar')) {
      score += 30;
      reasons.push("Matches your Solar Pump.");
      status = 'Eligible';
    } else {
      score += 10;
    }
  }

  // 5. Farming method (Organic)
  const organicKeywords = ['organic', 'compost', 'jaivik', 'natural farming', 'chemical free'];
  const matchesOrganic = organicKeywords.some(kw => textToMatch.includes(kw));
  if (matchesOrganic) {
    const isOrganic = farmingMethods.includes('Organic') || farmingMethods.includes('organic') || farm?.crop?.farmingType?.toLowerCase() === 'organic';
    if (isOrganic) {
      score += 30;
      reasons.push("Matches your Organic Farming profile.");
      status = 'Eligible';
    } else {
      score += 5;
    }
  }

  // 6. Gender matching
  const womenKeywords = ['women', 'female', 'mahila', 'girl', 'widow', 'daughter'];
  const isWomenScheme = womenKeywords.some(kw => textToMatch.includes(kw));
  if (isWomenScheme) {
    if (farmerGender) {
      if (farmerGender.toLowerCase() === 'female') {
        score += 35;
        reasons.push("Special priority for Women Farmers.");
        status = 'Eligible';
      } else {
        return {
          status: 'Not Eligible',
          score: 5,
          explanation: "This scheme is exclusively or primarily for women farmers.",
          missingInfo: [],
          schemeState
        };
      }
    } else {
      missingInfo.push("Gender Details");
      status = 'Need More Information';
    }
  }

  // Document Verification
  const requiredDocsText = (scheme.documents || '').toLowerCase();
  if (requiredDocsText.includes('aadhaar')) {
    if (!profile.governmentId || !profile.governmentId.toUpperCase().includes('AADHAAR')) {
      missingInfo.push('Aadhaar Card');
    }
  }
  if (requiredDocsText.includes('soil')) {
    if (!farm?.soil?.source || farm.soil.source !== 'card') {
      missingInfo.push('Soil Health Card');
    }
  }
  if (requiredDocsText.includes('bank')) {
    if (!profile.governmentId) {
      missingInfo.push('Bank Account Verification');
    }
  }
  if (requiredDocsText.includes('caste') || requiredDocsText.includes('sc/st')) {
    missingInfo.push('Caste Certificate');
  }
  if (requiredDocsText.includes('income')) {
    missingInfo.push('Income Certificate');
  }

  if (missingInfo.length > 0 && status !== 'Not Eligible') {
    status = 'Need More Information';
  }

  score = Math.max(15, Math.min(98, score));

  let explanation = '';
  if (reasons.length > 0) {
    const cropText = farmerCrop ? `cultivate ${farmerCrop} in ${farmerState || 'India'}` : `farm in ${farmerState || 'India'}`;
    const sizeText = farmerArea ? `own ${farmerArea} acres` : '';
    explanation = `Recommended because you ${cropText}`;
    if (sizeText) explanation += `, ${sizeText}`;
    explanation += `. It matches your profile details.`;
  } else {
    explanation = "Recommended based on general Central and State farming benefit programs.";
  }

  return {
    status,
    score,
    explanation,
    missingInfo,
    schemeState
  };
}

export function parseSchemeDocs(scheme) {
  const rawDocs = scheme.documents || '';
  if (!rawDocs) return [];
  
  return rawDocs
    .split(/[.\n•]/)
    .map(d => d.trim())
    .filter(d => d.length > 4 && !d.toLowerCase().includes('feedback form') && !d.toLowerCase().includes('proceedings'));
}

export function calculateDocProgress(scheme, docChecklist = {}) {
  const docs = parseSchemeDocs(scheme);
  if (docs.length === 0) return { total: 0, checked: 0, percent: 100 };
  
  const slug = scheme.slug || scheme.name;
  const checkedList = docChecklist[slug] || {};
  let checkedCount = 0;
  
  docs.forEach(doc => {
    if (checkedList[doc]) checkedCount++;
  });
  
  return {
    total: docs.length,
    checked: checkedCount,
    percent: Math.round((checkedCount / docs.length) * 100)
  };
}

export function extractSearchFilters(query = '') {
  const q = query.toLowerCase();
  const extracted = { keywords: [] };
  
  if (q.includes('wheat') || q.includes('gehun') || q.includes('gehu')) {
    extracted.crop = 'Wheat';
    extracted.category = 'Agriculture';
  }
  if (q.includes('rice') || q.includes('paddy') || q.includes('dhan')) {
    extracted.crop = 'Rice';
    extracted.category = 'Agriculture';
  }
  if (q.includes('sugarcane') || q.includes('ganna') || q.includes('cane')) {
    extracted.crop = 'Sugarcane';
    extracted.category = 'Agriculture';
  }
  if (q.includes('irrigation') || q.includes('drip') || q.includes('sprinkler') || q.includes('water') || q.includes('pump') || q.includes('solar pump')) {
    extracted.category = 'Rural & Environment';
    if (q.includes('solar') || q.includes('kusum')) extracted.keywords.push('solar', 'pump', 'kusum');
  }
  if (q.includes('insurance') || q.includes('crop insurance') || q.includes('pmfby') || q.includes('loss') || q.includes('claim')) {
    extracted.category = 'Financial Services and Insurance';
    extracted.keywords.push('insurance', 'fasal', 'bima');
  }
  if (q.includes('tractor') || q.includes('machinery') || q.includes('tiller') || q.includes('rotavator') || q.includes('implement')) {
    extracted.keywords.push('tractor', 'machinery', 'implement', 'tiller', 'rotavator');
  }
  if (q.includes('organic') || q.includes('compost') || q.includes('natural') || q.includes('jaivik')) {
    extracted.keywords.push('organic', 'natural farming', 'compost', 'jaivik');
  }
  if (q.includes('women') || q.includes('female') || q.includes('mahila') || q.includes('girl')) {
    extracted.keywords.push('women', 'female', 'mahila', 'girl');
  }
  if (q.includes('pm kisan') || q.includes('pm-kisan') || q.includes('samman nidhi')) {
    extracted.keywords.push('pm-kisan', 'samman', 'nidhi');
  }

  return extracted;
}
