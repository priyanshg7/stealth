// KisanMitra Disease Diagnosis Service
// Abstracts the underlying AI model (Gemini Vision) for diagnosing crop diseases from images.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Converts a File object to a Base64 string for API transmission.
 * @param {File} file 
 * @returns {Promise<string>} Base64 data string (without the data:image prefix)
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // FileReader result includes 'data:image/jpeg;base64,...'
      const result = reader.result;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Strips markdown codeblock markers (e.g. ```json) to ensure clean JSON parsing.
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```\s*$/i, '');
  return cleaned.trim();
}

/**
 * Diagnoses a crop disease using a multimodal AI model and returns a comprehensive treatment plan.
 * 
 * @param {File} imageFile - The uploaded leaf/crop image.
 * @param {Object} farmDetails - Metadata about the farm and crop.
 * @param {string} farmDetails.crop - Name of the crop (e.g. "Wheat").
 * @param {number} farmDetails.areaAcres - Area of the farm in acres.
 * @param {string} farmDetails.location - Farm location.
 * @param {Object} farmDetails.weather - Current weather data.
 * @returns {Promise<Object>} The structured treatment plan JSON.
 */
export async function diagnoseDisease(imageFile, farmDetails) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const { crop, areaAcres, location, weather } = farmDetails;
  
  // Extract weather details safely
  const temp = weather?.current?.temp || 30;
  const humidity = weather?.current?.humidityMorning || 60;
  const rainProb = weather?.forecast?.[0]?.rainProbability || 0;

  // Convert the image file
  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  // Construct the highly detailed prompt
  const prompt = `You are an expert plant pathologist and agronomist in India. 
Please analyze the attached image of a crop leaf/plant.

The farmer is growing "${crop}" in "${location}" on a farm of size ${areaAcres} Acres.
Current weather conditions: ${temp}°C, ${humidity}% humidity, ${rainProb}% rain probability.

First, identify the crop (if identifiable) and diagnose the primary disease or pest issue shown in the image. 
If the image is not a plant, or no disease is found, state that clearly in the summary.

Second, create a highly detailed, scientific, and farm-specific treatment plan.
For all treatments (organic and inorganic), calculate the EXACT ESTIMATED QUANTITIES required for a ${areaAcres} Acre farm (e.g., product quantity, water quantity, number of spray tanks).

Return ONLY a raw JSON object with these exact keys. Do NOT include markdown blocks like \`\`\`json.
- "diagnosisSummary": object with keys: "diseaseName" (the detected disease), "confidence" ("High"/"Medium"/"Low"), "severity" ("Low"/"Moderate"/"Severe"/"Critical"), "immediateAction" (1 short sentence), "canRecover" (short string like "Yes, with timely action").
- "diseaseProfile": object with keys: "scientificName", "category" (e.g. "Fungal", "Bacterial", "Pest"), "affectedCropStage", "likelyCauses", "environmentalConditions", "spreadMethod", "earlySymptoms" (array of strings), "advancedSymptoms" (array of strings), "affectedParts", "economicImpact", "expectedYieldLoss", "recoveryExpectations".
- "treatments": object with keys "inorganic" and "organic". Each is an array of treatment objects (provide at least 1-2 per category). Each treatment object MUST have keys:
    - "productName": string (e.g. "Propiconazole 25% EC", "Neem Oil 10000 ppm").
    - "activeIngredient": string.
    - "purpose": string.
    - "whyRecommended": string.
    - "dosagePerAcre": string.
    - "dosagePerLitreWater": string (if applicable).
    - "totalQuantityForFarm": string (calculated for ${areaAcres} acres).
    - "applicationMethod": string.
    - "bestTiming": string (e.g. "Early morning or late evening").
    - "numberOfApplications": string.
    - "interval": string (e.g. "10-15 days").
    - "precautions": array of strings.
    - "safetyEquipment": array of strings.
    - "preHarvestInterval": string.
    - "irrigationConsiderations": string.
    - "compatibility": string.
    - "warnings": array of strings.
- "schedule": an array of 4-6 objects representing the timeline. Each object must have keys: "stage" (e.g. "Immediate Action", "Follow-up", "Preventive"), "activity" (detailed explanation), "estimatedDate" (e.g. "Today", "Day 3", "Day 10"), "priorityLevel" ("High", "Medium", "Low").
- "riskAssessment": object with keys: "weatherImpact" (e.g. "High humidity favors spread"), "shouldMonitor" (boolean), "explanation" (detailed string analyzing current temp/humidity vs disease).
- "preventionAndBestPractices": array of objects, each with "title" (e.g. "Crop Rotation") and "description" (detailed string).`;

  let url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const headers = {
    'Content-Type': 'application/json'
  };

  if (GEMINI_API_KEY.startsWith('AIza')) {
    url += `?key=${GEMINI_API_KEY}`;
  } else {
    // Treat as OAuth token
    headers['Authorization'] = `Bearer ${GEMINI_API_KEY}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API failed with status: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("No valid response from Gemini API.");
    }

    return JSON.parse(cleanJsonResponse(responseText));
  } catch (err) {
    console.error("[Diagnosis Service] Error calling multimodal AI:", err);
    throw err;
  }
}
