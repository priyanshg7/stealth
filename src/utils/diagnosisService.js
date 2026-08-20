// KisanMitra Disease Diagnosis Service
// Connects to local host ML backend pipeline (http://localhost:8000/api/v1/diagnosis/predict)

const ML_BACKEND_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000/api/v1/diagnosis/predict';

/**
 * Formats disease string like "Potato___Early_blight" -> "Potato Early Blight"
 */
function formatDiseaseName(name) {
  if (!name) return "Unknown Crop Condition";
  return name.replace(/___/g, " - ").replace(/_/g, " ");
}

/**
 * Transforms local ML Pipeline response into the structured format required by DiseaseDiagnosis.jsx
 */
function transformMLResponseToUI(mlResponse, farmDetails = {}) {
  const crop = farmDetails.crop || "Crop";
  const areaAcres = farmDetails.areaAcres || 1;
  const location = farmDetails.location || "Pratapgarh, Rajasthan";

  const rawDisease = mlResponse.prediction || "healthy";
  const diseaseName = formatDiseaseName(rawDisease);
  const confidencePercent = Math.round((mlResponse.confidence || 0.95) * 100);
  const confidenceText = confidencePercent >= 80 ? "High" : confidencePercent >= 50 ? "Medium" : "Low";

  const diseaseInfo = mlResponse.disease_info || {};
  const weatherSummary = mlResponse.weather_summary || {};
  const treatmentOpts = mlResponse.treatment_options || {};
  const dosage = mlResponse.dosage || {};
  const plannerTasks = mlResponse.planner_tasks || [];
  const decisions = mlResponse.decision_recommendations || [];

  // Build Inorganic Treatments
  const inorganicCures = diseaseInfo.treatment_plan?.inorganic_cure || [];
  const inorganicTreatments = inorganicCures.length > 0
    ? inorganicCures.map(c => ({
        productName: c.name || "Propiconazole 25% EC",
        activeIngredient: c.name || "Propiconazole",
        purpose: c.application || "Systemic fungicide for leaf spot and rust control.",
        whyRecommended: c.application || "Effective chemical control recommended by local agricultural guidelines.",
        dosagePerAcre: dosage.medicine_quantity_liters ? `${dosage.medicine_quantity_liters} L / Acre` : "250 ml / Acre",
        dosagePerLitreWater: "1 ml / Litre water",
        totalQuantityForFarm: dosage.medicine_quantity_liters ? `${(dosage.medicine_quantity_liters * areaAcres).toFixed(2)} Litres total` : `${areaAcres * 250} ml total`,
        applicationMethod: c.application || "Foliar Spray using knapsack sprayer",
        bestTiming: "Early morning or late evening",
        numberOfApplications: "2 Applications",
        interval: dosage.recommended_spray_interval_days ? `${dosage.recommended_spray_interval_days} days` : "10-14 days",
        precautions: ["Wear protective equipment (gloves, mask)", "Do not spray against the wind direction"],
        safetyEquipment: ["Face Mask", "Rubber Gloves", "Protective Goggles"],
        preHarvestInterval: "14 days",
        irrigationConsiderations: "Avoid overhead irrigation for 24 hours post application",
        compatibility: "Compatible with standard micronutrient foliar sprays",
        warnings: c.warning ? [c.warning] : ["Keep away from children and water bodies."]
      }))
    : [
        {
          productName: treatmentOpts.balanced?.medicine || "Propiconazole 25% EC",
          activeIngredient: "Propiconazole",
          purpose: "Foliar disease control and pathogen mitigation.",
          whyRecommended: "Balanced cost-effectiveness and high efficacy for local crop diseases.",
          dosagePerAcre: "250 ml / Acre",
          dosagePerLitreWater: "1 ml / Litre water",
          totalQuantityForFarm: `${(250 * areaAcres).toFixed(0)} ml total`,
          applicationMethod: "Foliar Spray",
          bestTiming: "Early morning or late evening",
          numberOfApplications: "2 Applications",
          interval: "10-14 days",
          precautions: ["Wear protective mask and gloves"],
          safetyEquipment: ["Mask", "Gloves"],
          preHarvestInterval: "14 days",
          irrigationConsiderations: "Do not irrigate immediately after spraying",
          compatibility: "Compatible with most pesticides",
          warnings: ["Store in a cool, dry place"]
        }
      ];

  // Build Organic Treatments
  const organicCures = diseaseInfo.treatment_plan?.organic_cure || [];
  const organicTreatments = organicCures.length > 0
    ? organicCures.map(c => ({
        productName: c.name || "Neem Oil 10000 ppm",
        activeIngredient: c.name || "Azadirachtin",
        purpose: c.application || "Natural bio-pesticide and repellent.",
        whyRecommended: "Safe, organic botanical extract that disrupts pest & fungal spore development.",
        dosagePerAcre: "500 ml / Acre",
        dosagePerLitreWater: "3-5 ml / Litre water",
        totalQuantityForFarm: `${(500 * areaAcres).toFixed(0)} ml total`,
        applicationMethod: "Foliar Spray",
        bestTiming: "Late evening",
        numberOfApplications: "3 Applications",
        interval: "7 days",
        precautions: ["Mix with emulsifier (soap solution) for best results"],
        safetyEquipment: ["Basic Mask", "Gloves"],
        preHarvestInterval: "3 days",
        irrigationConsiderations: "Safe for regular irrigation schedules",
        compatibility: "Do not mix with sulfur-based fungicides",
        warnings: c.warning ? [c.warning] : ["Do not apply in intense direct sunlight."]
      }))
    : [
        {
          productName: "Neem Oil (Azadirachtin 10000 ppm)",
          activeIngredient: "Azadirachtin",
          purpose: "Bio-fungicide and natural pest repellent",
          whyRecommended: "Eco-friendly protection with zero chemical residue",
          dosagePerAcre: "500 ml / Acre",
          dosagePerLitreWater: "3 ml / Litre water",
          totalQuantityForFarm: `${(500 * areaAcres).toFixed(0)} ml total`,
          applicationMethod: "Foliar Spray",
          bestTiming: "Late evening",
          numberOfApplications: "3 Applications",
          interval: "7 days",
          precautions: ["Ensure complete foliage coverage including leaf undersides"],
          safetyEquipment: ["Gloves"],
          preHarvestInterval: "1 day",
          irrigationConsiderations: "No irrigation restriction",
          compatibility: "Compatible with organic bio-fertilizers",
          warnings: ["Keep in dark storage to prevent photodegradation"]
        }
      ];

  // Build Action Timeline Schedule
  const schedule = plannerTasks.length > 0
    ? plannerTasks.map(t => ({
        stage: t.category || "Action Step",
        activity: `${t.task} (${t.reason || 'Follow agronomic guidelines'})`,
        estimatedDate: t.recommended_date || "Day 1",
        priorityLevel: t.priority || "High"
      }))
    : (diseaseInfo.treatment_schedule || []).map((s, idx) => ({
        stage: s.week || `Phase ${idx + 1}`,
        activity: s.activity,
        estimatedDate: s.week || `Day ${idx * 7 + 1}`,
        priorityLevel: idx === 0 ? "High" : "Medium"
      }));

  if (schedule.length === 0) {
    schedule.push(
      { stage: "Immediate Action", activity: `Apply recommended treatment for ${diseaseName}`, estimatedDate: "Today", priorityLevel: "High" },
      { stage: "Follow-up", activity: "Inspect plant foliage for fresh regrowth and spore reduction", estimatedDate: "Day 7", priorityLevel: "Medium" }
    );
  }

  // Primary Immediate Action
  const immediateAction = decisions[0]?.decision 
    || plannerTasks[0]?.task 
    || `Apply targeted treatment for ${diseaseName} and monitor weather suitability.`;

  return {
    diagnosisSummary: {
      diseaseName: diseaseName,
      confidence: confidenceText,
      severity: weatherSummary.disease_spread_risk || "Moderate",
      immediateAction: immediateAction,
      canRecover: `Yes, expected recovery in ${mlResponse.case_details?.recovery_timeline_days || 10} days`
    },
    diseaseProfile: {
      scientificName: rawDisease.replace(/___/g, " "),
      category: rawDisease.toLowerCase().includes("healthy") ? "Healthy Plant" : "Fungal / Pathogen",
      affectedCropStage: "Vegetative / Flowering",
      likelyCauses: weatherSummary.disease_spread_risk ? `Favorable weather conditions (${weatherSummary.temperature_c}°C, ${weatherSummary.humidity_percent}% humidity)` : "Fungal spore infection & humidity",
      environmentalConditions: `${weatherSummary.temperature_c || 28}°C, ${weatherSummary.humidity_percent || 65}% humidity`,
      spreadMethod: "Airborne spores & water droplets",
      earlySymptoms: diseaseInfo.key_symptoms || ["Small yellow/brown spots on lower leaves", "Mild leaf curling", "Marginal chlorosis"],
      advancedSymptoms: ["Dark necrotic lesions with concentric rings", "Premature defoliation", "Stunted stem growth"],
      affectedParts: "Leaves, Stems",
      economicImpact: treatmentOpts.economy ? `Controlled risk with estimated treatment cost of ~$${treatmentOpts.economy.cost_usd}.` : "Moderate risk of yield reduction if untreated.",
      expectedYieldLoss: rawDisease.toLowerCase().includes("healthy") ? "0%" : "15% - 30%",
      recoveryExpectations: "Excellent response with timely treatment application"
    },
    treatments: {
      inorganic: inorganicTreatments,
      organic: organicTreatments
    },
    schedule: schedule,
    riskAssessment: {
      weatherImpact: weatherSummary.disease_spread_risk || "High humidity favors spore germination and disease spread",
      shouldMonitor: true,
      explanation: `Current weather parameters at ${location}: Temp ${weatherSummary.temperature_c || 28}°C, Humidity ${weatherSummary.humidity_percent || 65}%. Spray suitability is rated as ${weatherSummary.spray_suitability || 'Favorable'}.`
    },
    preventionAndBestPractices: [
      { title: "Crop Rotation", description: "Rotate with non-host crops (e.g. legumes or maize) in alternate seasons to break disease cycles." },
      { title: "Field Hygiene & Sanitation", description: "Remove and safely destroy infected leaf debris after harvest to reduce overwintering spore loads." },
      { title: "Balanced Irrigation", description: "Use drip irrigation instead of overhead sprinklers to keep leaf canopy dry." }
    ]
  };
}

/**
 * Diagnoses crop disease using local ML backend pipeline.
 * 
 * @param {File} imageFile - The uploaded leaf/crop image.
 * @param {Object} farmDetails - Metadata about the farm and crop.
 * @returns {Promise<Object>} The structured treatment plan JSON for DiseaseDiagnosis.jsx.
 */
export async function diagnoseDisease(imageFile, farmDetails = {}) {
  const { crop, location, farm_id } = farmDetails;

  const formData = new FormData();
  formData.append('image', imageFile);
  if (crop) formData.append('crop', crop);
  if (location) formData.append('location', location);
  if (farm_id) formData.append('farm_id', farm_id);

  try {
    const response = await fetch(ML_BACKEND_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Local ML Backend error (HTTP ${response.status})`);
    }

    const mlResponse = await response.json();
    return transformMLResponseToUI(mlResponse, farmDetails);
  } catch (err) {
    console.error("[Diagnosis Service] Error connecting to ML backend:", err);
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error(
        "Cannot reach local ML backend server. Please run 'start_ml_backend.bat' to launch the backend API at http://localhost:8000."
      );
    }
    throw err;
  }
}

