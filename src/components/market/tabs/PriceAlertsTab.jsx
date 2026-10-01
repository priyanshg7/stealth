import React, { useState } from 'react';
import { Bell, BellRing, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PriceAlertsTab({ mandi }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'price_above', threshold: 2400, market: mandi.market, active: true },
    { id: 2, type: 'above_msp', threshold: 0, market: mandi.market, active: true }
  ]);
  
  const [newType, setNewType] = useState('price_above');
  const [newThreshold, setNewThreshold] = useState('');

  const handleAddAlert = (e) => {
    e?.preventDefault();
    const val = (newType === 'price_above' || newType === 'price_below') ? parseInt(newThreshold) || 0 : 0;
    setAlerts([{ id: Date.now(), type: newType, threshold: val, market: mandi.market, active: true }, ...alerts]);
    setNewThreshold('');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Information & Form */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
                <BellRing size={24} />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-on-surface mb-2">Smart Market Alerts</h3>
              <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
                Set custom rule-based alerts and KisanMitra will notify you instantly via in-app push notifications and SMS when your conditions are met at <strong>{mandi.market}</strong>.
              </p>
            </div>
            
            {/* Create Alert Card */}
            <form onSubmit={handleAddAlert} className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
                <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                  <Plus size={16} className="text-primary" /> Create New Alert
                </h4>
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Target: {mandi.market}
                </span>
              </div>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Alert Trigger Condition (शर्त)
                  </label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
                  >
                    <option value="price_above">Price exceeds user-defined value (भाव लक्ष्य से अधिक)</option>
                    <option value="price_below">Price falls below user-defined value (भाव लक्ष्य से कम)</option>
                    <option value="nearest_update">Nearest mandi updates today's prices (दैनिक भाव अपडेट)</option>
                    <option value="better_avail">Better nearby mandi becomes available (बेहतर नजदीकी मंडी)</option>
                    <option value="above_msp">Price becomes higher than MSP (एमएसपी से अधिक भाव)</option>
                    <option value="weather_suitable">Weather becomes suitable for transportation (सुरक्षित परिवहन मौसम)</option>
                  </select>
                </div>
                
                {/* Show threshold input only for threshold alerts */}
                {(newType === 'price_above' || newType === 'price_below') && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                      Target Price Threshold (लक्ष्य भाव ₹/क्विंटल)
                    </label>
                    <div className="relative w-full">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface font-extrabold text-sm">₹</span>
                      <input 
                        type="number" 
                        placeholder="e.g. 2500"
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-1">
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus size={18} />
                    <span>Set Alert Rule</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Right Column: Active Alerts List */}
          <div className="lg:col-span-5 xl:col-span-5 w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} className="text-green-600" /> Active Alerts ({alerts.filter(a => a.active).length})
              </h4>
              <span className="text-[11px] font-semibold text-on-surface-variant">Live Notifications</span>
            </div>
            
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.active 
                      ? 'bg-white border-primary/30 shadow-xs' 
                      : 'bg-surface-container-lowest border-outline-variant/60 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {alert.active ? 'Active' : 'Paused'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={alert.active}
                        onChange={() => {
                          setAlerts(alerts.map(a => a.id === alert.id ? {...a, active: !a.active} : a));
                        }}
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="font-extrabold text-on-surface text-sm">
                    {alert.type === 'price_above' && `Price > ₹${alert.threshold} / Qtl`}
                    {alert.type === 'price_below' && `Price < ₹${alert.threshold} / Qtl`}
                    {alert.type === 'nearest_update' && `Daily Price Update Alert`}
                    {alert.type === 'better_avail' && `Better Nearby Mandi Alert`}
                    {alert.type === 'above_msp' && `Price exceeds MSP Alert`}
                    {alert.type === 'weather_suitable' && `Weather Safe for Transit`}
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-medium mt-1 flex items-center justify-between">
                    <span>Mandi: <strong className="text-on-surface">{alert.market}</strong></span>
                    <span className="text-[10px] text-primary font-bold">SMS + Push</span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center p-8 border border-dashed border-outline-variant rounded-2xl text-xs font-semibold text-on-surface-variant bg-surface-container-lowest">
                  No active market alerts set.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
