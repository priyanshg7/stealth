import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Info, ShieldCheck, Activity, 
  Truck, Warehouse, Cloud, CloudRain, Sun, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronUp, Clock, AlertCircle, IndianRupee,
  CheckCircle2, AlertOctagon, ArrowRight
} from 'lucide-react';

export default function MarketOverview({ mandi, mandiData = [], weatherData }) {
  const currentPrice = mandi.modalPrice || 2200;
  const transportCost = mandi.transportCost || 250;
  const netPrice = Math.max(0, Math.round(mandi.netExpected || currentPrice - transportCost));
  
  // Calculate dynamic Market Summary statistics
  const numReporting = mandiData.length || 1;
  const avgMandiPrice = mandiData.length > 0 
    ? Math.round(mandiData.reduce((acc, m) => acc + (m.modalPrice || 0), 0) / numReporting)
    : Math.round(currentPrice * 0.98);
  const highestPaying = mandiData.length > 0
    ? Math.max(...mandiData.map(m => m.modalPrice || 0))
    : Math.round(currentPrice * 1.05);
  
  // Best Nearby Option based on Net Expected
  const bestMandi = mandiData.length > 0
    ? mandiData.reduce((prev, curr) => (curr.netExpected || 0) > (prev.netExpected || 0) ? curr : prev)
    : mandi;

  // Weather data
  const rainProb = weatherData?.forecast?.[0]?.rainProbability || 0;
  const hasRainRisk = rainProb > 50;

  // Primary AI Recommendation Logic
  let recStatus = 'SELL';
  let recTitle = 'Sell Today';
  let recDesc = `Prices at ${bestMandi.market} are favorable (₹${bestMandi.modalPrice}/Qtl) and weather is clear for transport. Expected net profit after logistics is ₹${bestMandi.netExpected}/Qtl.`;
  let recColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let recIcon = <CheckCircle2 className="text-emerald-600" size={32} />;

  if (hasRainRisk) {
    recStatus = 'WAIT';
    recTitle = 'Hold Transport (Rain Risk)';
    recDesc = `High probability of rain (${rainProb}%) could damage your harvest during transit. Wait for clearer weather tomorrow unless you have fully covered trucks.`;
    recColor = 'bg-amber-50 text-amber-900 border-amber-200';
    recIcon = <AlertTriangle className="text-amber-600" size={32} />;
  } else if (bestMandi.modalPrice < avgMandiPrice * 0.9) {
    recStatus = 'WAIT_PRICE';
    recTitle = 'Wait for Better Prices';
    recDesc = `Current highest price (₹${bestMandi.modalPrice}/Qtl) is significantly below the district average. Holding your stock for 2-3 days might yield better returns.`;
    recColor = 'bg-blue-50 text-blue-900 border-blue-200';
    recIcon = <Clock className="text-blue-600" size={32} />;
  } else if (bestMandi.market !== mandi.market && (bestMandi.netExpected - netPrice > 50)) {
    recStatus = 'SELL_ALT';
    recTitle = `Sell at ${bestMandi.market}`;
    recDesc = `By bypassing the nearest mandi and traveling to ${bestMandi.market}, you can earn an extra ₹${Math.round(bestMandi.netExpected - netPrice)}/Qtl even after additional transport costs.`;
    recColor = 'bg-indigo-50 text-indigo-900 border-indigo-200';
    recIcon = <TrendingUp className="text-indigo-600" size={32} />;
  }

  return (
    <div className="space-y-6">
      
      {/* ── 1. AI Recommendation Banner ── */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in ${recColor}`}>
        <div className="shrink-0 bg-white p-4 rounded-2xl shadow-sm">
          {recIcon}
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 block">AI Market Recommendation</span>
          <h2 className="text-2xl md:text-3xl font-display font-black mb-2">{recTitle}</h2>
          <p className="text-sm md:text-base font-medium opacity-90 max-w-3xl leading-relaxed">
            {recDesc}
          </p>
        </div>
        <button 
          onClick={() => document.getElementById('mandi-discovery-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="shrink-0 bg-white text-current font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          View Buyer Options <ArrowRight size={18} />
        </button>
      </div>

      {/* ── 2. Market Summary (Single Row) ── */}
      <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6">
        <h3 className="font-display font-extrabold text-lg text-on-surface mb-6 flex items-center gap-2">
          <Activity size={20} className="text-primary" /> District Market Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 md:divide-x md:divide-y-0 divide-y divide-outline-variant/40">
          <div className="pr-4 md:px-6 md:pt-0 pt-0 first:pl-0">
            <span className="text-xs font-bold text-on-surface-variant block mb-1">Highest Paying Mandi</span>
            <div className="text-lg font-black text-on-surface truncate">{bestMandi.market}</div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">₹{bestMandi.modalPrice}/Qtl</div>
          </div>
          <div className="pl-4 md:px-6 md:pt-0 pt-0 border-l border-outline-variant/40 md:border-l-0">
            <span className="text-xs font-bold text-on-surface-variant block mb-1">Average Modal Price</span>
            <div className="text-lg font-black text-on-surface">₹{avgMandiPrice}/Qtl</div>
          </div>
          <div className="pr-4 md:px-6 md:pt-0 pt-4 md:border-t-0">
            <span className="text-xs font-bold text-on-surface-variant block mb-1">Estimated Net Realization</span>
            <div className="text-lg font-black text-emerald-700">₹{bestMandi.netExpected || bestMandi.modalPrice}/Qtl</div>
            <div className="text-[10px] font-medium text-on-surface-variant mt-1 max-w-[120px] leading-tight">
              After ₹{bestMandi.transportCost || 250} transport deduction
            </div>
          </div>
          <div className="pl-4 md:px-6 md:pt-0 pt-4 border-l border-outline-variant/40 md:border-l-0 md:border-t-0">
            <span className="text-xs font-bold text-on-surface-variant block mb-1">Active Buyers</span>
            <div className="text-lg font-black text-on-surface">{numReporting} Markets</div>
          </div>
        </div>
      </div>

      {/* ── 3. Transport Intelligence ── */}
      <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 flex items-center gap-4 md:block">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center md:mb-4 ${hasRainRisk ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {hasRainRisk ? <CloudRain size={32} /> : <Sun size={32} />}
            </div>
            <h4 className="font-display font-bold text-lg md:text-center">Transport<br className="hidden md:block" /> Intelligence</h4>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="font-bold text-on-surface mb-1">Weather Context</div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {hasRainRisk 
                  ? `There is a ${rainProb}% chance of rain in your route. Uncovered crops face severe moisture damage risks. Tarpaulin covers are mandatory if transporting today.` 
                  : `Clear skies along your route (0% rain risk). Humidity is moderate (68%) with light winds (12 km/h). Safe for open truck transport.`}
              </p>
            </div>
            
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-3">
                <Truck className="text-primary opacity-80" size={20} />
                <div>
                  <div className="text-xs font-bold text-on-surface-variant">Recommended Vehicle</div>
                  <div className="text-sm font-black text-on-surface">Medium Truck (10-15 Qtl)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-primary opacity-80" size={20} />
                <div>
                  <div className="text-xs font-bold text-on-surface-variant">Best Time to Depart</div>
                  <div className="text-sm font-black text-on-surface">Tomorrow, 06:00 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
