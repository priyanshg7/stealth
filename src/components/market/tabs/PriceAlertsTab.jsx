import React, { useState } from 'react';
import { Bell, BellRing, Plus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PriceAlertsTab({ mandi }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'price_above', threshold: 2400, market: mandi.market, active: true },
    { id: 2, type: 'above_msp', threshold: 0, market: mandi.market, active: true }
  ]);
  
  const [newType, setNewType] = useState('price_above');
  const [newThreshold, setNewThreshold] = useState('');

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <BellRing size={24} />
          </div>
          <h3 className="font-display font-extrabold text-2xl text-on-surface mb-2">Smart Market Alerts</h3>
          <p className="text-sm font-semibold text-on-surface-variant leading-relaxed mb-6">
            Set custom rule-based alerts and KisanMitra will notify you instantly via Push Notification and WhatsApp when your conditions are met at <strong>{mandi.market}</strong>.
          </p>
          
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant space-y-4">
            <h4 className="font-bold text-on-surface text-sm">Create New Alert</h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:border-primary"
              >
                <option value="price_above">Price exceeds user-defined value</option>
                <option value="price_below">Price falls below user-defined value</option>
                <option value="nearest_update">Nearest mandi updates today's prices</option>
                <option value="better_avail">Better nearby mandi becomes available</option>
                <option value="above_msp">Price becomes higher than MSP</option>
                <option value="weather_suitable">Weather becomes suitable for transportation</option>
              </select>
              
              {/* Show threshold input only for threshold alerts */}
              {(newType === 'price_above' || newType === 'price_below') && (
                <div className="relative w-full sm:w-32">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                  <input 
                    type="number" 
                    placeholder="2500"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-outline-variant rounded-xl text-sm font-bold outline-none focus:border-primary"
                  />
                </div>
              )}
              
              <button 
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  const val = (newType === 'price_above' || newType === 'price_below') ? parseInt(newThreshold) || 0 : 0;
                  setAlerts([{ id: Date.now(), type: newType, threshold: val, market: mandi.market, active: true }, ...alerts]);
                  setNewThreshold('');
                }}
              >
                <Plus size={18} /> Set
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Alerts List */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          <h4 className="font-bold text-on-surface flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" /> Active Alerts
          </h4>
          
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border ${alert.active ? 'bg-white border-primary/30 shadow-sm' : 'bg-surface-container-lowest border-outline-variant opacity-70'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${alert.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
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
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="font-bold text-on-surface text-sm">
                  {alert.type === 'price_above' && `Price > ₹${alert.threshold}`}
                  {alert.type === 'price_below' && `Price < ₹${alert.threshold}`}
                  {alert.type === 'nearest_update' && `Daily Price Update Alert`}
                  {alert.type === 'better_avail' && `Better Nearby Mandi Alert`}
                  {alert.type === 'above_msp' && `Price exceeds MSP Alert`}
                  {alert.type === 'weather_suitable' && `Weather Safe for Transit`}
                </div>
                <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                  Mandi: {alert.market}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center p-6 border border-dashed border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant">
                No alerts set.
              </div>
            )}
          </div>
          
          <button className="w-full py-3 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 transition-colors rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-[#25D366]/30">
            Connect WhatsApp <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
    </div>
  );
}
