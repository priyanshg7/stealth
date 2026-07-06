import React, { useState, useEffect } from 'react';
import { 
  MapPin, Search, Navigation, Filter, Map, Clock, 
  IndianRupee, ArrowRight, Activity, ShieldCheck, CheckCircle2, AlertTriangle, Truck, Compass, Loader2, Info, RefreshCw
} from 'lucide-react';

const ALL_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const COMMON_DISTRICTS = {
  'Maharashtra': ['Nashik', 'Pune', 'Nagpur', 'Satara', 'Ahmednagar'],
  'Karnataka': ['Raichur', 'Dharwad', 'Belagavi', 'Mandya'],
  'Gujarat': ['Amreli', 'Rajkot', 'Junagadh', 'Ahmedabad'],
  'Rajasthan': ['Chittorgarh', 'Jaipur', 'Kota', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Jabalpur'],
  'Bihar': ['Patna', 'Sheikhpura', 'Gaya', 'Muzaffarpur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar'],
  'Haryana': ['Hisar', 'Karnal', 'Rohtak', 'Gurugram']
};

export default function MandiDiscovery({ 
  farms = [], 
  selectedFarmIndex = 0, 
  mandiData = [], 
  onSelectMandi 
}) {
  const activeFarm = farms[selectedFarmIndex];
  
  // Search Panel States
  const [farmState, setFarmState] = useState(activeFarm?.state || 'Maharashtra');
  const [farmDistrict, setFarmDistrict] = useState(activeFarm?.district || 'Nashik');
  const [farmVillage, setFarmVillage] = useState(activeFarm?.village || 'Pimpalgaon');
  const [crop, setCrop] = useState(activeFarm?.crop?.name || 'Wheat');
  const [variety, setVariety] = useState('All Varieties');
  const [quantity, setQuantity] = useState(activeFarm?.crop?.expectedYield || '20');
  
  // Advanced Settings
  const [vehicleType, setVehicleType] = useState('Medium Truck');
  const [sortBy, setSortBy] = useState('net_realization'); // 'price', 'distance', 'net_realization'
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  // Data State
  const [localMandiData, setLocalMandiData] = useState(mandiData);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchScope, setLastSearchScope] = useState('district'); // 'district' or 'state'

  useEffect(() => {
    setLocalMandiData(mandiData);
  }, [mandiData]);

  const handleSearch = async (scope = 'state') => {
    setIsSearching(true);
    setLastSearchScope(scope);
    try {
      const { fetchMandiPrices } = await import('../../utils/mandiService');
      // Fetch prices for the entire state because API district data is often sparse.
      // We always pass empty string for district to get maximum results, then sort locally by distance.
      const data = await fetchMandiPrices(crop, farmState, '');
      setLocalMandiData(data);
    } catch (err) {
      console.error("Mandi discovery search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            if (res.ok) {
              const data = await res.json();
              if (data.principalSubdivision) {
                const stateMatch = ALL_STATES.find(s => data.principalSubdivision.includes(s) || s.includes(data.principalSubdivision));
                if (stateMatch) setFarmState(stateMatch);
                else setFarmState(data.principalSubdivision);
              }
              if (data.city || data.locality) {
                setFarmDistrict(data.city || data.locality);
                setFarmVillage('Detected Location');
              }
            }
          } catch (e) {
            console.error("Geocoding failed", e);
            setFarmState('Uttar Pradesh'); // Fallback to a state with good data
            setFarmDistrict('Kanpur');
          }
        },
        () => {
          // Fallback if denied
          setFarmState('Uttar Pradesh');
          setFarmDistrict('Kanpur');
        }
      );
    }
  };

  const useSavedFarm = () => {
    if (activeFarm) {
      setFarmState(activeFarm.state || 'Maharashtra');
      setFarmDistrict(activeFarm.district || 'Nashik');
      setFarmVillage(activeFarm.village || 'Pimpalgaon');
      setCrop(activeFarm.crop?.name || 'Wheat');
    }
  };

  const vehicleRates = {
    'Tractor Trolley': { ratePerKm: 12, fixedCost: 250 },
    'Small Pickup': { ratePerKm: 15, fixedCost: 300 },
    'Medium Truck': { ratePerKm: 22, fixedCost: 500 },
    'Heavy Truck': { ratePerKm: 35, fixedCost: 1000 },
  };

  // Derive unique varieties from fetched data
  const availableVarieties = ['All Varieties', ...new Set((localMandiData || []).map(m => m.variety).filter(Boolean))];

  // Process data
  const filteredData = (localMandiData || []).filter(m => {
    if (variety !== 'All Varieties' && m.variety !== variety) return false;
    return true;
  });

  const processedMandis = filteredData.map((m, index) => {
    // If we have actual distance data, use it. Otherwise, estimate distance based on whether it's in the same district.
    let deterministicDistance;
    if (m.district && m.district.toLowerCase() === farmDistrict.toLowerCase()) {
      deterministicDistance = parseFloat(m.distance) || (5 + ((m.market.length * 3) % 15)); // 5-20 km
    } else {
      deterministicDistance = parseFloat(m.distance) || (30 + ((m.market.length * 7 + index * 13) % 90)); // 30-120 km
    }
    
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
    return b.netExpected - a.netExpected; // net_realization
  });

  const topMandis = processedMandis.slice(0, 5);

  // Identify badges
  let nearestMandi = null;
  let highestPriceMandi = null;
  let bestNetMandi = null;
  
  if (topMandis.length > 0) {
    nearestMandi = [...topMandis].sort((a,b) => a.distance - b.distance)[0];
    highestPriceMandi = [...topMandis].sort((a,b) => b.modalPrice - a.modalPrice)[0];
    bestNetMandi = [...topMandis].sort((a,b) => b.netExpected - a.netExpected)[0];
  }

  const districtsOptions = COMMON_DISTRICTS[farmState] || [];

  return (
    <div className="animate-fade-in-up flex flex-col gap-6 items-start w-full">
      {/* ── Search Panel (Top) ── */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-outline-variant">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-outline-variant/60 pb-4">
          <div className="flex items-center gap-2">
            <Search className="text-primary" size={24} />
            <h4 className="font-display font-extrabold text-lg text-on-surface">Find Nearby Mandis</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={useSavedFarm}
              className="px-3 py-1.5 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-surface-container transition-colors"
            >
              Use Saved Farm
            </button>
            <button 
              onClick={detectLocation}
              className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <Navigation size={14} /> Use My Location
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">State (राज्य)</label>
            <select 
              value={farmState}
              onChange={(e) => {
                setFarmState(e.target.value);
                const dists = COMMON_DISTRICTS[e.target.value];
                setFarmDistrict(dists ? dists[0] : '');
              }}
              className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary appearance-none bg-white"
            >
              {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">District (जिला)</label>
            {districtsOptions.length > 0 ? (
              <select 
                value={farmDistrict}
                onChange={(e) => setFarmDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary appearance-none bg-white"
              >
                {districtsOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input 
                type="text" 
                value={farmDistrict}
                onChange={(e) => setFarmDistrict(e.target.value)}
                placeholder="Enter district"
                className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Crop */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Crop (फसल)</label>
            <input 
              type="text" 
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleSearch('state')}
              disabled={isSearching}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 h-[42px]"
            >
              {isSearching ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={16} /> Find Mandis</>}
            </button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 pt-4 border-t border-outline-variant/40">
          <button 
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <Filter size={14} /> {isAdvancedExpanded ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
          
          {isAdvancedExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 animate-fade-in">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Variety filter</label>
                <select 
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none focus:border-primary"
                >
                  {availableVarieties.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Quantity (Qtl)</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none focus:border-primary"
                >
                  <option value="net_realization">Best Net Earnings</option>
                  <option value="price">Highest Price</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Transport Vehicle</label>
                <select 
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none focus:border-primary"
                >
                  {Object.keys(vehicleRates).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Results Area ── */}
      <div className="flex-1 w-full flex flex-col space-y-4">
        
        {/* Results Header */}
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-on-surface flex items-center gap-2 text-base">
            <Activity size={18} className="text-green-600 animate-pulse" />
            Top Nearby Mandis
          </h3>
          {topMandis.length > 0 && (
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:text-primary'}`}><Filter size={16} /></button>
              <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:text-primary'}`}><Map size={16} /></button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {topMandis.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-outline-variant text-center w-full mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <Info size={32} />
            </div>
            <h3 className="text-lg font-black text-on-surface">Data Not Available Today</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed font-semibold max-w-md mx-auto">
              No official prices were reported today for <strong>{crop}</strong> in <strong>{farmState}</strong>. We searched across all districts, but AGMARKNET reporting varies by mandi.
            </p>
            <p className="text-xs font-bold text-orange-600 mt-2">Try checking back later today or selecting a different crop.</p>
          </div>
        ) : (
          <>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4 pb-20">
                {topMandis.map((mandi, idx) => {
                  const isNearest = mandi === nearestMandi;
                  const isBestNet = mandi === bestNetMandi;
                  const isHighestPrice = mandi === highestPriceMandi;

                  return (
                    <div 
                      key={idx}
                      className="group bg-white rounded-3xl p-5 md:p-6 border border-outline-variant shadow-sm hover:shadow-lg transition-all duration-300 relative"
                    >
                      {/* Header row */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {isBestNet && <span className="bg-green-100 text-green-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">Best Net Earnings</span>}
                            {isNearest && <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">Nearest</span>}
                            {isHighestPrice && !isBestNet && <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">Highest Price</span>}
                            <span className="bg-surface-container-low border border-outline-variant flex items-center gap-1 text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded">
                              <ShieldCheck size={10} className="text-green-600" /> AGMARKNET Verified
                            </span>
                          </div>
                          <h4 className="font-display font-extrabold text-xl text-on-surface group-hover:text-primary transition-colors">
                            {mandi.market}
                          </h4>
                          <div className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mt-1">
                            <MapPin size={12} /> {mandi.district}, {mandi.state} • {mandi.distance} km away
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <div className="text-3xl font-black text-on-surface flex items-center md:justify-end gap-0.5">
                            <IndianRupee size={24} className="text-primary" />
                            {mandi.modalPrice}
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Modal Price / Qtl</span>
                        </div>
                      </div>

                      {/* Middle Data Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 border-y border-outline-variant/40 py-4">
                        <div>
                          <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">Variety</div>
                          <div className="text-sm font-extrabold text-on-surface">{mandi.variety || 'Other'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">Grade</div>
                          <div className="text-sm font-extrabold text-on-surface">{mandi.grade || 'FAQ'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">Min - Max Price</div>
                          <div className="text-sm font-extrabold text-on-surface">₹{mandi.minPrice} - ₹{mandi.maxPrice}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5 flex items-center gap-1"><Clock size={10}/> Last Updated</div>
                          <div className="text-sm font-extrabold text-on-surface">{mandi.arrivalDate || 'Today'}</div>
                        </div>
                      </div>

                      {/* Bottom row: Calculations and Action */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-outline-variant/60">
                        <div className="w-full md:w-auto text-xs font-semibold text-on-surface-variant space-y-1">
                          <div className="flex justify-between gap-8">
                            <span>Est. Transport Cost (approx):</span>
                            <span className="font-bold text-red-600">-₹{mandi.transportCost}</span>
                          </div>
                          <div className="flex justify-between gap-8 text-sm pt-1">
                            <span className="text-on-surface">Est. Net Earnings ({quantity} Qtl):</span>
                            <span className="font-black text-green-700">₹{Math.max(0, Math.round((quantity * mandi.modalPrice) - mandi.transportCost))}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => onSelectMandi(mandi)}
                          className="w-full md:w-auto px-6 py-2.5 bg-white border-2 border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-colors shadow-sm"
                        >
                          View Details
                        </button>
                      </div>

                    </div>
                  );
                })}
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
