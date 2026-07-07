// KisanMitra ICAR / KVK / State Agricultural University Crop Intelligence Dataset
// Compiled from official ICAR Crop Production Technology guidelines,
// KVK Package of Practices, and State Agricultural University recommendations

// ── Variety Intelligence Database ─────────────────────────────────────
// Ratings: 1 (Very Low) to 5 (Very High)
export const VARIETY_DATABASE = {
  wheat: [
    {
      id: 'dbw187', name: 'Karan Vandana (DBW 187)', institution: 'ICAR-IIWBR, Karnal',
      maturityDays: 120, yieldPotential: 24, seedRate: 40, spacingCm: '20×5',
      waterRequirement: 350, irrigationCount: 4,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Loamy', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh'],
      cropRotationBonus: { rice: 10, maize: 8, soybean: 12, cotton: 5, bajra: 7, gram: -5 },
      nutrientRequirement: { N: 120, P: 60, K: 40, Zn: 25 },
      organicAlternatives: { FYM: 10000, vermicompost: 2500, neemCake: 250, azotobacter: 5, PSB: 5 },
      msp: 2275, premiumGrade: true, exportDemand: 'Medium',
      keyTraits: ['Rust resistant', 'Lodging tolerant', 'Premium chapati quality']
    },
    {
      id: 'hd3086', name: 'Pusa Gautami (HD 3086)', institution: 'IARI, New Delhi',
      maturityDays: 125, yieldPotential: 21, seedRate: 40, spacingCm: '20×5',
      waterRequirement: 280, irrigationCount: 3,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 2, heatTolerance: 5,
      suitableSoils: ['Alluvial', 'Clay Loam', 'Sandy Loam'],
      suitableStates: ['Punjab', 'Haryana', 'Rajasthan', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh'],
      cropRotationBonus: { rice: 8, maize: 6, soybean: 10, bajra: 8 },
      nutrientRequirement: { N: 100, P: 50, K: 40, Zn: 20 },
      organicAlternatives: { FYM: 8000, vermicompost: 2000, neemCake: 200, azotobacter: 5, PSB: 5 },
      msp: 2275, premiumGrade: true, exportDemand: 'High',
      keyTraits: ['Heat tolerant', 'Water efficient', 'Powdery mildew resistant']
    },
    {
      id: 'gw322', name: 'Lok-1 (GW 322)', institution: 'SDAU, Gujarat',
      maturityDays: 115, yieldPotential: 20, seedRate: 45, spacingCm: '22.5×5',
      waterRequirement: 320, irrigationCount: 3,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Black Cotton', 'Clay Loam', 'Loamy'],
      suitableStates: ['Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan'],
      cropRotationBonus: { rice: 7, cotton: 8, soybean: 9 },
      nutrientRequirement: { N: 100, P: 50, K: 30, Zn: 20 },
      organicAlternatives: { FYM: 8000, vermicompost: 2000, neemCake: 200, azotobacter: 4, PSB: 4 },
      msp: 2275, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Early maturity', 'Heat escape', 'Standard mandi staple']
    }
  ],

  rice: [
    {
      id: 'pb1121', name: 'Pusa Basmati 1121', institution: 'IARI, New Delhi',
      maturityDays: 145, yieldPotential: 28, seedRate: 15, spacingCm: '20×15',
      waterRequirement: 1200, irrigationCount: 18,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 1, floodTolerance: 3, heatTolerance: 3,
      suitableSoils: ['Clay', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Maharashtra'],
      cropRotationBonus: { wheat: 10, mustard: 8, gram: 6 },
      nutrientRequirement: { N: 120, P: 60, K: 60, Zn: 25, Fe: 10 },
      organicAlternatives: { FYM: 12000, vermicompost: 3000, neemCake: 300, azotobacter: 5, PSB: 5, rhizobium: 0 },
      msp: 2183, premiumGrade: true, exportDemand: 'Very High',
      keyTraits: ['Extra-long grain', 'Export quality', 'Premium aroma']
    },
    {
      id: 'pb1509', name: 'Pusa Basmati 1509', institution: 'IARI, New Delhi',
      maturityDays: 118, yieldPotential: 28, seedRate: 15, spacingCm: '20×15',
      waterRequirement: 980, irrigationCount: 14,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 2, floodTolerance: 3, heatTolerance: 3,
      suitableSoils: ['Clay', 'Clay Loam'],
      suitableStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal'],
      cropRotationBonus: { wheat: 10, mustard: 8, gram: 7 },
      nutrientRequirement: { N: 110, P: 50, K: 50, Zn: 25 },
      organicAlternatives: { FYM: 10000, vermicompost: 2500, neemCake: 250, azotobacter: 5, PSB: 5 },
      msp: 2183, premiumGrade: true, exportDemand: 'High',
      keyTraits: ['Early maturity Basmati', 'Bacterial blight resistant', 'Semi-dwarf']
    },
    {
      id: 'pr126', name: 'PR 126', institution: 'PAU, Ludhiana',
      maturityDays: 92, yieldPotential: 25, seedRate: 20, spacingCm: '20×15',
      waterRequirement: 800, irrigationCount: 10,
      diseaseResistance: 4, pestResistance: 4, droughtTolerance: 3, floodTolerance: 3, heatTolerance: 3,
      suitableSoils: ['Clay', 'Loamy Clay', 'Alluvial'],
      suitableStates: ['Punjab', 'Haryana', 'Uttar Pradesh'],
      cropRotationBonus: { wheat: 12, mustard: 9, gram: 6 },
      nutrientRequirement: { N: 100, P: 45, K: 45, Zn: 20 },
      organicAlternatives: { FYM: 8000, vermicompost: 2000, neemCake: 200, azotobacter: 5, PSB: 4 },
      msp: 2183, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Ultra-short duration', 'Multi-pathotype blast resistant', 'Water saver']
    }
  ],

  maize: [
    {
      id: 'pmh1', name: 'PMH 1 (Punjab Maize Hybrid)', institution: 'PAU, Ludhiana',
      maturityDays: 110, yieldPotential: 32, seedRate: 8, spacingCm: '60×20',
      waterRequirement: 500, irrigationCount: 5,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Sandy Loam', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Punjab', 'Haryana', 'Rajasthan', 'Bihar', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh'],
      cropRotationBonus: { wheat: 10, gram: 8, mustard: 7, rice: 5 },
      nutrientRequirement: { N: 120, P: 60, K: 40, Zn: 25 },
      organicAlternatives: { FYM: 10000, vermicompost: 2500, neemCake: 250, azotobacter: 5, PSB: 5 },
      msp: 2090, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['High stalk strength', 'Lodging resistant', 'Industrial starch grade']
    },
    {
      id: 'deccan103', name: 'Deccan 103 (Double Hybrid)', institution: 'ICAR-IIMR, Hyderabad',
      maturityDays: 105, yieldPotential: 28, seedRate: 8, spacingCm: '60×20',
      waterRequirement: 450, irrigationCount: 4,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 4, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Alluvial', 'Loam', 'Sandy Loam'],
      suitableStates: ['Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Tamil Nadu'],
      cropRotationBonus: { wheat: 8, gram: 7 },
      nutrientRequirement: { N: 100, P: 50, K: 35, Zn: 20 },
      organicAlternatives: { FYM: 8000, vermicompost: 2000, neemCake: 200, azotobacter: 4, PSB: 4 },
      msp: 2090, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Early maturity', 'Moderate drought tolerant', 'Poultry feed grade']
    }
  ],

  bajra: [
    {
      id: 'hb67', name: 'HHB 67 Improved', institution: 'CCS HAU, Hisar',
      maturityDays: 65, yieldPotential: 18, seedRate: 4, spacingCm: '45×15',
      waterRequirement: 250, irrigationCount: 2,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 5, floodTolerance: 1, heatTolerance: 5,
      suitableSoils: ['Sandy', 'Sandy Loam', 'Loamy'],
      suitableStates: ['Rajasthan', 'Gujarat', 'Haryana', 'Maharashtra', 'Uttar Pradesh'],
      cropRotationBonus: { wheat: 10, gram: 9, mustard: 8 },
      nutrientRequirement: { N: 60, P: 30, K: 20 },
      organicAlternatives: { FYM: 5000, vermicompost: 1500, azotobacter: 4, PSB: 3 },
      msp: 2500, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Ultra-drought tolerant', 'Short duration', 'Nutritional grain']
    }
  ],

  mustard: [
    {
      id: 'pusa26', name: 'Pusa Mustard 26', institution: 'IARI, New Delhi',
      maturityDays: 130, yieldPotential: 10, seedRate: 2, spacingCm: '30×10',
      waterRequirement: 200, irrigationCount: 2,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 3,
      suitableSoils: ['Sandy Loam', 'Loamy', 'Alluvial'],
      suitableStates: ['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'],
      cropRotationBonus: { rice: 8, maize: 7, wheat: -3 },
      nutrientRequirement: { N: 80, P: 40, K: 20, S: 40 },
      organicAlternatives: { FYM: 6000, vermicompost: 1500, neemCake: 200, PSB: 4 },
      msp: 5650, premiumGrade: true, exportDemand: 'Medium',
      keyTraits: ['High oil content (42%)', 'Aphid tolerant', 'Low water demand']
    }
  ],

  gram: [
    {
      id: 'jg11', name: 'JG 11 (Desi Chickpea)', institution: 'JNKVV, Jabalpur',
      maturityDays: 110, yieldPotential: 12, seedRate: 30, spacingCm: '30×10',
      waterRequirement: 200, irrigationCount: 2,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 5, floodTolerance: 1, heatTolerance: 3,
      suitableSoils: ['Loamy', 'Sandy Loam', 'Black Cotton'],
      suitableStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Andhra Pradesh'],
      cropRotationBonus: { wheat: 12, rice: 8, maize: 9, cotton: 6 },
      nutrientRequirement: { N: 20, P: 50, K: 20, S: 20, Zn: 5 },
      organicAlternatives: { FYM: 5000, vermicompost: 1500, rhizobium: 5, PSB: 4, trichoderma: 3 },
      msp: 5440, premiumGrade: false, exportDemand: 'High',
      keyTraits: ['Nitrogen fixing', 'Soil improver', 'High protein']
    }
  ],

  cotton: [
    {
      id: 'rch659', name: 'RCH 659 BG-II (Bt Hybrid)', institution: 'Rasi Seeds / CICR',
      maturityDays: 170, yieldPotential: 12, seedRate: 2.5, spacingCm: '90×60',
      waterRequirement: 700, irrigationCount: 8,
      diseaseResistance: 3, pestResistance: 4, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Black Cotton', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Telangana', 'Karnataka'],
      cropRotationBonus: { wheat: 8, gram: 10, soybean: 5 },
      nutrientRequirement: { N: 120, P: 60, K: 60, Zn: 25, B: 5 },
      organicAlternatives: { FYM: 10000, vermicompost: 3000, neemCake: 300, trichoderma: 5, PSB: 5 },
      msp: 6620, premiumGrade: true, exportDemand: 'High',
      keyTraits: ['Bt bollworm resistant', 'High lint quality', 'Medium staple']
    }
  ],

  soybean: [
    {
      id: 'js2069', name: 'JS 20-69', institution: 'JNKVV, Jabalpur',
      maturityDays: 95, yieldPotential: 12, seedRate: 30, spacingCm: '30×5',
      waterRequirement: 450, irrigationCount: 3,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 3,
      suitableSoils: ['Black Cotton', 'Loamy', 'Clay Loam'],
      suitableStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka'],
      cropRotationBonus: { wheat: 12, gram: 8, maize: 6 },
      nutrientRequirement: { N: 25, P: 60, K: 30, S: 20, Zn: 5 },
      organicAlternatives: { FYM: 6000, vermicompost: 2000, rhizobium: 5, PSB: 5, trichoderma: 3 },
      msp: 4600, premiumGrade: false, exportDemand: 'High',
      keyTraits: ['Nitrogen fixing', 'Short duration', 'Rust tolerant']
    }
  ],
  ragi: [
    {
      id: 'gpu28', name: 'GPU-28', institution: 'UAS, Bangalore',
      maturityDays: 110, yieldPotential: 16, seedRate: 4, spacingCm: '22.5×10',
      waterRequirement: 300, irrigationCount: 2,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Red Sandy', 'Loamy', 'Sandy Loam'],
      suitableStates: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra'],
      cropRotationBonus: { gram: 8, mustard: 6 },
      nutrientRequirement: { N: 60, P: 30, K: 30 },
      organicAlternatives: { FYM: 5000, azotobacter: 3 },
      msp: 3846, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Blast resistant', 'Nutrient rich', 'High calcium']
    }
  ],
  garlic: [
    {
      id: 'g41', name: 'Yamuna Safed (G-41)', institution: 'NHRDF',
      maturityDays: 140, yieldPotential: 50, seedRate: 200, spacingCm: '15×10',
      waterRequirement: 500, irrigationCount: 10,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 2, floodTolerance: 1, heatTolerance: 2,
      suitableSoils: ['Clay Loam', 'Sandy Loam', 'Loamy'],
      suitableStates: ['Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'],
      cropRotationBonus: { maize: 10, soybean: 8 },
      nutrientRequirement: { N: 100, P: 50, K: 50 },
      organicAlternatives: { FYM: 15000, vermicompost: 3000, neemCake: 500 },
      msp: 6000, premiumGrade: true, exportDemand: 'High',
      keyTraits: ['Large cloves', 'Good storage quality', 'Export quality']
    }
  ],
  jowar: [
    {
      id: 'csh14', name: 'CSH-14 (Hybrid)', institution: 'ICAR-IIMR, Hyderabad',
      maturityDays: 100, yieldPotential: 22, seedRate: 8, spacingCm: '45×15',
      waterRequirement: 350, irrigationCount: 3,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Black Cotton', 'Clay Loam', 'Loamy'],
      suitableStates: ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Madhya Pradesh'],
      cropRotationBonus: { gram: 10, safflower: 8 },
      nutrientRequirement: { N: 80, P: 40, K: 40 },
      organicAlternatives: { FYM: 6000, azotobacter: 4, PSB: 3 },
      msp: 3180, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Grain mold resistant', 'Dual purpose (grain + fodder)', 'Drought escape']
    }
  ],
  oat: [
    {
      id: 'kent', name: 'Kent (Fodder Oat)', institution: 'IGFRI / IARI',
      maturityDays: 110, yieldPotential: 40, seedRate: 35, spacingCm: '25×5',
      waterRequirement: 300, irrigationCount: 4,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 3,
      suitableSoils: ['Loamy', 'Alluvial', 'Clay Loam'],
      suitableStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
      cropRotationBonus: { rice: 10, maize: 8 },
      nutrientRequirement: { N: 80, P: 40, K: 20 },
      organicAlternatives: { FYM: 8000, vermicompost: 2000 },
      msp: 2200, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Leafy growth', 'Excellent palatability', 'Fast regeneration']
    }
  ],
  groundnut: [
    {
      id: 'kadiri6', name: 'Kadiri 6 (K-6)', institution: 'ANGRAU, Anantapur',
      maturityDays: 105, yieldPotential: 18, seedRate: 85, spacingCm: '30×10',
      waterRequirement: 400, irrigationCount: 4,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 4,
      suitableSoils: ['Red Sandy Loam', 'Sandy'],
      suitableStates: ['Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
      cropRotationBonus: { ragi: 10, maize: 8 },
      nutrientRequirement: { N: 25, P: 50, K: 40 },
      organicAlternatives: { FYM: 5000, rhizobium: 4, PSB: 4 },
      msp: 6780, premiumGrade: true, exportDemand: 'High',
      keyTraits: ['High oil content (48%)', 'Drought tolerant', 'Bold kernels']
    }
  ],
  sugarcane: [
    {
      id: 'co86032', name: 'Co 86032 (Nayan)', institution: 'SBI, Coimbatore',
      maturityDays: 360, yieldPotential: 400, seedRate: 2500, spacingCm: '120×30',
      waterRequirement: 1800, irrigationCount: 20,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 3, heatTolerance: 4,
      suitableSoils: ['Clay Loam', 'Loamy', 'Black Cotton'],
      suitableStates: ['Tamil Nadu', 'Karnataka', 'Maharashtra', 'Andhra Pradesh'],
      cropRotationBonus: { moong: 15, urad: 12 },
      nutrientRequirement: { N: 250, P: 120, K: 120 },
      organicAlternatives: { FYM: 20000, vermicompost: 5000, azotobacter: 10, PSB: 10 },
      msp: 3400, premiumGrade: true, exportDemand: 'Medium',
      keyTraits: ['High sugar recovery', 'Ratoon crop suitability', 'Drought resistant']
    }
  ],
  potato: [
    {
      id: 'kufrijyoti', name: 'Kufri Jyoti', institution: 'CPRI, Shimla',
      maturityDays: 95, yieldPotential: 80, seedRate: 600, spacingCm: '60×20',
      waterRequirement: 350, irrigationCount: 6,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 2, floodTolerance: 1, heatTolerance: 2,
      suitableSoils: ['Sandy Loam', 'Loamy'],
      suitableStates: ['Uttar Pradesh', 'West Bengal', 'Bihar', 'Punjab', 'Karnataka'],
      cropRotationBonus: { maize: 8, 'green manure': 12 },
      nutrientRequirement: { N: 120, P: 100, K: 120 },
      organicAlternatives: { FYM: 15000, vermicompost: 4000, PSB: 5 },
      msp: 1500, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Late blight resistant', 'Wide adaptability', 'Good table purpose']
    }
  ],
  onion: [
    {
      id: 'n53', name: 'N-53 (Kharif Onion)', institution: 'NHRDF / MPKV',
      maturityDays: 100, yieldPotential: 100, seedRate: 4, spacingCm: '15×10',
      waterRequirement: 400, irrigationCount: 8,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Sandy Loam', 'Loamy', 'Clay Loam'],
      suitableStates: ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu'],
      cropRotationBonus: { soybean: 8, bajra: 6 },
      nutrientRequirement: { N: 100, P: 50, K: 50 },
      organicAlternatives: { FYM: 12000, vermicompost: 3000, neemCake: 400 },
      msp: 2000, premiumGrade: false, exportDemand: 'High',
      keyTraits: ['Flat globe shape', 'Dark red color', 'Matures early']
    }
  ],
  moong: [
    {
      id: 'pusavishal', name: 'Pusa Vishal', institution: 'IARI, New Delhi',
      maturityDays: 60, yieldPotential: 6, seedRate: 8, spacingCm: '30×10',
      waterRequirement: 180, irrigationCount: 2,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 4,
      suitableSoils: ['Sandy Loam', 'Loamy'],
      suitableStates: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
      cropRotationBonus: { wheat: 15, mustard: 12 },
      nutrientRequirement: { N: 15, P: 40, K: 20 },
      organicAlternatives: { FYM: 4000, rhizobium: 4, PSB: 3 },
      msp: 8558, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Extra short duration', 'Synchronous maturity', 'Yellow mosaic resistant']
    }
  ],
  urad: [
    {
      id: 't9', name: 'T-9', institution: 'UPCAR, Uttar Pradesh',
      maturityDays: 75, yieldPotential: 5, seedRate: 8, spacingCm: '30×10',
      waterRequirement: 200, irrigationCount: 2,
      diseaseResistance: 3, pestResistance: 3, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 4,
      suitableSoils: ['Loamy', 'Clay Loam'],
      suitableStates: ['Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra'],
      cropRotationBonus: { wheat: 12, mustard: 10 },
      nutrientRequirement: { N: 15, P: 40, K: 20 },
      organicAlternatives: { FYM: 4000, rhizobium: 4, PSB: 3 },
      msp: 6950, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Wide adaptability', 'Drought tolerant', 'Good protein content']
    }
  ],
  lentil: [
    {
      id: 'pusavaibhav', name: 'Pusa Vaibhav', institution: 'IARI, New Delhi',
      maturityDays: 120, yieldPotential: 6, seedRate: 15, spacingCm: '25×5',
      waterRequirement: 180, irrigationCount: 1,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 3,
      suitableSoils: ['Loamy', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan'],
      cropRotationBonus: { rice: 12, maize: 10 },
      nutrientRequirement: { N: 20, P: 40, K: 20 },
      organicAlternatives: { FYM: 4000, rhizobium: 4, PSB: 3 },
      msp: 6425, premiumGrade: false, exportDemand: 'Medium',
      keyTraits: ['Rust resistant', 'Bold seeds', 'Nitrogen fixing']
    }
  ],
  'bajra fodder': [
    {
      id: 'giantbajra', name: 'Giant Bajra', institution: 'IGFRI, Jhansi',
      maturityDays: 75, yieldPotential: 35, seedRate: 6, spacingCm: '30×10',
      waterRequirement: 250, irrigationCount: 3,
      diseaseResistance: 4, pestResistance: 4, droughtTolerance: 4, floodTolerance: 1, heatTolerance: 4,
      suitableSoils: ['Sandy Loam', 'Loamy'],
      suitableStates: ['Uttar Pradesh', 'Rajasthan', 'Haryana', 'Madhya Pradesh'],
      cropRotationBonus: { wheat: 5, gram: 7 },
      nutrientRequirement: { N: 80, P: 40, K: 20 },
      organicAlternatives: { FYM: 6000, azotobacter: 4 },
      msp: 2500, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['High green fodder yield', 'Sweet stem', 'Multi-cut potential']
    }
  ],
  'jowar fodder': [
    {
      id: 'ssg593', name: 'SSG 59-3', institution: 'CCS HAU, Hisar',
      maturityDays: 85, yieldPotential: 40, seedRate: 12, spacingCm: '30×10',
      waterRequirement: 300, irrigationCount: 4,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 4, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Loamy', 'Clay Loam', 'Sandy Loam'],
      suitableStates: ['Haryana', 'Punjab', 'Rajasthan', 'Uttar Pradesh'],
      cropRotationBonus: { wheat: 6, gram: 8 },
      nutrientRequirement: { N: 80, P: 40, K: 20 },
      organicAlternatives: { FYM: 8000, azotobacter: 4 },
      msp: 3180, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Multi-cut (3-4 cuts)', 'High juicy stem', 'Excellent palatability']
    }
  ],
  'maize fodder': [
    {
      id: 'africantall', name: 'African Tall', institution: 'MPKV, Rahuri',
      maturityDays: 80, yieldPotential: 45, seedRate: 15, spacingCm: '30×10',
      waterRequirement: 300, irrigationCount: 4,
      diseaseResistance: 4, pestResistance: 3, droughtTolerance: 3, floodTolerance: 2, heatTolerance: 4,
      suitableSoils: ['Loamy', 'Clay Loam', 'Alluvial'],
      suitableStates: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
      cropRotationBonus: { gram: 8, mustard: 6 },
      nutrientRequirement: { N: 90, P: 50, K: 30 },
      organicAlternatives: { FYM: 10000, azotobacter: 5 },
      msp: 2090, premiumGrade: false, exportDemand: 'Low',
      keyTraits: ['Tall growth (9-10 ft)', 'High protein fodder', 'Single cut']
    }
  ]
};

// ── Crop-level metadata (aggregated from varieties) ───────────────────
export const CROP_METADATA = {
  wheat: { season: 'Rabi', sowingWindow: 'Oct 25 – Nov 25', harvestWindow: 'Mar – Apr', idealTemp: '15-25°C', criticalStages: ['Crown Root Initiation (21 DAS)', 'Flowering (60-65 DAS)', 'Grain Filling (85-100 DAS)'] },
  rice: { season: 'Kharif', sowingWindow: 'Jun 15 – Jul 15', harvestWindow: 'Oct – Nov', idealTemp: '25-35°C', criticalStages: ['Transplanting', 'Tillering (30 DAS)', 'Panicle Initiation (55-60 DAS)', 'Flowering (80-85 DAS)'] },
  maize: { season: 'Kharif/Rabi', sowingWindow: 'Jun – Jul / Oct – Nov', harvestWindow: 'Sep – Oct / Feb – Mar', idealTemp: '20-30°C', criticalStages: ['Knee-High (30 DAS)', 'Tasseling (55 DAS)', 'Silking (60-65 DAS)'] },
  bajra: { season: 'Kharif', sowingWindow: 'Jul 1 – Jul 20', harvestWindow: 'Sep – Oct', idealTemp: '25-35°C', criticalStages: ['Tillering (20 DAS)', 'Ear Head (40 DAS)', 'Grain Filling (55 DAS)'] },
  mustard: { season: 'Rabi', sowingWindow: 'Oct 10 – Oct 30', harvestWindow: 'Feb – Mar', idealTemp: '15-25°C', criticalStages: ['Rosette (30 DAS)', 'Flowering (55-60 DAS)', 'Siliqua Formation (80 DAS)'] },
  gram: { season: 'Rabi', sowingWindow: 'Oct 15 – Nov 15', harvestWindow: 'Feb – Mar', idealTemp: '10-25°C', criticalStages: ['Branching (30 DAS)', 'Flowering (50-55 DAS)', 'Pod Filling (75 DAS)'] },
  cotton: { season: 'Kharif', sowingWindow: 'Apr 15 – May 31', harvestWindow: 'Oct – Feb', idealTemp: '25-35°C', criticalStages: ['Squaring (45 DAS)', 'Flowering (60-70 DAS)', 'Boll Development (90-120 DAS)'] },
  soybean: { season: 'Kharif', sowingWindow: 'Jun 20 – Jul 10', harvestWindow: 'Oct', idealTemp: '20-30°C', criticalStages: ['Flowering (35-40 DAS)', 'Pod Setting (50-55 DAS)', 'Grain Filling (65-75 DAS)'] },
  ragi: { season: 'Kharif', sowingWindow: 'Jun 1 – Jul 15', harvestWindow: 'Oct – Nov', idealTemp: '20-30°C', criticalStages: ['Tillering (20 DAS)', 'Flowering (55-60 DAS)', 'Grain Filling (80 DAS)'] },
  garlic: { season: 'Rabi', sowingWindow: 'Oct 1 – Nov 15', harvestWindow: 'Feb – Mar', idealTemp: '15-25°C', criticalStages: ['Cloves development (60 DAS)', 'Bulb development (90-100 DAS)'] },
  jowar: { season: 'Kharif/Rabi', sowingWindow: 'Jun – Jul / Oct – Nov', harvestWindow: 'Oct / Feb', idealTemp: '25-32°C', criticalStages: ['Boot stage (45 DAS)', 'Flowering (60 DAS)', 'Grain development (80 DAS)'] },
  oat: { season: 'Rabi', sowingWindow: 'Oct 15 – Nov 15', harvestWindow: 'Feb – Mar', idealTemp: '15-20°C', criticalStages: ['Tillering (30 DAS)', 'Boot stage (60 DAS)', 'First cut (75-80 DAS)'] },
  groundnut: { season: 'Kharif/Rabi', sowingWindow: 'Jun – Jul / Nov', harvestWindow: 'Oct / Mar', idealTemp: '22-30°C', criticalStages: ['Flowering (30-35 DAS)', 'Pegging (45-50 DAS)', 'Pod development (70-80 DAS)'] },
  sugarcane: { season: 'Year-Round', sowingWindow: 'Jan – Feb / Oct – Nov', harvestWindow: 'Dec – Mar', idealTemp: '20-35°C', criticalStages: ['Tillering (60-120 DAS)', 'Grand growth (120-270 DAS)', 'Maturity (270-360 DAS)'] },
  potato: { season: 'Rabi', sowingWindow: 'Oct 15 – Nov 10', harvestWindow: 'Feb', idealTemp: '15-20°C', criticalStages: ['Stolon formation (30 DAS)', 'Tuber initiation (45 DAS)', 'Tuber bulking (60-80 DAS)'] },
  onion: { season: 'Kharif/Rabi', sowingWindow: 'Jun / Nov', harvestWindow: 'Oct / Mar', idealTemp: '15-25°C', criticalStages: ['Bulb initiation (50-60 DAS)', 'Bulb development (80-90 DAS)'] },
  moong: { season: 'Zaid/Kharif', sowingWindow: 'Mar – Apr / Jun', harvestWindow: 'Jun / Sep', idealTemp: '25-35°C', criticalStages: ['Flowering (30 DAS)', 'Pod filling (45 DAS)'] },
  urad: { season: 'Zaid/Kharif', sowingWindow: 'Mar – Apr / Jun', harvestWindow: 'Jun / Sep', idealTemp: '25-35°C', criticalStages: ['Flowering (30 DAS)', 'Pod filling (45 DAS)'] },
  lentil: { season: 'Rabi', sowingWindow: 'Oct 15 – Nov 15', harvestWindow: 'Mar', idealTemp: '15-20°C', criticalStages: ['Flowering (50-55 DAS)', 'Pod filling (75-80 DAS)'] },
  'bajra fodder': { season: 'Zaid/Kharif', sowingWindow: 'Mar – Apr / Jun', harvestWindow: 'Jun / Sep', idealTemp: '25-35°C', criticalStages: ['Vegetative growth (45 DAS)', 'First cut (60 DAS)'] },
  'jowar fodder': { season: 'Zaid/Kharif', sowingWindow: 'Mar – Apr / Jun', harvestWindow: 'Jun / Sep', idealTemp: '25-35°C', criticalStages: ['Vegetative growth (45 DAS)', 'First cut (65 DAS)'] },
  'maize fodder': { season: 'Zaid/Kharif', sowingWindow: 'Mar – Apr / Jun', harvestWindow: 'Jun / Sep', idealTemp: '20-30°C', criticalStages: ['Vegetative growth (45 DAS)', 'First cut (60 DAS)'] }
};

// ── Disease & Pest intelligence (weather-triggered) ───────────────────
export const DISEASE_DATABASE = {
  wheat: [
    { name: 'Yellow/Stripe Rust', humidityThreshold: 80, tempRange: [10, 20], riskFactor: 'humidity', severity: 'High', treatment: 'Propiconazole 25% EC @ 1ml/L', organicTreatment: 'Neem oil + Trichoderma soil drench' },
    { name: 'Powdery Mildew', humidityThreshold: 75, tempRange: [15, 25], riskFactor: 'humidity', severity: 'Medium', treatment: 'Sulphur WP 80% @ 3g/L', organicTreatment: 'Baking soda spray (5g/L)' },
    { name: 'Karnal Bunt', humidityThreshold: 85, tempRange: [18, 24], riskFactor: 'rain_at_flowering', severity: 'High', treatment: 'Propiconazole spray at flowering', organicTreatment: 'Seed treatment with Trichoderma viride' }
  ],
  rice: [
    { name: 'Blast (Leaf & Neck)', humidityThreshold: 90, tempRange: [20, 28], riskFactor: 'humidity', severity: 'Severe', treatment: 'Tricyclazole 75% WP @ 0.6g/L', organicTreatment: 'Pseudomonas fluorescens seed treatment' },
    { name: 'Bacterial Leaf Blight', humidityThreshold: 85, tempRange: [25, 35], riskFactor: 'rain', severity: 'High', treatment: 'Streptomycin + Copper Oxychloride', organicTreatment: 'Neem oil + Bordeaux mixture' },
    { name: 'Brown Plant Hopper', humidityThreshold: 80, tempRange: [25, 30], riskFactor: 'continuous_rain', severity: 'Severe', treatment: 'Thiamethoxam 25% WG', organicTreatment: 'Neem seed kernel extract 5%' }
  ],
  maize: [
    { name: 'Fall Armyworm', humidityThreshold: 70, tempRange: [20, 35], riskFactor: 'warm_humid', severity: 'Severe', treatment: 'Emamectin Benzoate 5% SG', organicTreatment: 'Bt spray + Trichogramma release' },
    { name: 'Turcicum Leaf Blight', humidityThreshold: 85, tempRange: [18, 27], riskFactor: 'humidity', severity: 'Medium', treatment: 'Mancozeb 75% WP @ 2.5g/L', organicTreatment: 'Trichoderma harzianum seed treatment' }
  ],
  bajra: [
    { name: 'Downy Mildew (Green Ear)', humidityThreshold: 85, tempRange: [20, 30], riskFactor: 'humidity', severity: 'Severe', treatment: 'Metalaxyl 35% WS seed treatment @ 6g/kg', organicTreatment: 'Seed treatment with Trichoderma viride @ 4g/kg' },
    { name: 'Ergot (Sugary Disease)', humidityThreshold: 80, tempRange: [20, 30], riskFactor: 'rain_at_flowering', severity: 'High', treatment: 'Mancozeb 75% WP @ 2.5g/L spray at flowering', organicTreatment: 'Remove infected ear heads; apply neem oil spray' },
    { name: 'Stem Borer', humidityThreshold: 70, tempRange: [25, 35], riskFactor: 'warm_humid', severity: 'Medium', treatment: 'Carbofuran 3G @ 8kg/acre in leaf whorls', organicTreatment: 'Trichogramma chilonis release @ 50,000/acre' }
  ],
  mustard: [
    { name: 'White Rust (Albugo)', humidityThreshold: 80, tempRange: [10, 20], riskFactor: 'humidity', severity: 'High', treatment: 'Metalaxyl + Mancozeb (Ridomil MZ) @ 2.5g/L', organicTreatment: 'Neem oil 2% spray + crop rotation' },
    { name: 'Alternaria Blight', humidityThreshold: 75, tempRange: [15, 25], riskFactor: 'humidity', severity: 'High', treatment: 'Mancozeb 75% WP @ 2.5g/L at 45 & 60 DAS', organicTreatment: 'Trichoderma viride seed treatment + neem oil spray' },
    { name: 'Mustard Aphid', humidityThreshold: 65, tempRange: [10, 20], riskFactor: 'cool_dry', severity: 'Severe', treatment: 'Imidacloprid 17.8% SL @ 0.3ml/L', organicTreatment: 'Neem seed kernel extract 5% spray; release ladybird beetles' }
  ],
  gram: [
    { name: 'Wilt (Fusarium)', humidityThreshold: 70, tempRange: [20, 30], riskFactor: 'soil_moisture', severity: 'Severe', treatment: 'Carbendazim 50% WP seed treatment @ 2g/kg', organicTreatment: 'Trichoderma viride seed treatment @ 4g/kg + deep summer ploughing' },
    { name: 'Ascochyta Blight', humidityThreshold: 85, tempRange: [15, 25], riskFactor: 'humidity', severity: 'High', treatment: 'Mancozeb 75% WP @ 2.5g/L', organicTreatment: 'Neem oil spray + resistant varieties' },
    { name: 'Pod Borer (Helicoverpa)', humidityThreshold: 65, tempRange: [20, 35], riskFactor: 'warm_humid', severity: 'Severe', treatment: 'Emamectin Benzoate 5% SG @ 0.4g/L', organicTreatment: 'NPV (Helicoverpa) spray + Trichogramma release + bird perches' }
  ],
  cotton: [
    { name: 'Pink Bollworm', humidityThreshold: 70, tempRange: [25, 35], riskFactor: 'warm_humid', severity: 'Severe', treatment: 'Profenophos 50% EC @ 2ml/L', organicTreatment: 'Pheromone traps + Trichogramma release + timely picking' },
    { name: 'Whitefly', humidityThreshold: 75, tempRange: [25, 38], riskFactor: 'warm_humid', severity: 'High', treatment: 'Diafenthiuron 50% WP @ 1g/L', organicTreatment: 'Neem oil 2% spray + yellow sticky traps' },
    { name: 'Bacterial Blight', humidityThreshold: 85, tempRange: [25, 35], riskFactor: 'rain', severity: 'High', treatment: 'Copper Oxychloride 50% WP @ 3g/L', organicTreatment: 'Seed treatment with Pseudomonas fluorescens + Bordeaux mixture spray' }
  ],
  soybean: [
    { name: 'Yellow Mosaic Virus (YMV)', humidityThreshold: 75, tempRange: [25, 35], riskFactor: 'warm_humid', severity: 'Severe', treatment: 'Thiamethoxam 25% WG @ 0.2g/L (whitefly vector control)', organicTreatment: 'Neem oil spray to control whitefly vector + resistant varieties' },
    { name: 'Rust (Phakopsora)', humidityThreshold: 80, tempRange: [20, 28], riskFactor: 'humidity', severity: 'High', treatment: 'Hexaconazole 5% EC @ 2ml/L', organicTreatment: 'Trichoderma viride seed treatment + neem-based fungicide spray' },
    { name: 'Stem Fly', humidityThreshold: 70, tempRange: [25, 35], riskFactor: 'warm_humid', severity: 'Medium', treatment: 'Thiamethoxam 30% FS seed treatment', organicTreatment: 'Intercropping with maize; neem seed kernel extract spray' }
  ]
};

// ── Helper: Get varieties for a crop ──────────────────────────────────
export function getVarietiesForCrop(cropId) {
  return VARIETY_DATABASE[cropId?.toLowerCase()] || [];
}

// ── Helper: Get diseases for a crop ───────────────────────────────────
export function getDiseasesForCrop(cropId) {
  return DISEASE_DATABASE[cropId?.toLowerCase()] || [];
}
