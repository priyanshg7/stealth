// KisanMitra AI Multi-Signal Recommendation Engine
// Fuses Soil Health Card, IMD Weather, AGMARKNET Prices, ICAR/KVK data,
// farm profile, and farmer preferences into scored crop/variety recommendations

import { VARIETY_DATABASE, CROP_METADATA, getDiseasesForCrop } from '../data/cropIntelligence';
import { parseSoilData } from '../data/soilNutrientEngine';

// ── Scoring weight configuration ──────────────────────────────────────
const WEIGHTS = {
  soilCompatibility: 0.20,
  weatherSuitability: 0.20,
  marketProfitability: 0.20,
  irrigationMatch: 0.15,
  diseasePestRisk: 0.10,
  cropRotation: 0.10,
  farmerPreference: 0.05
};

/**
 * Generate ranked crop variety recommendations using multi-signal fusion
 *
 * @param {string} cropId - e.g. 'wheat', 'rice'
 * @param {Object} farm - Full farm object (soil, water, crop, area, state, district, etc.)
 * @param {Object} profile - Farmer profile (state, district, farming methods)
 * @param {Object} weatherData - From weatherService (current, forecast, rainfall)
 * @param {Array} mandiPrices - From mandiService (array of price records)
 * @returns {Array} Ranked varieties with scores, breakdowns, and explanations
 */
export function generateRecommendations(cropId, farm, profile, weatherData, mandiPrices) {
  const crop = (cropId || 'wheat').toLowerCase();
  const varieties = VARIETY_DATABASE[crop] || [];
  if (varieties.length === 0) return [];

  const farmState = farm?.state || profile?.state || 'Maharashtra';
  const soilData = parseSoilData(farm?.soil);
  const previousCrop = farm?.crop?.previousCrop?.toLowerCase() || '';
  const farmingType = farm?.crop?.farmingType?.toLowerCase() || 'conventional';
  const irrigationMethods = farm?.water?.irrigationMethods || [];
  const waterSources = farm?.water?.sources || [];
  const areaAcres = parseFloat(farm?.area) || 2;

  // Rainfall departure info
  const departureCode = weatherData?.rainfall?.departureCode || 'N';
  const departurePct = weatherData?.rainfall?.departurePercent || 0;
  const isDrought = departureCode === 'D' || departureCode === 'LD';
  const isExcessRain = departureCode === 'LE' || departureCode === 'E';

  // Current weather
  const currentHumidity = weatherData?.current?.humidityMorning || 60;
  const currentTemp = weatherData?.current?.temp || 30;
  const rainForecast = weatherData?.forecast?.[0]?.rainProbability || 0;

  // Average mandi modal price for this crop
  const avgModalPrice = mandiPrices && mandiPrices.length > 0
    ? Math.round(mandiPrices.reduce((s, r) => s + r.modalPrice, 0) / mandiPrices.length)
    : null;

  return varieties.map(variety => {
    const signals = {};
    const explanations = [];
    let dataCompleteness = 0;
    const totalSignals = 7;

    // ── Signal 1: Soil Compatibility (20%) ────────────────────────
    let soilScore = 50;
    if (soilData) {
      dataCompleteness++;
      const soilType = (farm?.soil?.type || '').toLowerCase();
      const matchesSoil = variety.suitableSoils.some(s => soilType.includes(s.toLowerCase()));
      soilScore = matchesSoil ? 85 : 45;

      // Nutrient match
      if (soilData.nitrogen.class === 'Low' && variety.nutrientRequirement.N > 100) {
        soilScore -= 15;
        explanations.push(`⚠️ Soil nitrogen is low but ${variety.name} needs high N (${variety.nutrientRequirement.N} kg/ha). Supplemental urea critical.`);
      } else if (soilData.nitrogen.class === 'High') {
        soilScore += 5;
      }

      if (soilData.pH.value < 6.0 || soilData.pH.value > 8.5) {
        soilScore -= 10;
        explanations.push(`⚠️ Soil pH ${soilData.pH.value} is outside optimal range. Consider soil amendment.`);
      }

      if (matchesSoil) {
        explanations.push(`✅ Your ${farm?.soil?.type || 'soil'} matches ${variety.name}'s ideal soil types (${variety.suitableSoils.join(', ')}).`);
      } else {
        explanations.push(`⚠️ ${variety.name} prefers ${variety.suitableSoils.join('/')} soil, but your farm has ${farm?.soil?.type || 'unspecified'} soil.`);
      }
    } else {
      explanations.push('ℹ️ No Soil Health Card data. Using general soil compatibility estimate.');
    }
    signals.soilCompatibility = { score: Math.max(10, Math.min(100, soilScore)), weight: WEIGHTS.soilCompatibility };

    // ── Signal 2: Weather Suitability (20%) ───────────────────────
    let weatherScore = 60;
    if (weatherData) {
      dataCompleteness++;

      // Drought adjustment
      if (isDrought) {
        if (variety.droughtTolerance >= 4) {
          weatherScore += 25;
          explanations.push(`🏆 Drought-resilient variety (tolerance: ${variety.droughtTolerance}/5). Ideal for current rainfall deficit (${departurePct}%).`);
        } else if (variety.waterRequirement > 800) {
          weatherScore -= 30;
          explanations.push(`⛔ High water demand (${variety.waterRequirement}mm) is risky with ${departurePct}% rainfall deficit. Consider drought-tolerant alternatives.`);
        }
      }

      // Excess rain adjustment
      if (isExcessRain) {
        if (variety.floodTolerance >= 3) {
          weatherScore += 15;
          explanations.push(`🌊 Good flood tolerance (${variety.floodTolerance}/5). Can handle the excess rainfall (+${departurePct}%).`);
        } else if (variety.floodTolerance <= 1) {
          weatherScore -= 20;
          explanations.push(`⚠️ Poor flood tolerance. Waterlogging risk is high with current excess rainfall.`);
        }
      }

      // Heat wave adjustment
      if (currentTemp > 38) {
        if (variety.heatTolerance >= 4) {
          weatherScore += 10;
          explanations.push(`🌡️ Heat tolerant (${variety.heatTolerance}/5). Performs well at current ${currentTemp}°C.`);
        } else {
          weatherScore -= 15;
          explanations.push(`⚠️ Current temperature ${currentTemp}°C may stress this variety (heat tolerance: ${variety.heatTolerance}/5).`);
        }
      }

      // Disease risk from humidity
      if (currentHumidity > 85 && variety.diseaseResistance < 3) {
        weatherScore -= 10;
        explanations.push(`🦠 High humidity (${currentHumidity}%) increases disease risk. This variety has moderate resistance (${variety.diseaseResistance}/5).`);
      }
    } else {
      explanations.push('ℹ️ No IMD weather data available. Using standard seasonal estimate.');
    }
    signals.weatherSuitability = { score: Math.max(10, Math.min(100, weatherScore)), weight: WEIGHTS.weatherSuitability };

    // ── Signal 3: Market Profitability (20%) ──────────────────────
    let marketScore = 55;
    let livePrice = variety.msp;
    let projectedRevenue = 0;
    let projectedProfit = 0;

    if (avgModalPrice && avgModalPrice > 0) {
      dataCompleteness++;
      livePrice = avgModalPrice;

      // Compare live price to MSP
      const premiumOverMsp = ((avgModalPrice - variety.msp) / variety.msp) * 100;
      if (premiumOverMsp > 10) {
        marketScore += 20;
        explanations.push(`💰 Live mandi price ₹${avgModalPrice}/Qtl is ${Math.round(premiumOverMsp)}% above MSP (₹${variety.msp}). Strong market demand.`);
      } else if (premiumOverMsp < -5) {
        marketScore -= 15;
        explanations.push(`📉 Live mandi price ₹${avgModalPrice}/Qtl is below MSP. Market is oversupplied.`);
      } else {
        explanations.push(`📊 Live mandi price ₹${avgModalPrice}/Qtl is close to MSP (₹${variety.msp}). Stable market.`);
      }
    } else {
      explanations.push(`ℹ️ No live AGMARKNET data. Using MSP ₹${variety.msp}/Qtl for profitability calculation.`);
    }

    // Calculate projections
    const yieldQtl = variety.yieldPotential * areaAcres;
    projectedRevenue = Math.round(yieldQtl * livePrice);
    const estimatedCost = Math.round(areaAcres * 12000); // Rough cost estimate
    projectedProfit = projectedRevenue - estimatedCost;

    if (variety.premiumGrade) {
      marketScore += 10;
      explanations.push(`⭐ Premium grade variety commands higher market value.`);
    }
    if (variety.exportDemand === 'Very High' || variety.exportDemand === 'High') {
      marketScore += 5;
      explanations.push(`🌍 Strong export demand (${variety.exportDemand}) provides price support.`);
    }

    signals.marketProfitability = { score: Math.max(10, Math.min(100, marketScore)), weight: WEIGHTS.marketProfitability };

    // ── Signal 4: Irrigation Match (15%) ──────────────────────────
    let irrigationScore = 60;
    dataCompleteness++;
    const hasReliableWater = waterSources.length > 0 && !waterSources.every(s => s === 'rain');
    const hasDrip = irrigationMethods.includes('drip') || irrigationMethods.includes('minidrip');

    if (variety.waterRequirement > 800 && !hasReliableWater) {
      irrigationScore -= 35;
      explanations.push(`⛔ ${variety.name} needs ${variety.waterRequirement}mm water but farm relies on rain-fed irrigation. High failure risk.`);
    } else if (variety.waterRequirement < 400 && hasReliableWater) {
      irrigationScore += 20;
      explanations.push(`💧 Low water demand (${variety.waterRequirement}mm) + reliable water source = excellent water efficiency.`);
    } else if (hasDrip) {
      irrigationScore += 10;
      explanations.push(`💧 Drip irrigation system will optimize water delivery for ${variety.irrigationCount} irrigation cycles.`);
    }

    signals.irrigationMatch = { score: Math.max(10, Math.min(100, irrigationScore)), weight: WEIGHTS.irrigationMatch };

    // ── Signal 5: Disease & Pest Risk (10%) ───────────────────────
    let diseaseScore = 70;
    dataCompleteness++;
    const diseases = getDiseasesForCrop(crop);
    const weatherTriggeredDiseases = diseases.filter(d => {
      if (d.riskFactor === 'humidity' && currentHumidity > d.humidityThreshold) return true;
      if (d.riskFactor === 'rain' && rainForecast > 60) return true;
      if (d.riskFactor === 'continuous_rain' && isExcessRain) return true;
      return false;
    });

    if (weatherTriggeredDiseases.length > 0) {
      if (variety.diseaseResistance >= 4) {
        diseaseScore += 15;
        explanations.push(`🛡️ Strong disease resistance (${variety.diseaseResistance}/5) protects against ${weatherTriggeredDiseases.length} weather-triggered threats.`);
      } else {
        diseaseScore -= (weatherTriggeredDiseases.length * 10);
        explanations.push(`🦠 ${weatherTriggeredDiseases.length} disease risks active (${weatherTriggeredDiseases.map(d => d.name).join(', ')}). This variety has moderate resistance.`);
      }
    } else {
      diseaseScore += 10;
    }

    signals.diseasePestRisk = { score: Math.max(10, Math.min(100, diseaseScore)), weight: WEIGHTS.diseasePestRisk };

    // ── Signal 6: Crop Rotation Bonus (10%) ───────────────────────
    let rotationScore = 60;
    dataCompleteness++;
    if (previousCrop && variety.cropRotationBonus) {
      const bonus = variety.cropRotationBonus[previousCrop] || 0;
      rotationScore += bonus;
      if (bonus > 0) {
        explanations.push(`🔄 Excellent rotation after ${previousCrop}. +${bonus} compatibility bonus (nutrient cycling and pest break).`);
      } else if (bonus < 0) {
        explanations.push(`⚠️ ${previousCrop} → ${crop} rotation has compatibility penalty (${bonus}). Nutrient depletion risk.`);
      }
    }
    signals.cropRotation = { score: Math.max(10, Math.min(100, rotationScore)), weight: WEIGHTS.cropRotation };

    // ── Signal 7: Farmer Preference (5%) ──────────────────────────
    let prefScore = 60;
    dataCompleteness++;

    // State suitability
    if (variety.suitableStates.includes(farmState)) {
      prefScore += 20;
      explanations.push(`📍 Officially recommended for ${farmState} by ${variety.institution}.`);
    } else {
      prefScore -= 10;
      explanations.push(`ℹ️ Not in the primary recommended zone for ${farmState}, but may still perform.`);
    }

    // Farming type
    if (farmingType === 'organic' && variety.organicAlternatives) {
      prefScore += 10;
    }

    signals.farmerPreference = { score: Math.max(10, Math.min(100, prefScore)), weight: WEIGHTS.farmerPreference };

    // ── Calculate weighted final score ────────────────────────────
    const finalScore = Math.round(
      Object.values(signals).reduce((sum, s) => sum + (s.score * s.weight), 0)
    );

    // Confidence level based on data completeness
    const confidenceRatio = dataCompleteness / totalSignals;
    const confidence = confidenceRatio >= 0.85 ? 'High' : (confidenceRatio >= 0.5 ? 'Medium' : 'Low');

    // Data sources used
    const dataSources = [];
    if (soilData) dataSources.push('Soil Health Card');
    if (weatherData) dataSources.push('IMD Weather');
    if (avgModalPrice) dataSources.push('AGMARKNET Prices');
    dataSources.push('ICAR/KVK Database');
    if (previousCrop) dataSources.push('Crop History');

    return {
      ...variety,
      suitabilityScore: finalScore,
      confidence,
      dataSources,
      signals,
      explanations,
      livePrice,
      projectedRevenue,
      projectedProfit,
      estimatedCost,
      profitScenarios: {
        optimistic: { revenue: Math.round(projectedRevenue * 1.15), profit: Math.round(projectedRevenue * 1.15 - estimatedCost) },
        expected: { revenue: projectedRevenue, profit: projectedProfit },
        worst: { revenue: Math.round(projectedRevenue * 0.75), profit: Math.round(projectedRevenue * 0.75 - estimatedCost) }
      },
      riskAssessment: {
        weather: isDrought ? 'High (Drought)' : (isExcessRain ? 'Medium (Excess Rain)' : 'Low'),
        market: !avgModalPrice ? 'Unknown (No live data)' : (marketScore < 50 ? 'High' : 'Low'),
        disease: weatherTriggeredDiseases.length > 2 ? 'High' : (weatherTriggeredDiseases.length > 0 ? 'Medium' : 'Low')
      }
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Generate a summary comparison table for multiple crops
 */
export function generateCropComparison(cropIds, farm, profile, weatherData, mandiPricesByCrop) {
  return cropIds.map(cropId => {
    const recs = generateRecommendations(cropId, farm, profile, weatherData, mandiPricesByCrop?.[cropId] || []);
    const topVariety = recs[0];
    return {
      cropId,
      cropName: CROP_METADATA[cropId]?.season ? `${cropId.charAt(0).toUpperCase() + cropId.slice(1)} (${CROP_METADATA[cropId].season})` : cropId,
      topVariety: topVariety?.name || 'N/A',
      topScore: topVariety?.suitabilityScore || 0,
      topConfidence: topVariety?.confidence || 'Low',
      livePrice: topVariety?.livePrice || 0,
      projectedProfit: topVariety?.projectedProfit || 0,
      weatherRisk: topVariety?.riskAssessment?.weather || 'Unknown',
      varieties: recs
    };
  }).sort((a, b) => b.topScore - a.topScore);
}

// ── Gemini API Integration ───────────────────────────────────────────
export const GEMINI_API_KEY = "AQ.Ab8RN6KTwDMI44Z6rXa6oTq6aeVFloKdC2L1thkHZnLFyD0oCA";

/**
 * Robustly calls Gemini API for agricultural recommendations.
 * Falls back to local database when quota is exceeded or offline.
 */
export async function getGeminiVarieties(season, state, soil, water) {
  try {
    const prompt = `You are a crop scientist. For a farm in state: "${state}", with soil: "${soil}", water sources: "${water}", and season: "${season}", suggest 3 best crop varieties. Return ONLY a JSON array of 3 objects with keys: name, description, duration (in days), yield (in Qtl/Acre), price (in Rs/Qtl). Keep descriptions brief.`;
    
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text);
      }
    }
  } catch (e) {
    console.warn("[Gemini API] Failed or Quota Exceeded. Falling back to local ICAR database:", e.message);
  }
  return null;
}

