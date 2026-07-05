import React, { useState } from 'react';
import { 
  Sun, Cloud, CloudRain, Wind, Droplet, Compass, Sunrise, Sunset, 
  RefreshCw, AlertCircle, CheckCircle2, HelpCircle, Activity, Info, Calendar, ArrowRight
} from 'lucide-react';
import { t } from '../../utils/translations';

// Helper to return weather condition icons
const getWeatherIcon = (cond = '') => {
  const c = cond.toLowerCase();
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle') || c.includes('thunderstorm')) {
    return <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />;
  }
  if (c.includes('cloud') || c.includes('overcast')) {
    return <Cloud className="w-8 h-8 text-slate-400" />;
  }
  return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
};

export default function WeatherIntelligence({
  profile,
  farms = [],
  selectedFarmIndex = 0,
  weatherData,
  weatherLoading,
  fetchWeather,
  setActiveDashboardTab,
  language
}) {
  const activeFarm = farms[selectedFarmIndex];

  if (weatherLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-4 bg-white border border-outline-variant/60 rounded-card shadow-sm">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <h3 className="font-display font-extrabold text-on-surface text-lg">AI Syncing IMD Forecasts...</h3>
        <p className="text-xs text-on-surface-variant max-w-xs text-center font-medium">
          Retrieving official district rainfall departures and weather forecasts from India Meteorological Department (IMD) API.
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white border rounded-card p-6 shadow-sm text-center py-10 space-y-3">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="font-display font-extrabold text-lg text-on-surface">No Weather Data Available</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          Please add a farm and location profile to enable local weather forecasts.
        </p>
      </div>
    );
  }

  const { current, forecast, rainfall, irrigation, alerts, syncTimestamp, stationName, region } = weatherData;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      
      {/* 1. Header with sync status & farm meta */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
              🏛️ Official IMD API Integration
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold">
              Station: {stationName} ({region})
            </span>
          </div>
          <h2 className="font-display font-extrabold text-xl text-on-surface mt-1.5 flex items-center gap-2">
            {t("Weather Intelligence Dashboard", language)}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Active Farm: <strong className="text-on-surface">{activeFarm?.name || 'Unnamed Farm'}</strong> ({activeFarm?.district}, {activeFarm?.state}) | Coordinates: {activeFarm?.lat || 20.00}°N, {activeFarm?.lng || 73.78}°E
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant font-bold block">Last Synchronized:</span>
            <span className="text-xs font-black text-on-surface">{syncTimestamp}</span>
          </div>
          <button 
            onClick={fetchWeather}
            className="p-2.5 bg-surface-container hover:bg-surface-container-high rounded-full border border-outline-variant transition-all"
            title="Refresh Forecast"
          >
            <RefreshCw className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* 2. Extreme Weather Alerts section */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-red-50 border border-red-200 rounded-card p-5 flex gap-4 items-start animate-pulse">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md">
                    {alert.severity} Alert
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-red-950">{alert.event}</h4>
                </div>
                <p className="text-xs text-red-900 leading-relaxed font-semibold">
                  {alert.description}
                </p>
                <div className="p-3 bg-white/70 rounded-xl border border-red-200/50 text-[11px] text-red-950 font-bold space-y-1">
                  <span className="block text-red-800 text-[10px] uppercase font-black tracking-wider">Farming Instructions:</span>
                  <p>{alert.instructions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Current Weather Detailed Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Temperature Hero Card */}
        <div className="bg-gradient-to-br from-green-500/10 via-primary/5 to-white border border-outline-variant/60 rounded-card p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8" />
          
          <div className="space-y-3">
            <span className="text-xs text-primary font-bold uppercase tracking-widest block">Current Weather</span>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-5xl font-black tracking-tight text-on-surface">{current.temp}°C</div>
                <span className="text-xs font-bold text-on-surface-variant mt-1 block">Feels like: {current.feelsLike}°C</span>
              </div>
              {getWeatherIcon(current.condition)}
            </div>
            
            <div className="text-sm font-black text-primary uppercase">{current.condition}</div>
            <p className="text-xs text-on-surface-variant font-medium">
              Daily limits: H: {current.tempMax}°C | L: {current.tempMin}°C
            </p>
          </div>

          <div className="border-t border-outline-variant/50 pt-4 mt-6 flex justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5 font-bold">
              <Sunrise className="w-4 h-4 text-amber-500" />
              {current.sunrise}
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <Sunset className="w-4 h-4 text-slate-500" />
              {current.sunset}
            </span>
          </div>
        </div>

        {/* Current Weather Details Grid (Grid of 4 items) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Detail 1: Humidity */}
          <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Droplet className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-on-surface">IMD Humidity Levels</h4>
                <span className="text-[10px] text-on-surface-variant font-medium">Readings at 8:30 AM & 5:30 PM</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-on-surface">
                  <span>Morning (8:30 AM):</span>
                  <span>{current.humidityMorning}%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${current.humidityMorning}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-on-surface">
                  <span>Evening (5:30 PM):</span>
                  <span>{current.humidityEvening}%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${current.humidityEvening}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Detail 2: 24h Rainfall */}
          <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-50 p-2 rounded-lg">
                <CloudRain className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-on-surface">Precipitation Received</h4>
                <span className="text-[10px] text-on-surface-variant font-medium">Last 24 hours rainfall measurement</span>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-3xl font-black text-cyan-900">{current.rainfall24h} mm</div>
              <p className="text-[11px] text-cyan-700 leading-relaxed font-semibold">
                {current.rainfall24h > 0 
                  ? `Accumulated moisture has replenished soil layers. Drip scheduling might be optimized.`
                  : `No precipitation registered in the district during the last measurement cycle.`
                }
              </p>
            </div>
          </div>

          {/* Detail 3: Wind Conditions */}
          <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-teal-50 p-2 rounded-lg">
                <Wind className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-on-surface">Wind Velocity & Direction</h4>
                <span className="text-[10px] text-on-surface-variant font-medium">Critical parameter for spraying operations</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-teal-900">{current.windSpeed} km/h</div>
                <span className="text-xs font-bold text-on-surface-variant">Direction: {current.windDir}</span>
              </div>
              <Compass className="w-12 h-12 text-teal-600/30 animate-pulse" />
            </div>
          </div>

          {/* Detail 4: Dynamic Crop Health Status */}
          <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-on-surface">Weather Impact Status</h4>
                <span className="text-[10px] text-on-surface-variant font-medium">Derived from humidity + temp index</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Crop Vulnerability:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  current.humidityMorning > 85 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>
                  {current.humidityMorning > 85 ? 'Fungal Risk: Medium' : 'Optimized'}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-semibold">
                {current.humidityMorning > 85 
                  ? "Elevated humidity increases stem rust spore reproduction probability in wheat crops." 
                  : "Temperature and humidity limits remain within the optimal growth band."
                }
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Rainfall Analytics & IMD Category visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Departure Card */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl font-bold">query_stats</span>
            Rainfall Departure
          </h3>

          <div className="text-center space-y-3 py-4">
            <div className="text-4xl font-black text-on-surface">
              {rainfall.departurePercent > 0 ? '+' : ''}{rainfall.departurePercent}%
            </div>
            
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-black inline-block ${rainfall.departureClass}`}>
              {rainfall.departureLabel}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low/50 border rounded-xl text-[11px] leading-relaxed text-on-surface-variant font-semibold flex gap-2">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>IMD Category:</strong> Departure classification defines season moisture limits.
            </div>
          </div>
        </div>

        {/* Interactive Stats comparisons */}
        <div className="md:col-span-2 bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <h3 className="font-display font-extrabold text-base text-on-surface">Rainfall Analytics Comparison</h3>

          <div className="space-y-4">
            {/* Daily Actual vs Normal */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-on-surface">
                <span>Daily Rainfall (Actual vs Normal):</span>
                <span>{rainfall.dailyActual}mm / {rainfall.dailyNormal}mm</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                <div className="bg-cyan-600 h-full" style={{ width: `${Math.min(100, (rainfall.dailyActual / (rainfall.dailyNormal || 1)) * 50)}%` }} />
                <div className="bg-slate-300 h-full" style={{ width: `${Math.min(100, (rainfall.dailyNormal / (rainfall.dailyActual || 1)) * 50)}%` }} />
              </div>
            </div>

            {/* Monthly Actual vs Normal */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-on-surface">
                <span>Monthly Cumulative Rainfall (Actual vs Normal):</span>
                <span>{rainfall.monthlyActual}mm / {rainfall.monthlyNormal}mm</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min(100, (rainfall.monthlyActual / (rainfall.monthlyNormal || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f0fdf4] border border-primary/20 rounded-xl flex gap-3 items-start mt-4">
            <span className="material-symbols-outlined text-primary text-xl font-bold mt-0.5">tips_and_updates</span>
            <div>
              <span className="block text-xs font-black text-primary mb-0.5">IMD Rainfall Advisory:</span>
              <p className="text-xs text-green-950 font-semibold leading-relaxed">
                {rainfall.insight}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 5. AI Irrigation Advisor */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
        <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-xl font-bold animate-pulse">water_drop</span>
          AI Irrigation Advisor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
            <span className="text-[10px] text-blue-800 font-extrabold uppercase tracking-wider block">Recommended Action</span>
            <div className="text-sm font-black text-blue-950 leading-tight">{irrigation.nextIrrigation}</div>
            
            {irrigation.estimatedWater > 0 && (
              <div className="text-xs font-bold bg-white text-blue-900 border border-blue-200 px-3 py-1 rounded-full mt-2">
                🚰 {irrigation.estimatedWater.toLocaleString('en-IN')} Litres/Acre
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-on-surface block">Decision Reasoning Model:</span>
              <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                {irrigation.reasoning}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-on-surface-variant pt-2 border-t border-outline-variant/40">
              <span className="bg-surface-container px-2.5 py-1 rounded-md">Soil Profile: {activeFarm?.soil?.type || 'Loamy / Clay'}</span>
              <span className="bg-surface-container px-2.5 py-1 rounded-md">Irrigation Method: {activeFarm?.water?.irrigationMethods?.join(', ') || 'Drip'}</span>
              <span className="bg-surface-container px-2.5 py-1 rounded-md">Stage: {activeFarm?.crop?.stage || 'Vegetative'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 7-Day Weather Timeline */}
      <section className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl font-bold">calendar_month</span>
            7-Day Weather Timeline & Suitability Advisor
          </h3>
          <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Click any day to view farm action ratings and AI weather advice</p>
        </div>

        <div className="space-y-4">
          {forecast.map((dayObj, index) => (
            <div key={dayObj.date} className="p-4 rounded-xl border border-outline-variant/50 hover:border-primary/50 hover:shadow-2xs transition-all bg-white flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              
              {/* Day & Condition */}
              <div className="flex items-center gap-4 w-full md:w-1/4">
                {getWeatherIcon(dayObj.condition)}
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface">{dayObj.day}</h4>
                  <span className="text-[10px] text-on-surface-variant font-bold block">{dayObj.date}</span>
                  <span className="text-[10px] text-primary font-black uppercase mt-0.5 block leading-none">{dayObj.condition}</span>
                </div>
              </div>

              {/* Rain Probability & Temperature limits */}
              <div className="flex gap-6 w-full md:w-1/4 text-xs font-bold text-on-surface">
                <div>
                  <span className="text-[9px] text-on-surface-variant block uppercase font-bold">Max / Min Temp:</span>
                  <span>{dayObj.tempMax}°C / {dayObj.tempMin}°C</span>
                </div>
                <div>
                  <span className="text-[9px] text-on-surface-variant block uppercase font-bold">Rain Chance:</span>
                  <span className={dayObj.rainProbability >= 60 ? 'text-blue-600' : 'text-on-surface'}>
                    {dayObj.rainProbability}%
                  </span>
                </div>
              </div>

              {/* Suitability Badges */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-1/3">
                {[
                  { key: 'sowing', label: 'Sowing' },
                  { key: 'irrigation', label: 'Irrigation' },
                  { key: 'spraying', label: 'Spraying' },
                  { key: 'fertilizing', label: 'Fertilizing' },
                  { key: 'harvesting', label: 'Harvesting' }
                ].map((op) => {
                  const rating = dayObj.suitability[op.key];
                  const color = rating === 'suitable' ? 'bg-green-50 border-green-200 text-green-700' :
                                rating === 'caution' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                'bg-red-50 border-red-200 text-red-700';
                  return (
                    <span key={op.key} className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase shrink-0 ${color}`}>
                      {op.label}
                    </span>
                  );
                })}
              </div>

              {/* AI advisories */}
              <div className="w-full md:w-1/4 p-2.5 bg-surface-container-low/40 border border-outline-variant/30 rounded-lg text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                <span className="text-primary font-black uppercase text-[9px] block mb-0.5">KM AI Advisory:</span>
                {dayObj.aiRecommendation}
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
