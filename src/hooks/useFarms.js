import { useState, useEffect } from 'react';

const DEFAULT_FARMS = [
  {
    id: 'farm-1',
    name: 'Green Field Acres',
    village: 'Pimpalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    area: 4.5,
    crop: {
      name: 'Wheat',
      variety: 'GW 322',
      sowingDate: '2026-11-15',
      stage: 'Vegetative Growth',
      expectedHarvestDate: '2027-03-25',
      farmingType: 'conventional',
      previousCrop: 'Soybean'
    },
    soil: {
      type: 'Black Cotton Soil',
      pH: 7.2,
      source: 'card',
      nitrogen: { value: 180, class: 'Low' },
      phosphorus: { value: 22, class: 'Medium' },
      potassium: { value: 310, class: 'High' }
    },
    water: {
      sources: ['well', 'canal'],
      irrigationMethods: ['drip', 'sprinkler'],
      pumpType: 'Solar Pump (5 HP)',
      waterAvailability: 'Good'
    },
    machinery: ['Tractor (45 HP)', 'Rotavator', 'Drip System'],
    tasks: [],
    diagnosisHistory: []
  }
];

export function useFarms() {
  const [farms, setFarms] = useState(() => {
    try {
      const saved = localStorage.getItem('km_farms');
      return saved ? JSON.parse(saved) : DEFAULT_FARMS;
    } catch (e) {
      console.error('Failed to load farms from localStorage:', e);
      return DEFAULT_FARMS;
    }
  });

  const [selectedFarmIndex, setSelectedFarmIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('km_selected_farm');
      const index = saved ? parseInt(saved, 10) : 0;
      return isNaN(index) || index < 0 ? 0 : index;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('km_farms', JSON.stringify(farms));
    } catch (e) {
      console.error('Failed to save farms to localStorage:', e);
    }
  }, [farms]);

  useEffect(() => {
    try {
      localStorage.setItem('km_selected_farm', selectedFarmIndex.toString());
    } catch (e) {
      console.error('Failed to save selected farm index:', e);
    }
  }, [selectedFarmIndex]);

  const activeFarm = farms[selectedFarmIndex] || farms[0] || null;

  const addFarm = (newFarm) => {
    setFarms((prev) => [...prev, { ...newFarm, id: `farm-${Date.now()}` }]);
    setSelectedFarmIndex(farms.length);
  };

  const updateFarm = (index, updatedFields) => {
    setFarms((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...updatedFields };
      }
      return updated;
    });
  };

  const deleteFarm = (index) => {
    setFarms((prev) => prev.filter((_, i) => i !== index));
    if (selectedFarmIndex >= index && selectedFarmIndex > 0) {
      setSelectedFarmIndex((prev) => prev - 1);
    }
  };

  const addDiagnosisHistoryItem = (farmIndex, item) => {
    setFarms((prev) => {
      const updated = [...prev];
      const farm = { ...updated[farmIndex] };
      farm.diagnosisHistory = [...(farm.diagnosisHistory || []), item];
      updated[farmIndex] = farm;
      return updated;
    });
  };

  const addTaskToFarm = (farmIndex, task) => {
    setFarms((prev) => {
      const updated = [...prev];
      const farm = { ...updated[farmIndex] };
      farm.tasks = [...(farm.tasks || []), { ...task, id: `task-${Date.now()}` }];
      updated[farmIndex] = farm;
      return updated;
    });
  };

  return {
    farms,
    setFarms,
    selectedFarmIndex,
    setSelectedFarmIndex,
    activeFarm,
    addFarm,
    updateFarm,
    deleteFarm,
    addDiagnosisHistoryItem,
    addTaskToFarm
  };
}
