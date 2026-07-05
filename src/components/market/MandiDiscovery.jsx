import React, { useState, useEffect } from 'react';
import { 
  MapPin, Search, Navigation, Filter, Map, Clock, 
  IndianRupee, ArrowRight, Activity, ShieldCheck, CheckCircle2, AlertTriangle, Truck
} from 'lucide-react';

export default function MandiDiscovery({ 
  farms = [], 
  selectedFarmIndex = 0, 
  mandiData = [], 
  onSelectMandi 
}) {
  const activeFarm = farms[selectedFarmIndex];
  const hasActiveCrop = !!activeFarm?.crop?.name;
  
  // Auto-fill states
  const [crop, setCrop] = useState(activeFarm?.crop?.name || 'Wheat');
  const [quantity, setQuantity] = useState(activeFarm?.crop?.expectedYield || '20');
  const [period, setPeriod] = useState('Today');
  const [radius, setRadius] = useState('50');
  const [vehicleType, setVehicleType] = useState('Medium Truck');
  
  // Location States
  const [farmState, setFarmState] = useState(activeFarm?.state || 'Maharashtra');
  const [farmDistrict, setFarmDistrict] = useState(activeFarm?.district || 'Nashik');
  const [farmVillage, setFarmVillage] = useState(activeFarm?.village || 'Pimpalgaon');

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [sortBy, setSortBy] = useState('net_realization'); // 'price', 'distance', 'net_realization'
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  useEffect(() => {
    if (activeFarm) {
      setCrop(activeFarm?.crop?.name || 'Wheat');
      setQuantity(activeFarm?.crop?.expectedYield || '20');
      setFarmState(activeFarm?.state || 'Maharashtra');
      setFarmDistrict(activeFarm?.district || 'Nashik');
      setFarmVillage(activeFarm?.village || 'Pimpalgaon');
    }
  }, [activeFarm]);

  const periods = ['Today', 'Within 3 Days', 'Within 7 Days'];
  const radiuses = ['25', '50', '100', '200', 'Custom'];
  
  // Standard Transport Rates
  const vehicleRates = {
    'Tractor Trolley': { ratePerKm: 12, fixedCost: 250 },
    'Small Pickup': { ratePerKm: 15, fixedCost: 300 },
    'Medium Truck': { ratePerKm: 22, fixedCost: 500 },
    'Heavy Truck': { ratePerKm: 35, fixedCost: 1000 },
  };

  // Processed mandi data
  const processedMandis = (mandiData || []).map((m, index) => {
    const deterministicDistance = parseFloat(m.distance) || (10 + ((m.market.length * 7 + index * 13) % 90));
    
    // Transport Calculation based on vehicle and quantity
    const rateInfo = vehicleRates[vehicleType] || vehicleRates['Medium Truck'];
    const qtl = parseFloat(quantity) || 1;
    const totalTransportCost = Math.round((deterministicDistance * rateInfo.ratePerKm * 2) + rateInfo.fixedCost);
    const transportCostPerQtl = totalTransportCost / qtl;
    
    return {
      ...m,
      distance: deterministicDistance,
      transportCost: totalTransportCost,
      netExpected: m.modalPrice - transportCostPerQtl,
      travelTime: `${Math.round(deterministicDistance * 1.5)} mins`,
      vehicleUsed: vehicleType
    };
  }).sort((a, b) => {
    if (sortBy === 'price') return b.modalPrice - a.modalPrice;
    if (sortBy === 'distance') return a.distance - b.distance;
    return b.netExpected - a.netExpected;
  });

  const topMandis = processedMandis.slice(0, 5);

  // Factual "Should I Visit Another Mandi?" Recommendation Logic
  const getMandiRecommendation = () => {
    if (topMandis.length === 0) return null;
    
    const nearest = topMandis.reduce((prev, curr) => curr.distance < prev.distance ? curr : prev, topMandis[0]);
    const best = topMandis.reduce((prev, curr) => curr.netExpected > prev.netExpected ? curr : prev, topMandis[0]);
    
    const profitDiff = best.netExpected - nearest.netExpected;
    
    if (best.market !== nearest.market && profitDiff > 20) {
      return {
        recommend: 'YES_ALT',
        title: `Recommended: Sell at ${best.market} (वैकल्पिक मंडी में बेचें)`,
        desc: `By traveling an extra ${Math.round(best.distance - nearest.distance)} km to ${best.market}, your net earnings will increase by ₹${Math.round(profitDiff)}/Qtl after transport costs (₹${Math.round(best.netExpected)}/Qtl vs ₹${Math.round(nearest.netExpected)}/Qtl at the nearest mandi).`,
        colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-900'
      };
    }
    
    return {
      recommend: 'STAY_NEAREST',
      title: `Recommended: Sell at Nearest Mandi - ${nearest.market}`,
      desc: `${nearest.market} is the closest market (${nearest.distance} km) and offers the most optimal net realization (₹${Math.round(nearest.netExpected)}/Qtl) after transport costs today.`,
      colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    };
  };

  const advice = getMandiRecommendation();

  return (
    <div className="animate-fade-in-up flex flex-col lg:flex-row gap-6 items-start">
      
      {/* ── Collapsible Discovery Form Sidebar ── */}
      {isFiltersExpanded && (
        <div className="w-full lg:w-80 shrink-0 space-y-6 transition-all duration-300 animate-slide-in-left">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/60 pb-3">
              <Search className="text-primary" size={20} />
              <h4 className="font-display font-extrabold text-base text-on-surface">Find Buyers</h4>
            </div>

            <div className="space-y-4">
              
              {/* Crop Selector */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Crop (फसल)</label>
                {hasActiveCrop ? (
                  <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-outline-variant rounded-xl text-xs font-extrabold text-primary flex items-center justify-between">
                    <span>{crop}</span>
                    <span className="text-[9px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">Planned Crop</span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary"
                  />
                )}
              </div>

              {/* Expected Selling Quantity */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Quantity (मात्रा) (Qtl)</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* State override */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">State (राज्य)</label>
                <input 
                  type="text" 
                  value={farmState}
                  onChange={(e) => setFarmState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* District override */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">District (जिला)</label>
                <input 
                  type="text" 
                  value={farmDistrict}
                  onChange={(e) => setFarmDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* Village override */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Village/Town (गाँव/शहर)</label>
                <input 
                  type="text" 
                  value={farmVillage}
                  onChange={(e) => setFarmVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* Transport Vehicle selection */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Transport Vehicle</label>
                <select 
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary appearance-none bg-white"
                >
                  {Object.keys(vehicleRates).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Results Area ── */}
      <div className="flex-1 w-full flex flex-col space-y-4">
        
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low text-primary border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Toggle Filters"
            >
              <Filter size={14} />
              {isFiltersExpanded ? 'Hide Filters (फ़िल्टर छिपाएं)' : 'Show Filters (फ़िल्टर दिखाएं)'}
            </button>
            
            <div>
              <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                <Activity size={18} className="text-green-600 animate-pulse" />
                Mandi Discovery Listings
              </h3>
              <p className="text-[10px] text-on-surface-variant font-bold">Location: {farmVillage}, {farmDistrict}, {farmState}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant outline-none"
            >
              <option value="net_realization">Sort by Net Profit</option>
              <option value="price">Sort by Highest Price</option>
              <option value="distance">Sort by Nearest</option>
            </select>
            
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-on-surface-variant'}`}
              >
                <Filter size={16} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-primary' : 'text-on-surface-variant'}`}
              >
                <Map size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Factual Empty State if no Mandis found */}
        {topMandis.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-outline-variant text-center w-full max-w-xl mx-auto space-y-4 shadow-sm my-6">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black text-on-surface">Data Not Available (डेटा उपलब्ध नहीं है)</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
              No live daily prices or markets were reported in <strong>{farmDistrict}, {farmState}</strong> for the crop <strong>{crop}</strong> today.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl text-[10px] text-on-surface-variant font-bold text-left border border-outline-variant/60">
              💡 <span className="font-extrabold text-primary">Developer Testbed Tip:</span> Try setting your state override to <span className="underline">Maharashtra</span> and district override to <span className="underline">Nashik</span> to view simulated demonstration mandi data.
            </div>
          </div>
        ) : (
          <>
            {/* Should I Visit Another Mandi? Banner */}
            {advice && (
              <div className={`p-4 rounded-2xl border flex gap-3 ${advice.colorClass} shadow-sm animate-fade-in`}>
                <div className="shrink-0 mt-0.5">
                  {advice.recommend === 'YES_ALT' ? <AlertTriangle size={20} className="text-indigo-700" /> : <CheckCircle2 size={20} className="text-emerald-700" />}
                </div>
                <div>
                  <div className="font-black text-sm">{advice.title}</div>
                  <p className="text-[11px] font-semibold leading-relaxed mt-1 opacity-90">
                    {advice.desc}
                  </p>
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-20">
                {topMandis.map((mandi, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onSelectMandi(mandi)}
                    className="group bg-white rounded-3xl p-5 border border-outline-variant hover:border-primary/45 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5"
                  >
                    {idx === 0 && sortBy === 'net_realization' && (
                      <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl tracking-wider">
                        MOST PROFITABLE
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-display font-extrabold text-lg text-on-surface group-hover:text-primary transition-colors">
                          {mandi.market}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">
                            {mandi.district}, {mandi.state}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-black text-on-surface flex items-center justify-end gap-0.5">
                          <IndianRupee size={20} className="text-primary" />
                          {mandi.modalPrice}
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Modal Price / Qtl</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-semibold text-on-surface">
                      <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-on-surface-variant mb-1 uppercase tracking-wide">
                          <Navigation size={12} /> Distance
                        </div>
                        <div className="font-extrabold">{mandi.distance} km</div>
                        <div className="text-[9px] text-on-surface-variant">{mandi.travelTime}</div>
                      </div>
                      
                      <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-on-surface-variant mb-1 uppercase tracking-wide">
                          <Clock size={12} /> Last Sourced
                        </div>
                        <div className="font-extrabold">{mandi.arrivalDate || 'Today'}</div>
                        <div className="text-[9px] text-on-surface-variant">AGMARKNET Data</div>
                      </div>
                    </div>

                    {/* Variety & Grade */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-[10px] font-semibold text-on-surface-variant">
                      <div>
                        <span className="text-[9px] uppercase block mb-0.5">Variety (फसल की किस्म)</span>
                        <span className="font-extrabold text-on-surface">{mandi.variety || 'Other'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase block mb-0.5">Grade (श्रेणी)</span>
                        <span className="font-extrabold text-on-surface">{mandi.grade || 'FAQ'}</span>
                      </div>
                    </div>

                    {/* Transparent Net Selling Value Breakdown */}
                    <div className="bg-slate-50 border border-outline-variant/60 rounded-2xl p-4 space-y-1.5 text-xs transition-colors group-hover:bg-green-50/20">
                      <div className="flex justify-between font-semibold text-on-surface-variant">
                        <span>Revenue ({quantity} Qtl × ₹{mandi.modalPrice}):</span>
                        <span className="font-bold text-on-surface">₹{Math.round(quantity * mandi.modalPrice)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-on-surface-variant">
                        <span>Transport ({mandi.distance} km × ₹{vehicleRates[vehicleType].ratePerKm}/km × 2 + ₹{vehicleRates[vehicleType].fixedCost}):</span>
                        <span className="font-bold text-red-600">-₹{mandi.transportCost}</span>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant/60 pt-1.5 font-bold">
                        <span className="text-on-surface">Net Realization:</span>
                        <span className="font-black text-green-700 text-sm">₹{Math.max(0, Math.round(quantity * mandi.modalPrice - mandi.transportCost))}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="flex-1 bg-blue-50/50 rounded-3xl border-2 border-outline-variant border-dashed flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                  <div className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1 whitespace-nowrap">{farmVillage}</div>
                  <MapPin className="text-primary drop-shadow-md" size={32} fill="white" />
                </div>

                {/* Simulated Pins */}
                {topMandis.map((m, idx) => {
                  const angle = (idx / 5) * Math.PI * 2;
                  const r = 100 + Math.random() * 100;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  
                  return (
                    <div 
                      key={idx} 
                      className="absolute cursor-pointer hover:z-20 group transition-all duration-300 hover:scale-110"
                      style={{ top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)` }}
                      onClick={() => onSelectMandi(m)}
                    >
                      <div className="bg-white border border-outline-variant shadow-lg rounded-xl p-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap w-48 pointer-events-none">
                        <div className="font-bold text-xs">{m.market}</div>
                        <div className="text-[10px] text-green-600 font-bold">Net: ₹{Math.max(0, Math.round(m.netExpected))}/Qtl</div>
                        <div className="text-[9px] text-on-surface-variant">{m.distance} km • {m.travelTime}</div>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-8 h-8 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-sm z-10"></div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary" />
                    <div>
                      <div className="font-bold text-sm">Map View Active</div>
                      <div className="text-xs text-on-surface-variant">Showing top {topMandis.length} mandis near {farmVillage}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
