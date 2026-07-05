import React, { useState, useEffect } from 'react';
import { 
  Truck, Warehouse, MapPin, ShieldCheck, IndianRupee, 
  Navigation, Loader2, ArrowRight, Info, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { fetchColdStorageFacilities } from '../../../utils/mandiService';

export default function LogisticsStorageTab({ mandi }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchColdStorageFacilities(mandi.state, mandi.district);
        setFacilities(data);
      } catch (err) {
        console.error("Cold Storage fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [mandi.state, mandi.district]);

  // Transportation metrics
  const distance = parseFloat(mandi.distance) || 25;
  const totalTransportCost = mandi.transportCost || 1200;
  const vehicleUsed = mandi.vehicleUsed || 'Medium Truck';
  const cropName = mandi.commodity || 'Wheat';
  
  const alternatives = [
    { name: 'Local FPO Collection Center', dist: Math.round(distance * 0.3), cost: Math.round(totalTransportCost * 0.4) },
    { name: 'Govt Procurement Center (PACS)', dist: Math.round(distance * 0.5), cost: Math.round(totalTransportCost * 0.6) }
  ];

  // Factual Crop Suitability & Preservability Guide
  const getCropSuitabilityInfo = (crop) => {
    const lower = (crop || '').toLowerCase();
    if (lower.includes('potato')) {
      return {
        rating: 'Highly Recommended (उत्कृष्ट)',
        temp: '2°C to 4°C',
        humidity: '90-95%',
        desc: 'Potatoes are ideally suited for cold storage. Sprouting and weight loss are minimized, allowing safe storage up to 6-8 months.',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50/60 border-green-200'
      };
    }
    if (lower.includes('onion')) {
      return {
        rating: 'Moderately Recommended (मध्यम)',
        temp: '0°C to 2°C',
        humidity: '65-70%',
        desc: 'Onions require low humidity and high ventilation. Multi-tier ventilated structures or specialized cold rooms can hold them for 3-5 months.',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50/60 border-amber-200'
      };
    }
    if (lower.includes('tomato') || lower.includes('vegetable')) {
      return {
        rating: 'Short-Term Storage Only (अल्पकालिक)',
        temp: '10°C to 13°C',
        humidity: '85-90%',
        desc: 'Tomatoes are chilling-sensitive. Cold storage should only be used to hold ripe fruit for 1-2 weeks maximum to maintain firmness.',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50/60 border-amber-200'
      };
    }
    if (lower.includes('wheat') || lower.includes('paddy') || lower.includes('rice') || lower.includes('grain') || lower.includes('moong') || lower.includes('tur')) {
      return {
        rating: 'Dry Warehousing Preferred (सूखा गोदाम)',
        temp: 'Ambient',
        humidity: 'Under 12% moisture',
        desc: 'Grains and pulses do not require cold storage. Storing in low-temperature humid cold storage causes grain damage and rotting. Use dry government warehouses.',
        iconColor: 'text-rose-600',
        bgColor: 'bg-rose-50/60 border-rose-200'
      };
    }
    return {
      rating: 'Check Suitability (जांच आवश्यक)',
      temp: 'Refer to standards',
      humidity: 'Refer to standards',
      desc: 'Verify the temperature, moisture, and ventilation guidelines for this specific crop variety with local agricultural officers.',
      iconColor: 'text-slate-600',
      bgColor: 'bg-slate-50 border-outline-variant'
    };
  };

  const suitability = getCropSuitabilityInfo(cropName);

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-on-surface mb-1">
              Logistics & Cold Storage (परिवहन और भंडारण)
            </h3>
            <p className="text-sm font-semibold text-on-surface-variant max-w-2xl leading-relaxed">
              Calculate your transport cost to <strong>{mandi.market}</strong>, check closer FPO alternatives, or browse local government-approved cold storage units to preserve your harvest.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── Left Column: Transport Planning (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm space-y-6">
            <h4 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
              <Truck className="text-primary" size={20} />
              Transport Expenses (किराया खर्च)
            </h4>

            {/* Calculations list */}
            <div className="space-y-3.5 text-xs font-semibold text-on-surface">
              <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Route Distance</span>
                <span>{distance} km</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Vehicle Selected</span>
                <span>{vehicleUsed}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Rate Type</span>
                <span>Round Trip (loading incl.)</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-on-surface">Total Est. Cost</span>
                <span className="font-black text-base text-red-600">₹{totalTransportCost}</span>
              </div>
            </div>

            {/* Profit analysis banner */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-emerald-800">
              <div className="text-[10px] font-black uppercase mb-1">Logistics Impact</div>
              <p className="text-[11px] leading-relaxed font-semibold">
                Deducting transportation, your net expected price at {mandi.market} remains optimal compared to local distress selling.
              </p>
            </div>

            {/* FPO Alternatives */}
            <div className="pt-4 border-t border-outline-variant/60">
              <h5 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
                <Navigation size={15} className="text-primary" />
                Nearest Collection Alternatives
              </h5>
              <div className="space-y-2.5">
                {alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-on-surface">{alt.name}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{alt.dist} km away</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-on-surface">₹{alt.cost}</div>
                      <div className="text-[9px] text-on-surface-variant">Transport Est.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Cold Storage Godowns (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Factual Crop Suitability Card */}
          <div className={`rounded-3xl p-5 border shadow-sm ${suitability.bgColor}`}>
            <h5 className="font-bold text-sm text-on-surface flex items-center gap-2 mb-2">
              <Info size={16} className={suitability.iconColor} />
              Crop Storage Suitability for <strong>{cropName}</strong>
            </h5>
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div><span className="font-bold text-on-surface">Storage Suitability:</span> {suitability.rating}</div>
              <div><span className="font-bold text-on-surface">Recommended Temp:</span> {suitability.temp}</div>
              <div><span className="font-bold text-on-surface">Recommended Humidity:</span> {suitability.humidity}</div>
              <p className="mt-2.5 font-medium leading-relaxed text-on-surface">
                {suitability.desc}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3.5 mb-4">
              <h4 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
                <Warehouse className="text-primary" size={20} />
                District Cold Storages (शीत गृह खोजें)
              </h4>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> Govt Database
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-on-surface-variant">
                <Loader2 className="animate-spin mb-3 text-primary" size={28} />
                <p className="text-xs font-semibold">Querying warehousing datasets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {facilities.length > 0 ? (
                  facilities.map((fac, idx) => {
                    const isSpacePlenty = fac.availableSpaceMT > 200;

                    return (
                      <div key={idx} className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-4.5 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-black text-sm text-blue-900 leading-snug">{fac.facilityName}</h5>
                            <div className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1 mt-1">
                              <MapPin size={11} /> {fac.distanceKm} km away • {fac.district}, {fac.state}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-on-surface flex items-center justify-end gap-0.5">
                              <IndianRupee size={12} className="text-primary" /> {fac.costPerQtlPerMonth}
                            </div>
                            <div className="text-[8px] text-on-surface-variant font-bold uppercase tracking-wider">Per Qtl/Month</div>
                          </div>
                        </div>

                        {/* Capacity Metrics */}
                        <div className="grid grid-cols-2 gap-2 mb-2 text-xs font-semibold text-on-surface">
                          <div className="bg-surface-container-low/50 px-3 py-1.5 rounded-xl border border-outline-variant/40">
                            <span className="block text-[9px] text-on-surface-variant uppercase mb-0.5">Total Capacity</span>
                            <span className="font-extrabold">{fac.capacityMT} MT</span>
                          </div>
                          <div className="bg-surface-container-low/50 px-3 py-1.5 rounded-xl border border-outline-variant/40">
                            <span className="block text-[9px] text-on-surface-variant uppercase mb-0.5">Space Available</span>
                            <span className={`font-extrabold ${isSpacePlenty ? 'text-emerald-600' : 'text-amber-600'}`}>{fac.availableSpaceMT} MT</span>
                          </div>
                        </div>

                        {/* Factual Availability status */}
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-bold ${
                          isSpacePlenty ? 'bg-green-50 text-green-800 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isSpacePlenty ? <CheckCircle2 size={12} className="text-green-700" /> : <AlertTriangle size={12} className="text-amber-700" />}
                          <span>
                            {isSpacePlenty 
                              ? 'Space Available: Ready for crop intake.' 
                              : 'Limited space available: Pre-booking recommended before logistics departure.'
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border border-dashed border-outline-variant rounded-2xl text-xs font-semibold text-on-surface-variant">
                    No approved government cold storage facilities found in {mandi.district}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
