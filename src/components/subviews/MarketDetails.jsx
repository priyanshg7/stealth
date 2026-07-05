import React, { useState, useEffect } from 'react';
import MandiDiscovery from '../market/MandiDiscovery';
import OverviewTab from '../market/tabs/OverviewTab';
import PriceTrendsTab from '../market/tabs/PriceTrendsTab';
import LogisticsStorageTab from '../market/tabs/LogisticsStorageTab';
import PriceAlertsTab from '../market/tabs/PriceAlertsTab';
import { fetchMandiPrices } from '../../utils/mandiService';
import { Loader2, MapPin, ShieldCheck, X, Truck, Bell, ArrowLeft } from 'lucide-react';

export default function MarketDetails({
  farms,
  selectedFarmIndex,
  getFarmDashboardData,
  weatherData
}) {
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState('logistics'); // 'logistics' or 'alerts'
  
  const activeFarm = farms[selectedFarmIndex];
  const cropName = activeFarm?.crop?.name || 'Wheat';
  const farmState = activeFarm?.state || 'Maharashtra';
  const farmDistrict = activeFarm?.district || 'Nashik';

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const data = await fetchMandiPrices(cropName, farmState, farmDistrict);
        setMandiData(data);
      } catch (err) {
        console.error("Failed to load mandi prices", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [cropName, farmState, farmDistrict]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
        <p className="font-semibold text-sm">Initializing Market Intelligence...</p>
        <p className="text-[10px] mt-2 opacity-70">Fetching AGMARKNET Data</p>
      </div>
    );
  }

  // Define a default mandi representation from fetched records or mock
  const defaultMandi = mandiData[0] || {
    market: `${farmDistrict} APMC`,
    district: farmDistrict,
    state: farmState,
    modalPrice: 2200,
    minPrice: 2000,
    maxPrice: 2400,
    arrivals: 150,
    distance: 15,
    travelTime: '30 mins',
    transportCost: 350,
    netExpected: 1850,
    reliability: 80
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* ── Header Title Block ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-on-surface flex items-center gap-2">
            Market Intelligence (बाजार सूझबूझ)
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
              <MapPin size={12} /> {farmDistrict}, {farmState}
            </span>
            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck size={12} /> AGMARKNET Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Top Section: Selling Advisory & Price Trends Side-by-Side ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Selling Advisory (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <OverviewTab 
            mandi={defaultMandi} 
            mandiData={mandiData} 
            weatherData={weatherData} 
          />
        </div>

        {/* Right Column: Price Trends Chart (7 cols) */}
        <div className="xl:col-span-7">
          <PriceTrendsTab 
            mandi={defaultMandi} 
            activeFarm={activeFarm}
            liveMandiData={mandiData}
          />
        </div>

      </div>

      {/* ── Bottom Section: Mandi Options Explorer ── */}
      <div className="border-t border-outline-variant/50 pt-8 space-y-6">
        <div>
          <h3 className="font-display font-extrabold text-xl text-on-surface">
            Mandi Buyer Discovery (मंडी खरीदार खोजें)
          </h3>
          <p className="text-xs text-on-surface-variant font-semibold mt-1">
            Compare estimated net realizations and logistics after transport deductions.
          </p>
        </div>

        <MandiDiscovery 
          farms={farms}
          selectedFarmIndex={selectedFarmIndex}
          mandiData={mandiData}
          onSelectMandi={setSelectedMandi}
        />
      </div>

      {/* ── Mandi Details Overlay Drawer ── */}
      {selectedMandi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-[#f4f7f5] w-full max-w-3xl h-full flex flex-col shadow-2xl relative animate-slide-in-right overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="bg-white border-b border-outline-variant p-6 sticky top-0 z-30 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-display font-extrabold text-on-surface flex items-center gap-2">
                  {selectedMandi.market} details
                </h4>
                <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
                  {selectedMandi.district}, {selectedMandi.state} • Live Prices & Logistics
                </p>
              </div>
              <button 
                onClick={() => setSelectedMandi(null)}
                className="p-2 bg-surface-container-low hover:bg-surface-container rounded-full transition-colors text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Selectors inside Drawer */}
            <div className="bg-white border-b border-outline-variant px-6 flex gap-2">
              <button
                onClick={() => setDetailTab('logistics')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                  detailTab === 'logistics' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Truck size={14} /> Logistics & Storage (परिवहन और भंडारण)
              </button>
              
              <button
                onClick={() => setDetailTab('alerts')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                  detailTab === 'alerts' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Bell size={14} /> Price Alerts (कीमत अलर्ट)
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 p-6 overflow-y-auto pb-24">
              {detailTab === 'logistics' && (
                <LogisticsStorageTab mandi={selectedMandi} />
              )}
              {detailTab === 'alerts' && (
                <PriceAlertsTab mandi={selectedMandi} />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
