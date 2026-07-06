import { getDiseasesForCrop } from '../data/cropIntelligence';

// Unified Crop Lifecycle Stages by Days After Sowing (DAS)
export const CROP_STAGES = [
  { name: 'Preparation', minDas: -15, maxDas: -1 },
  { name: 'Sowing & Germination', minDas: 0, maxDas: 10 },
  { name: 'Seedling Stage', minDas: 11, maxDas: 25 },
  { name: 'Active Vegetative', minDas: 26, maxDas: 55 },
  { name: 'Flowering Stage', minDas: 56, maxDas: 80 },
  { name: 'Grain Filling / Maturity', minDas: 81, maxDas: 105 },
  { name: 'Harvesting', minDas: 106, maxDas: 120 },
  { name: 'Post-Harvest & Storage', minDas: 121, maxDas: 180 }
];

// Helper: Calculate stage based on DAS
export function getCropStageByDas(das, totalDuration = 120) {
  const adjustedStages = CROP_STAGES.map(stage => {
    // scale harvest and post-harvest to variety duration
    if (stage.name === 'Harvesting') {
      return { ...stage, minDas: totalDuration - 14, maxDas: totalDuration };
    }
    if (stage.name === 'Post-Harvest & Storage') {
      return { ...stage, minDas: totalDuration + 1, maxDas: totalDuration + 60 };
    }
    if (stage.name === 'Grain Filling / Maturity') {
      return { ...stage, maxDas: totalDuration - 15 };
    }
    return stage;
  });

  const matched = adjustedStages.find(s => das >= s.minDas && das <= s.maxDas);
  return matched ? matched.name : 'Active Growth';
}

// Add days helper
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Generates a complete agricultural task list with concrete calendar dates.
 * Preserves already completed tasks if a schedule is regenerated.
 */
export function generateCropSchedule({
  cropName,
  varietyName,
  sowingDate,
  area,
  irrigationMethods = [],
  farmingMethod = 'Conventional',
  durationDays = 120,
  existingTasks = []
}) {
  const baseCrop = cropName.toLowerCase();
  const calculatedArea = parseFloat(area) || 2.5;
  const isOrganic = farmingMethod.toLowerCase() === 'organic';
  const isRainfed = irrigationMethods.includes('rainfed') && irrigationMethods.length === 1;

  // Build key-value map of existing completed tasks to preserve history
  const completedTasksMap = {};
  existingTasks.forEach(t => {
    if (t.status === 'completed') {
      // Key by task identifier (category + relative DAS) to re-map back
      const key = `${t.category}-${t.das}`;
      completedTasksMap[key] = {
        status: 'completed',
        completedAt: t.completedAt,
        date: t.date,
        rescheduledDate: t.rescheduledDate
      };
    }
  });

  const taskTemplates = [
    {
      das: -10,
      title: 'Primary Land Ploughing & Organic Manure Incorporation',
      category: 'Land Prep',
      priority: 'High',
      time: '07:00 AM',
      duration: '3 hours',
      why: 'Prepares soil structure, improves aeration, and embeds baseline organic compost.',
      benefit: 'Increases soil organic carbon and drainage capability.',
      resources: 'Tractor with disc harrow, 2-3 trolleys of Farm Yard Manure (FYM) per acre.'
    },
    {
      das: -1,
      title: 'Seed Fungicide & Bio-agent Treatment',
      category: 'Sowing Prep',
      priority: 'High',
      time: '09:00 AM',
      duration: '1 hour',
      why: 'Coating seeds protects them from soil-borne and seed-borne fungal infections.',
      benefit: 'Boosts early seed germination rate by 15-20%.',
      resources: isOrganic ? 'Trichoderma Viride (10g/kg seed), plastic sheet' : 'Carbendazim fungicide (2g/kg seed), gloves'
    },
    {
      das: 0,
      title: `Crop Sowing / Planting (${varietyName})`,
      category: 'Sowing',
      priority: 'High',
      time: '08:00 AM',
      duration: '4 hours',
      why: 'Sowing seeds at uniform depth and line-to-line spacing.',
      benefit: 'Achieves optimum plant population and clean canopy development.',
      resources: `Healthy treated seeds of ${varietyName}, seed drill / labor.`
    },
    {
      das: 3,
      title: 'Light Irrigation Event (Germination trigger)',
      category: 'Irrigation',
      priority: 'Medium',
      time: '07:30 AM',
      duration: '2 hours',
      why: 'Ensures seedbed is moist to initiate germination process.',
      benefit: 'Promotes rapid and uniform seedling emergence.',
      resources: 'Irrigation water supply.',
      skipIf: isRainfed
    },
    {
      das: 15,
      title: 'Pre-emergence Weed Management & Inspection',
      category: 'Weed Control',
      priority: 'Medium',
      time: '08:30 AM',
      duration: '2 hours',
      why: 'Controls weed seeds before they grow and choke early crops.',
      benefit: 'Prevents nutrient robbery by weeds, securing early crop growth.',
      resources: isOrganic ? 'Manual hoeing/weeding tools' : 'Pendimethalin herbicide spray, safety gear'
    },
    {
      das: 21,
      title: 'First Nitrogen / Fertilizer Top-dressing',
      category: 'Fertilization',
      priority: 'High',
      time: '07:30 AM',
      duration: '1.5 hours',
      why: 'Seedling stage requires high Nitrogen for leaf and stem formation.',
      benefit: 'Stimulates robust green vegetative shoot growth.',
      resources: isOrganic ? 'Neem cake (150 kg/acre) or vermicompost' : 'Urea (45 kg/acre) top-dressing'
    },
    {
      das: 25,
      title: 'Secondary Irrigation Cycle',
      category: 'Irrigation',
      priority: 'Medium',
      time: '08:00 AM',
      duration: '2 hours',
      why: 'Replenishes soil moisture after early growth surge.',
      benefit: 'Maintains leaf turgidity and active photosynthesis.',
      resources: 'Water pump active.',
      skipIf: isRainfed
    },
    {
      das: 35,
      title: 'Pest Scouting & Preventive Neem Spray',
      category: 'Pest Management',
      priority: 'Medium',
      time: '09:00 AM',
      duration: '2 hours',
      why: 'Inspect crop leaves for early insects and apply repellent.',
      benefit: 'Natural barrier prevents pest escalation without chemical residue.',
      resources: 'Neem Oil (1.5L/acre), soap emulsifier, sprayer.'
    },
    {
      das: 45,
      title: 'Secondary Weeding & Crop Thinning',
      category: 'Weed Control',
      priority: 'Low',
      time: '08:00 AM',
      duration: '3 hours',
      why: 'Remove late-emerging weeds and thin out crowded crop lines.',
      benefit: 'Improves air flow and sunlight penetration in the crop field.',
      resources: 'Weeding sickle, labor.'
    },
    {
      das: 50,
      title: 'Tillering stage Irrigation Event',
      category: 'Irrigation',
      priority: 'Medium',
      time: '07:30 AM',
      duration: '2.5 hours',
      why: 'Tillering (branching) requires peak water supply for cell expansion.',
      benefit: 'Maximizes the number of productive tillers/shoots.',
      resources: 'Irrigation system.',
      skipIf: isRainfed
    },
    {
      das: 55,
      title: 'Second Fertilizer Application (Potash & Nitrogen Boost)',
      category: 'Fertilization',
      priority: 'High',
      time: '08:30 AM',
      duration: '1.5 hours',
      why: 'Provides essential Potassium for flower induction and carbohydrate transport.',
      benefit: 'Strengthens stems against lodging and improves grain count.',
      resources: isOrganic ? 'Wood ash / organic potash alternatives' : 'MOP (25 kg/acre) and Urea (20 kg/acre)'
    },
    {
      das: 65,
      title: 'Critical Irrigation Event (Flowering stage)',
      category: 'Irrigation',
      priority: 'High',
      time: '07:00 AM',
      duration: '3 hours',
      why: 'Flowering is the absolute peak moisture sensitivity stage.',
      benefit: 'Prevents flower drop and pollen sterility, protecting 40% yield potential.',
      resources: 'Borewell/canal water flow.',
      skipIf: isRainfed
    },
    {
      das: 75,
      title: 'Disease Inspection & Micronutrient Spray',
      category: 'Disease Control',
      priority: 'Medium',
      time: '09:30 AM',
      duration: '2 hours',
      why: 'Foliar spray of critical trace minerals (Zinc/Boron) to assist flower fertilization.',
      benefit: 'Enhances grain size, quality, and overall weight.',
      resources: 'Chelated Zinc + Solubor Boron powder, hand sprayer.'
    },
    {
      das: 85,
      title: 'Grain Filling stage Irrigation Event',
      category: 'Irrigation',
      priority: 'Medium',
      time: '07:30 AM',
      duration: '2 hours',
      why: 'Supports grain expansion from milk stage to dough stage.',
      benefit: 'Ensures plump, heavy grains and avoids dry grain shriveling.',
      resources: 'Pump setup.',
      skipIf: isRainfed
    },
    {
      das: 100,
      title: 'Final Field Inspection & Harvest Preparation',
      category: 'Planning',
      priority: 'Low',
      time: '08:00 AM',
      duration: '2 hours',
      why: 'Monitor grain hardness and stop all watering to allow field drying.',
      benefit: 'Allows grain moisture to fall naturally, preparing field for heavy harvesting machinery.',
      resources: 'None.'
    },
    {
      das: Math.floor(durationDays - 5),
      title: 'Procure Harvest Jute Bags & Tarpaulins',
      category: 'Planning',
      priority: 'Medium',
      time: '11:00 AM',
      duration: '1 hour',
      why: 'Gather bagging material and clean storage bins ahead of harvest day.',
      benefit: 'Saves time and prevents post-harvest pile clutter.',
      resources: 'Jute sacks, dry tarpaulins.'
    },
    {
      das: durationDays,
      title: `Final Harvesting & Field Threshing`,
      category: 'Harvesting',
      priority: 'High',
      time: '06:30 AM',
      duration: '6 hours',
      why: 'Cut mature crop at exact physiological readiness to avoid shattering.',
      benefit: 'Gathers the final seasonal crop yield.',
      resources: 'Combine harvester contract OR manual sickles + threshing team.'
    },
    {
      das: durationDays + 2,
      title: 'Crop Sun Drying & Moisture Test',
      category: 'Post-Harvest',
      priority: 'Medium',
      time: '09:00 AM',
      duration: '4 hours',
      why: 'Spread grains on large clean tarpaulins in full sunlight.',
      benefit: 'Reduces grain moisture to under 12%, preventing mould/fungi during storage.',
      resources: 'Tarpaulins, rakes.'
    },
    {
      das: durationDays + 5,
      title: 'Bagging, Hermetic Storage & Pest Treatment',
      category: 'Post-Harvest',
      priority: 'Low',
      time: '10:00 AM',
      duration: '3 hours',
      why: 'Fill dry grains into air-tight bags or metallic silos.',
      benefit: 'Protects grains against storage weevils and rodents for up to 9 months.',
      resources: 'Jute/hermetic bags, clean dry grain silo.'
    },
    {
      das: durationDays + 8,
      title: 'Mandi Transport & Crop Selling',
      category: 'Marketing',
      priority: 'High',
      time: '07:00 AM',
      duration: '4 hours',
      why: 'Load bags onto transport vehicle and register selling lot at the APMC Mandi.',
      benefit: 'Realizes maximum financial returns for the crop cycle.',
      resources: 'Tractor trolley booking, Mandi registration slip.'
    }
  ];

  // Append crop-specific disease preventive spray tasks from DISEASE_DATABASE
  const diseases = getDiseasesForCrop(baseCrop) || [];
  diseases.forEach((disease, idx) => {
    const timing = idx === 0 ? 30 : (idx === 1 ? 60 : 90);
    if (timing < durationDays) {
      taskTemplates.push({
        das: timing,
        title: `Scout and Treat for ${disease.name}`,
        category: 'Disease Control',
        priority: disease.severity === 'Severe' ? 'High' : 'Medium',
        time: '08:00 AM',
        duration: '2 hours',
        why: `High-risk weather triggers ${disease.name} (Humidity threshold: ${disease.humidityThreshold}%).`,
        benefit: `Protects crop leaves and stems from blight/rot damage.`,
        resources: isOrganic ? disease.organicTreatment : disease.treatment
      });
    }
  });

  // Convert template tasks into concrete calendar-dated tasks
  const generatedTasks = taskTemplates
    .filter(t => !t.skipIf)
    .map((template, idx) => {
      const taskDate = addDays(sowingDate, template.das);
      const key = `${template.category}-${template.das}`;
      
      const previousState = completedTasksMap[key];

      return {
        id: `task-${baseCrop}-${idx}-${Date.now()}`,
        title: template.title,
        category: template.category,
        priority: template.priority,
        time: template.time,
        duration: template.duration,
        why: template.why,
        benefit: template.benefit,
        resources: template.resources,
        das: template.das,
        date: previousState ? previousState.date : taskDate,
        rescheduledDate: previousState ? previousState.rescheduledDate : null,
        status: previousState ? previousState.status : 'pending',
        completedAt: previousState ? previousState.completedAt : null
      };
    })
    .sort((a, b) => a.das - b.das);

  return generatedTasks;
}
