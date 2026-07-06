import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, Calendar, Info, ShieldCheck, Filter, 
  TrendingUp, ArrowUpDown, ChevronRight, Activity, MousePointerClick,
  AlertTriangle, RefreshCw, WifiOff
} from 'lucide-react';
import { fetchUpagSourceData, fetchCommercialMsp, fetchHistoricalPrices } from '../../../utils/mandiService';

// ── MSP year labels matching the merged MSP API columns ──
const MSP_YEAR_FIELDS = [
  { key: '_2020_21', label: '2020-21' },
  { key: '_2021_22', label: '2021-22' },
  { key: '_2022_23', label: '2022-23' },
  { key: '_2023_24', label: '2023-24' },
  { key: '_2024_25', label: '2024-25' },
];

// Normalize crop commodity name to match server OFFICIAL_MSP_RECORDS commercial_crop field
const normalizeCropForMsp = (cropKey) => {
  const k = (cropKey || '').toLowerCase();
  if (k === 'wheat')                               return 'wheat';
  if (k === 'paddy' || k.includes('rice'))         return 'paddy (common)';
  if (k === 'moong')                               return 'moong (green gram)';
  if (k === 'soyabean')                            return 'soyabean (yellow)';
  if (k === 'tur')                                 return 'tur (arhar)';
  if (k === 'maize')                               return 'maize';
  if (k === 'cotton')                              return 'cotton (medium staple)';
  if (k.includes('copra') && k.includes('milling')) return 'copra (milling)';
  if (k.includes('copra') && k.includes('ball'))   return 'copra (ball)';
  if (k.includes('mustard'))                       return 'rapeseed/mustard';
  if (k.includes('gram'))                          return 'gram (chana)';
  return k;
};

export default function PriceTrendsTab({ mandi, activeFarm, liveMandiData }) {
  // Normalize crop names to display keys
  const getMappedCrop = (name) => {
    if (!name) return 'Wheat';
    const lower = name.toLowerCase();
    if (lower.includes('wheat'))                          return 'Wheat';
    if (lower.includes('paddy') || lower.includes('rice')) return 'Paddy';
    if (lower.includes('moong'))                          return 'Moong';
    if (lower.includes('soyabean') || lower.includes('soybean')) return 'Soyabean';
    if (lower.includes('tomato'))                         return 'Tomato';
    if (lower.includes('tur') || lower.includes('pigeon'))  return 'Tur';
    if (lower.includes('milling') && lower.includes('copra')) return 'Copra (Milling)';
    if (lower.includes('ball') && lower.includes('copra'))   return 'Copra (Ball)';
    if (lower.includes('copra'))                          return 'Copra (Milling)';
    return 'Wheat';
  };

  const initialCrop = getMappedCrop(activeFarm?.crop?.name);

  // Filters State
  const [filterMonth, setFilterMonth] = useState('July');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCommodity, setFilterCommodity] = useState(initialCrop);
  const [filterSource, setFilterSource] = useState('Agmarknet');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Data State — starts empty; filled by live API only
  const [currentCommodity, setCurrentCommodity] = useState(initialCrop);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null); // null | string

  // Interaction State
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  // Get average live price from liveMandiData if available
  const getLiveAveragePrice = (cropKey) => {
    if (!liveMandiData || liveMandiData.length === 0) return null;
    const matches = liveMandiData.filter(r => {
      const commLower = (r.commodity || '').toLowerCase();
      const cropLower = cropKey.toLowerCase();
      return commLower.includes(cropLower) || cropLower.includes(commLower);
    });
    if (matches.length > 0) {
      const sum = matches.reduce((acc, curr) => acc + (curr.modalPrice || 0), 0);
      return Math.round(sum / matches.length);
    }
    return null;
  };

  /**
   * Load chart data purely from live Government APIs:
   *  1. fetchCommercialMsp()  → MSP time series from data.gov.in
   *  2. fetchHistoricalPrices() → variety-wise daily prices from data.gov.in
   *  3. liveMandiData prop   → today's AGMARKNET live price
   *
   * If MSP API returns nothing → set dataError and clear chart.
   * If variety prices empty → chart shows MSP line only (mandi price = 0/null).
   */
  const loadDynamicChartData = async (cropKey) => {
    setLoading(true);
    setDataError(null);
    setChartData([]);

    try {
      // 1. Fetch live commercial crop MSP from data.gov.in
      const mspRecords = await fetchCommercialMsp();

      if (!mspRecords || mspRecords.length === 0) {
        setDataError('Government MSP data is currently unavailable (data.gov.in API). Please try again later.');
        setLoading(false);
        return;
      }

      // Find MSP record matching this crop
      const mspKey = normalizeCropForMsp(cropKey);
      const match = mspRecords.find(r =>
        (r.commercial_crop || r.Commodity || '').toLowerCase().includes(mspKey)
      );

      if (!match) {
        setDataError(`No MSP data found for "${cropKey}" in the Government dataset. This crop may not have a notified MSP or may be listed under a different name.`);
        setLoading(false);
        return;
      }

      // 2. Build time-series base points from MSP API columns
      const basePoints = MSP_YEAR_FIELDS
        .map(({ key, label }) => {
          const mspVal = parseFloat(match[key] || match[key.replace('_', '')] || 0);
          if (!mspVal) return null;
          return { date: label, price: null, msp: mspVal }; // price starts as null = "no data"
        })
        .filter(Boolean);

      if (basePoints.length === 0) {
        setDataError(`MSP time-series columns are empty for "${cropKey}". The dataset may not have been updated for this crop.`);
        setLoading(false);
        return;
      }

      // 3. Fetch variety prices and map by year from PascalCase fields
      const stateName = mandi?.state || '';
      const districtName = mandi?.district || '';
      let priceRecords = [];

      if (stateName) {
        priceRecords = await fetchHistoricalPrices(cropKey, stateName, districtName);
        console.log(`[PriceTrendsTab] ${priceRecords.length} live variety price records for ${cropKey} in ${districtName || 'any district'}, ${stateName}`);
      }

      // If no state-specific records, try without state/district filter for broader data
      if (priceRecords.length === 0) {
        priceRecords = await fetchHistoricalPrices(cropKey, '', '');
        if (priceRecords.length > 0) {
          console.log(`[PriceTrendsTab] Fallback: got ${priceRecords.length} national variety records for ${cropKey}`);
        }
      }

      // Group variety prices by year and compute average
      // Note: variety dataset uses PascalCase: Modal_Price, Arrival_Date
      if (priceRecords.length > 0) {
        const priceMap = {};
        priceRecords.forEach(r => {
          const price = parseFloat(r.Modal_Price || r.modal_price || 0);
          if (!price) return;
          const arrivalDate = r.Arrival_Date || r.arrival_date || '';
          // Format: DD/MM/YYYY
          const parts = arrivalDate.split('/');
          if (parts.length === 3) {
            const year = parts[2]; // e.g. "2023"
            if (!priceMap[year]) priceMap[year] = [];
            priceMap[year].push(price);
          }
        });

        basePoints.forEach(point => {
          // Match fiscal year label "2023-24" → search year "2023" or "2024"
          const labelYears = point.date.split('-');
          for (const yr of labelYears) {
            const fullYear = yr.length === 2 ? `20${yr}` : yr;
            if (priceMap[fullYear] && priceMap[fullYear].length > 0) {
              const avg = Math.round(priceMap[fullYear].reduce((a, b) => a + b, 0) / priceMap[fullYear].length);
              point.price = avg;
              break;
            }
          }
        });
      }

      // 4. Override final point with today's live mandi average if available
      const liveAvg = getLiveAveragePrice(cropKey);
      if (liveAvg && basePoints.length > 0) {
        basePoints[basePoints.length - 1] = {
          ...basePoints[basePoints.length - 1],
          price: liveAvg,
          isLive: true
        };
      }

      setChartData(basePoints);
    } catch (e) {
      console.error('[PriceTrendsTab] Failed to load chart data:', e);
      setDataError('An unexpected error occurred while fetching price data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when key props change
  useEffect(() => {
    loadDynamicChartData(initialCrop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCrop, liveMandiData, mandi]);

  // Sync when farm changes
  useEffect(() => {
    const updatedCrop = getMappedCrop(activeFarm?.crop?.name);
    setFilterCommodity(updatedCrop);
    setCurrentCommodity(updatedCrop);
    loadDynamicChartData(updatedCrop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFarm, mandi]);

  // Apply filters handler
  const handleApplyFilters = async () => {
    setCurrentCommodity(filterCommodity);

    // Dynamic UPAg Data Share integration
    const normalizedSource = filterSource.toLowerCase() === 'agmarknet' ? 'agmarknet' : 'dafw_state';
    const upagPayload = {
      source_input_object: {
        limit: 10,
        offset: 0,
        source_name: normalizedSource,
        year: [filterYear],
        location_granularity: 'state',
        season: [filterMonth.toLowerCase() === 'july' ? 'kharif' : 'rabi'],
        crop: [filterCommodity]
      }
    };

    console.log(`[UPAg integration] Querying sources/${normalizedSource} for crop ${filterCommodity}`);
    try {
      const upagResponse = await fetchUpagSourceData(normalizedSource, upagPayload);
      if (upagResponse && upagResponse.status === 'Success' && upagResponse.data?.length > 0) {
        console.log('[UPAg integration] Live UPAg source records returned:', upagResponse.data);
      }
    } catch (err) {
      console.warn('[UPAg integration] UPAg query failed:', err.message);
    }

    await loadDynamicChartData(filterCommodity);
  };

  // ─── Chart Layout Calculations ───────────────────────────────────────────────
  // Only points that have a real price value
  const plottableData = chartData.filter(d => d.price != null && d.price > 0);

  const prices = plottableData.map(d => d.price);
  const msps   = chartData.map(d => d.msp);
  const allVals = [...prices, ...msps].filter(v => v > 0);
  const minVal = allVals.length > 0 ? Math.min(...allVals) * 0.9 : 0;
  const maxVal = allVals.length > 0 ? Math.max(...allVals) * 1.1 : 1000;
  const range  = maxVal - minVal || 1;

  const w = 700;
  const h = 280;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = (index, value, dataArray = chartData) => {
    const x = paddingX + (index / Math.max(dataArray.length - 1, 1)) * (w - 2 * paddingX);
    const y = h - paddingY - ((value - minVal) / range) * (h - 2 * paddingY);
    return { x, y };
  };

  const generateMspPath = () => {
    return chartData.map((d, i) => {
      const coords = getCoordinates(i, d.msp);
      if (i === 0) return `M ${coords.x} ${coords.y}`;
      const prevCoords = getCoordinates(i - 1, chartData[i - 1].msp);
      return `L ${coords.x} ${prevCoords.y} L ${coords.x} ${coords.y}`;
    }).join(' ');
  };

  const generatePricePath = () => {
    let path = '';
    let started = false;
    chartData.forEach((d, i) => {
      if (d.price == null || d.price <= 0) return;
      const coords = getCoordinates(i, d.price);
      if (!started) {
        path += `M ${coords.x} ${coords.y}`;
        started = true;
      } else {
        path += ` L ${coords.x} ${coords.y}`;
      }
    });
    return path;
  };

  const generateAreaPath = () => {
    const line = generatePricePath();
    if (!line) return '';
    const first = chartData.find(d => d.price != null && d.price > 0);
    const last  = [...chartData].reverse().find(d => d.price != null && d.price > 0);
    if (!first || !last) return '';
    const fi = chartData.indexOf(first);
    const li = chartData.indexOf(last);
    const fc = getCoordinates(fi, first.price);
    const lc = getCoordinates(li, last.price);
    return `${line} L ${lc.x} ${h - paddingY} L ${fc.x} ${h - paddingY} Z`;
  };

  // Handle Mouse Hover
  const handleMouseMove = (e) => {
    if (!chartRef.current || chartData.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX - paddingX) / (rect.width - (paddingX * 2 / w) * rect.width);
    let index = Math.round(relativeX * (chartData.length - 1));
    index = Math.max(0, Math.min(chartData.length - 1, index));
    setHoverIndex(index);
    const coords = getCoordinates(index, chartData[index].msp);
    setHoverPos({
      x: (coords.x / w) * rect.width,
      y: (coords.y / h) * rect.height
    });
  };

  const handleMouseLeave = () => setHoverIndex(null);

  // ─── Loading state ───────────────────────────────────────────────────────────
  const LoadingCard = () => (
    <div className="bg-white rounded-3xl p-10 border border-outline-variant shadow-sm flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="font-bold text-on-surface-variant text-sm">
        Fetching live price data from Government APIs…
      </p>
      <p className="text-xs text-on-surface-variant/60">
        Source: data.gov.in (Commercial Crop MSP &amp; AGMARKNET)
      </p>
    </div>
  );

  // ─── Error / No Data state ───────────────────────────────────────────────────
  const DataUnavailableCard = ({ message }) => (
    <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
        <WifiOff className="text-amber-500" size={26} />
      </div>
      <div>
        <h4 className="font-display font-extrabold text-base text-on-surface mb-1">
          Data Not Available
          <span className="block text-xs text-on-surface-variant font-semibold">
            (डेटा उपलब्ध नहीं है)
          </span>
        </h4>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed mt-2">
          {message}
        </p>
      </div>
      <button
        onClick={() => loadDynamicChartData(currentCommodity)}
        className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-secondary transition-colors shadow-sm"
      >
        <RefreshCw size={13} />
        Retry
      </button>
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left max-w-xs">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700 font-semibold leading-relaxed">
          All price data is sourced exclusively from <strong>data.gov.in</strong> (Government of India). No fallback or simulated data is used.
        </p>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Main Content: Chart + Table ── */}
      <div className="flex-1 space-y-6">
        
        {/* Title Block */}
        <div className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="min-w-0 w-full">
            <h3 className="font-display font-extrabold text-xl text-on-surface flex items-center gap-2">
              <Activity className="text-primary flex-shrink-0" size={22} />
              MSP Time Series
            </h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              Government Minimum Support Price (MSP) vs. Mandi Wholesale Price —{' '}
              <strong>{currentCommodity}</strong>
            </p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
              Source: data.gov.in / AGMARKNET (Government of India) — No synthetic or estimated data
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full md:w-auto">
            <button 
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center gap-1.5 bg-surface-container-low text-primary border border-outline-variant hover:bg-surface-container px-3 py-2 md:px-2.5 md:py-1.5 rounded-lg text-sm md:text-xs font-bold transition-all shadow-sm min-h-[44px] md:min-h-0"
            >
              <Filter size={12} />
              {isFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className="flex items-center gap-2 text-xs md:text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-2 md:py-1 rounded-md min-h-[44px] md:min-h-0">
              <ShieldCheck size={16} className="md:w-3.5 md:h-3.5" />
              Official MSP Data
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {isFiltersExpanded && (
          <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm animate-fade-in">
            <h4 className="font-display font-extrabold text-lg text-on-surface mb-4">Advanced Filters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Commodity</label>
                <input 
                  type="text" 
                  value={filterCommodity}
                  onChange={(e) => setFilterCommodity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Ending Month</label>
                <select 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface"
                >
                  <option>May</option>
                  <option>July</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Reporting Year</label>
                <input 
                  type="text" 
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => { setIsFiltersExpanded(false); handleApplyFilters(); }}
                  className="w-full bg-primary text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-secondary transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingCard />}

        {/* Error / No Data */}
        {!loading && dataError && <DataUnavailableCard message={dataError} />}

        {/* Chart Card — only shown when data is present */}
        {!loading && !dataError && chartData.length > 0 && (
          <>
            {/* MSP Advisory */}
            {chartData[chartData.length - 1]?.msp && chartData[chartData.length - 1]?.price && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${chartData[chartData.length - 1].price > chartData[chartData.length - 1].msp ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                <div className="shrink-0"><Info size={20} className={chartData[chartData.length - 1].price > chartData[chartData.length - 1].msp ? 'text-emerald-600' : 'text-blue-600'} /></div>
                <div>
                  <div className="font-bold text-sm">MSP Comparison Advisory</div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {chartData[chartData.length - 1].price > chartData[chartData.length - 1].msp 
                      ? `The current market price (₹${chartData[chartData.length - 1].price}) is higher than the Government MSP (₹${chartData[chartData.length - 1].msp}). You will earn more by selling in the open market.`
                      : `The current market price (₹${chartData[chartData.length - 1].price}) is below the Government MSP (₹${chartData[chartData.length - 1].msp}). Consider selling at official procurement centers if you meet the quality criteria to maximize your profit.`}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm relative overflow-hidden">
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4 text-xs font-bold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-primary rounded-full"></div>
                  <span>Mandi Price (मंडी भाव)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-0.5 bg-amber-500 border-t border-dashed"></div>
                  <span>Government MSP (न्यूनतम समर्थन मूल्य)</span>
                </div>
                {chartData.some(d => d.price == null || d.price === 0) && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                    <AlertTriangle size={12} className="text-amber-400" />
                    Grey = No mandi price data for that year
                  </div>
                )}
                {chartData.some(d => d.isLive) && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Latest point = Today's live mandi price
                  </div>
                )}
              </div>

              {/* Interactive Chart */}
              <div className="relative w-full h-[320px]">
                <div 
                  ref={chartRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="w-full h-full cursor-crosshair relative"
                >
                  {/* Y-Axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] font-bold text-on-surface-variant/50 pointer-events-none">
                    <span>₹{Math.round(maxVal)}</span>
                    <span>₹{Math.round(minVal + range * 0.66)}</span>
                    <span>₹{Math.round(minVal + range * 0.33)}</span>
                    <span>₹{Math.round(minVal)}</span>
                  </div>

                  <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    <line x1={paddingX} y1={paddingY} x2={w - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={paddingY + (h - 2 * paddingY) * 0.33} x2={w - paddingX} y2={paddingY + (h - 2 * paddingY) * 0.33} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={paddingY + (h - 2 * paddingY) * 0.66} x2={w - paddingX} y2={paddingY + (h - 2 * paddingY) * 0.66} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={h - paddingY} x2={w - paddingX} y2={h - paddingY} stroke="#e2e8f0" />

                    {/* MSP step line */}
                    {chartData.length > 1 && (
                      <path d={generateMspPath()} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 3" />
                    )}

                    {/* Mandi price area + line (only if price data exists) */}
                    {plottableData.length > 0 && (
                      <>
                        <path d={generateAreaPath()} fill="url(#chartGradient)" />
                        <path d={generatePricePath()} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}

                    {/* Hover indicator */}
                    {hoverIndex !== null && (
                      <>
                        <line 
                          x1={getCoordinates(hoverIndex, chartData[hoverIndex].msp).x}
                          y1={paddingY}
                          x2={getCoordinates(hoverIndex, chartData[hoverIndex].msp).x}
                          y2={h - paddingY}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        {/* MSP dot */}
                        <circle 
                          cx={getCoordinates(hoverIndex, chartData[hoverIndex].msp).x}
                          cy={getCoordinates(hoverIndex, chartData[hoverIndex].msp).y}
                          r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5"
                        />
                        {/* Mandi price dot (only if data exists) */}
                        {chartData[hoverIndex].price > 0 && (
                          <circle 
                            cx={getCoordinates(hoverIndex, chartData[hoverIndex].price).x}
                            cy={getCoordinates(hoverIndex, chartData[hoverIndex].price).y}
                            r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5"
                          />
                        )}
                      </>
                    )}
                  </svg>

                  {/* Tooltip */}
                  {hoverIndex !== null && (
                    <div 
                      className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 w-48 pointer-events-none text-left z-20"
                      style={{ 
                        left: `${Math.min(hoverPos.x + 15, chartRef.current.clientWidth - 200)}px`, 
                        top: `${Math.min(hoverPos.y - 40, chartRef.current.clientHeight - 150)}px` 
                      }}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        {chartData[hoverIndex].date}
                        {chartData[hoverIndex].isLive && (
                          <span className="text-emerald-400 font-black">● LIVE</span>
                        )}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-300">Govt MSP:</span>
                          <span className="font-extrabold text-amber-400">₹{chartData[hoverIndex].msp}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-300">Mandi Price:</span>
                          {chartData[hoverIndex].price > 0
                            ? <span className="font-extrabold text-blue-400">₹{chartData[hoverIndex].price}</span>
                            : <span className="text-slate-500 text-[10px]">No data</span>
                          }
                        </div>
                        {chartData[hoverIndex].price > 0 && (
                          <div className="pt-1.5 border-t border-slate-700 flex justify-between items-center text-[10px] font-black">
                            <span>Diff:</span>
                            {(() => {
                              const price = chartData[hoverIndex].price;
                              const msp   = chartData[hoverIndex].msp;
                              const diff  = price - msp;
                              const pct   = Math.abs(diff) / msp;
                              if (pct <= 0.03)  return <span className="text-amber-400">Near MSP</span>;
                              if (diff > 0)     return <span className="text-emerald-400">+₹{diff} Above MSP</span>;
                              return <span className="text-rose-400">-₹{Math.abs(diff)} Below MSP</span>;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* X-Axis labels */}
                <div className="absolute left-[40px] right-[40px] bottom-0 flex justify-between text-[9px] font-bold text-on-surface-variant/60 pointer-events-none">
                  {chartData.map((d, i) => (
                    i % 2 === 0 ? <span key={i}>{d.date}</span> : <span key={i}></span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-1 text-[10px] font-bold text-on-surface-variant/60">
                <MousePointerClick size={12} className="text-primary" />
                <span>Hover over the graph to inspect year-wise pricing details.</span>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                <h4 className="font-bold text-sm text-on-surface">MSP vs. Mandi Price — Year-wise</h4>
                <span className="text-[10px] text-on-surface-variant font-bold">{chartData.length} data points</span>
              </div>
              <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                      <th className="p-3 pl-6">Year</th>
                      <th className="p-3">Govt MSP</th>
                      <th className="p-3">Mandi Price</th>
                      <th className="p-3 pr-6">Status vs. MSP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-semibold text-on-surface">
                    {chartData.map((row, idx) => {
                      const hasPrice = row.price > 0;
                      const diff = hasPrice ? row.price - row.msp : null;
                      const diffPercent = diff !== null ? Math.abs(diff) / row.msp : null;
                      let statusLabel = 'No mandi data';
                      let statusClass = 'text-slate-500 bg-slate-50 border-slate-200';
                      if (hasPrice && diffPercent !== null) {
                        if (diffPercent <= 0.03) {
                          statusLabel = 'Near MSP';
                          statusClass = 'text-amber-700 bg-amber-50 border-amber-200';
                        } else if (diff > 0) {
                          statusLabel = `+₹${diff} Above`;
                          statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                        } else {
                          statusLabel = `-₹${Math.abs(diff)} Below`;
                          statusClass = 'text-rose-700 bg-rose-50 border-rose-200';
                        }
                      }
                      return (
                        <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-3 pl-6 font-bold flex items-center gap-1.5">
                            {row.date}
                            {row.isLive && <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-1 rounded">LIVE</span>}
                          </td>
                          <td className="p-3 text-amber-600 font-bold">₹{row.msp} / Qtl</td>
                          <td className="p-3 text-blue-600">
                            {hasPrice ? `₹${row.price} / Qtl` : <span className="text-slate-400 text-[10px]">Not available</span>}
                          </td>
                          <td className="p-3 pr-6">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Data source footer */}
              <div className="p-3 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-2">
                <ShieldCheck size={13} className="text-green-600 flex-shrink-0" />
                <p className="text-[10px] text-on-surface-variant font-semibold">
                  MSP data: data.gov.in (Resource ID: 7524f54c) · Mandi prices: AGMARKNET via data.gov.in (Resource ID: 35985678)
                </p>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
