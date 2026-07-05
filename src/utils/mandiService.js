// KisanMitra AGMARKNET Market Intelligence Service
// Fetches live mandi prices from data.gov.in via the backend proxy server
// NO fallback simulation data — if API unavailable, returns [] so UI can show "Data Not Available"

const MANDI_CACHE_KEY = 'km_mandi_cache_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// ── Commodity name mapping (farm crop ID → AGMARKNET commodity name) ──
const COMMODITY_MAP = {
  wheat: 'Wheat',
  rice: 'Paddy(Dhan)(Common)',
  maize: 'Maize',
  cotton: 'Cotton',
  soybean: 'Soyabean',
  sugarcane: 'Sugarcane',
  tomato: 'Tomato',
  chilli: 'Chillies(Green)',
  mustard: 'Mustard',
  gram: 'Bengal Gram(Gram)(Whole)',
  bajra: 'Bajra(Pearl Millet/Cumbu)'
};

// ── Fetch current daily mandi prices ──────────────────────────────────────────
export async function fetchMandiPrices(commodity, state, district, limit = 30) {
  const agmarkCommodity = COMMODITY_MAP[commodity?.toLowerCase()] || commodity;
  const cacheKey = `${MANDI_CACHE_KEY}prices_${agmarkCommodity}_${state}_${district}`;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CACHE_EXPIRY_MS) {
        console.log(`[MandiService] Cache HIT: ${cacheKey}`);
        return parsed.data;
      }
    }
  } catch (e) { /* ignore */ }

  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agmarkCommodity) params.set('commodity', agmarkCommodity);
    if (state) params.set('state', state);
    if (district) params.set('district', district);

    console.log(`[MandiService] Fetching prices: ${agmarkCommodity} in ${state}/${district}`);
    const res = await fetch(`/api/mandi/prices?${params.toString()}`);

    if (res.ok) {
      const raw = await res.json();
      const records = raw.records || [];
      if (records.length > 0) {
        const parsed = records.map(r => ({
          state: r.state || r.State || '',
          district: r.district || r.District || '',
          market: r.market || r.market_name || r.Market || '',
          commodity: r.commodity || r.Commodity || '',
          variety: r.variety || r.Variety || '',
          grade: r.grade || r.Grade || '',
          arrivalDate: r.arrival_date || r.Arrival_Date || '',
          minPrice: parseFloat(r.min_price || r.Min_Price || 0),
          maxPrice: parseFloat(r.max_price || r.Max_Price || 0),
          modalPrice: parseFloat(r.modal_price || r.Modal_Price || 0)
        }));

        // Cache the parsed result
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: parsed }));
        } catch (e) { /* storage full */ }

        return parsed;
      }
    }
  } catch (err) {
    console.warn('[MandiService] API fetch failed:', err.message);
  }

  // No API data available — return empty array so UI shows "Data Not Available"
  return [];
}

// ── Fetch variety-wise prices ─────────────────────────────────────────────────
export async function fetchVarietyPrices(commodity, variety, state, limit = 20) {
  const agmarkCommodity = COMMODITY_MAP[commodity?.toLowerCase()] || commodity;
  const cacheKey = `${MANDI_CACHE_KEY}variety_${agmarkCommodity}_${variety}_${state}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CACHE_EXPIRY_MS) return parsed.data;
    }
  } catch (e) { /* ignore */ }

  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agmarkCommodity) params.set('commodity', agmarkCommodity);
    if (variety) params.set('variety', variety);
    if (state) params.set('state', state);

    const res = await fetch(`/api/mandi/variety?${params.toString()}`);
    if (res.ok) {
      const raw = await res.json();
      const records = (raw.records || []).map(r => ({
        state: r.state || r.State || '',
        district: r.district || r.District || '',
        market: r.market || r.market_name || r.Market || '',
        commodity: r.commodity || r.Commodity || '',
        variety: r.variety || r.Variety || '',
        arrivalDate: r.arrival_date || r.Arrival_Date || '',
        minPrice: parseFloat(r.min_price || r.Min_Price || 0),
        maxPrice: parseFloat(r.max_price || r.Max_Price || 0),
        modalPrice: parseFloat(r.modal_price || r.Modal_Price || 0)
      }));

      if (records.length > 0) {
        try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: records })); } catch (e) { }
        return records;
      }
    }
  } catch (err) {
    console.warn('[MandiService] Variety API failed:', err.message);
  }

  // No API data — return empty so UI shows "Data Not Available"
  return [];
}

// ── Fetch Cold Storage Facilities ─────────────────────────────────────────────
export async function fetchColdStorageFacilities(state, district) {
  const cacheKey = `${MANDI_CACHE_KEY}storage_${state}_${district}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) return parsed.data; // 24 hr cache
    }
  } catch (e) { /* ignore */ }

  try {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    if (district) params.set('district', district);

    const res = await fetch(`/api/storage/facilities?${params.toString()}`);
    if (res.ok) {
      const raw = await res.json();
      const records = (raw.records || []).map(r => ({
        state: r.state || r.State || '',
        district: r.district || r.District || '',
        facilityName: r.facility_name || r.Facility_Name || 'Govt Approved Cold Storage',
        capacityMT: parseFloat(r.capacity_mt || r.Capacity_MT || 0),
        availableSpaceMT: parseFloat(r.available_space_mt || r.Available_Space_MT || 0),
        costPerQtlPerMonth: parseFloat(r.cost_qtl_month || r.Cost_Qtl_Month || 0),
        distanceKm: parseFloat(r.distance_km || r.Distance_Km || 0)
      }));

      if (records.length > 0) {
        try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: records })); } catch (e) { }
        return records;
      }
    }
  } catch (err) {
    console.warn('[MandiService] Cold Storage API failed:', err.message);
  }

  // No API data — return empty so UI shows "Data Not Available"
  return [];
}

// ── Aggregated market comparison ──────────────────────────────────────────────
export function getMandiComparison(priceRecords, farmDistrict) {
  if (!priceRecords || priceRecords.length === 0) return [];

  // Group by market, take highest modal price per market
  const byMarket = {};
  priceRecords.forEach(r => {
    const key = r.market || 'Unknown';
    if (!byMarket[key] || r.modalPrice > byMarket[key].modalPrice) {
      byMarket[key] = r;
    }
  });

  const markets = Object.values(byMarket).map(m => {
    const sameDistrict = m.district?.toLowerCase() === farmDistrict?.toLowerCase();
    // Transport cost based on distance (use real distance if available)
    const distKm = m.distanceKm || (sameDistrict ? 8 : 30);
    const transportCost = Math.round(distKm * 3.5); // ₹3.5/km estimated average
    return {
      ...m,
      transportCost,
      netPrice: m.modalPrice - transportCost,
      distance: `${distKm} km`
    };
  });

  return markets.sort((a, b) => b.netPrice - a.netPrice);
}

// ── Factual daily price aggregation (no AI predictions) ───────────────────────
export function getMarketAdvisory(commodity, priceRecords, weatherData) {
  if (!priceRecords || priceRecords.length === 0) {
    return { action: 'HOLD', reasoning: 'No local market records reported.', confidence: 0 };
  }

  const avgModal = priceRecords.reduce((s, r) => s + r.modalPrice, 0) / priceRecords.length;
  const maxModal = Math.max(...priceRecords.map(r => r.modalPrice));
  const minModal = Math.min(...priceRecords.map(r => r.modalPrice));
  const spread = maxModal - minModal;

  const rainForecast = weatherData?.forecast?.[0]?.rainProbability || 0;
  const heavyRainExpected = rainForecast > 70;

  return {
    avgModalPrice: Math.round(avgModal),
    maxModalPrice: maxModal,
    minModalPrice: minModal,
    spread,
    marketsAnalyzed: priceRecords.length,
    weatherImpact: heavyRainExpected ? 'Rain forecasted → use covered vehicles' : 'Clear weather → safe transit'
  };
}

// ── Fetch UPAg Data Share Source ──────────────────────────────────────────────
export async function fetchUpagSourceData(sourceName, inputPayload) {
  try {
    const res = await fetch(`/api/upag/sources/${sourceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputPayload)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[MandiService] UPAg source fetch failed:', err.message);
  }
  return null;
}

// ── Fetch Commercial Crop MSP Data (data.gov.in) ──────────────────────────────
export async function fetchCommercialMsp() {
  try {
    const res = await fetch('/api/mandi/msp/commercial');
    if (res.ok) {
      const data = await res.json();
      return data.records || [];
    }
  } catch (err) {
    console.warn('[MandiService] Commercial MSP fetch failed:', err.message);
  }
  return [];
}

// ── Fetch Historical Variety Prices (data.gov.in) ─────────────────────────────
export async function fetchHistoricalPrices(commodity, state, district) {
  try {
    const params = new URLSearchParams({ limit: '500' }); // fetch more for better year coverage
    if (commodity) params.set('commodity', commodity);
    if (state) params.set('state', state);
    if (district) params.set('district', district);
    const url = `/api/mandi/variety?${params.toString()}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.records || [];
    }
  } catch (err) {
    console.warn('[MandiService] Historical prices fetch failed:', err.message);
  }
  return [];
}
