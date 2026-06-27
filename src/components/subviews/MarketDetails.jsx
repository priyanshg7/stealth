import React from 'react';

export default function MarketDetails({
  farms,
  selectedFarmIndex,
  getFarmDashboardData
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;
  const cropName = activeFarm?.crop?.name || 'wheat';

  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      <div className="border-b border-surface-container-high pb-4">
        <h2 className="font-display font-extrabold text-xl text-on-surface">Market Intelligence bulletin</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Compare local mandi prices and estimate transportation expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive price comparison */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-on-surface">Mandi Price Comparison for {cropName.toUpperCase()}</h3>
          <div className="space-y-3">
            {[
              { name: 'Nashik APMC (District Center)', price: 2350, distance: '12 km', transport: 80, confidence: 92 },
              { name: 'Pimpalgaon APMC', price: 2280, distance: '3 km', transport: 20, confidence: 85 },
              { name: 'Lasalgaon Mandi', price: 2410, distance: '24 km', transport: 150, confidence: 89 }
            ].map((mandi, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-outline-variant bg-white flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">{mandi.name}</h4>
                  <span className="text-[10px] text-on-surface-variant font-semibold block mt-0.5">
                    Distance: {mandi.distance} | Estimated Transport cost: ₹{mandi.transport}/Quintal
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-primary block">₹{mandi.price} / Qtl</span>
                  <span className="text-[10px] font-bold text-green-700">Net: ₹{mandi.price - mandi.transport}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive profit calculator */}
        <div className="bg-[#f0fcf4] border border-primary/20 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-primary">Profit Calculator</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span>Estimated Quantity:</span>
              <span>{(parseFloat(activeFarm?.area) || 2.5) * 22} Quintals</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Best Net Rate:</span>
              <span>₹2,270/Quintal</span>
            </div>
            <div className="border-t border-primary/10 pt-2 flex justify-between font-extrabold text-sm text-primary">
              <span>Net Earnings:</span>
              <span>₹{Math.round(((parseFloat(activeFarm?.area) || 2.5) * 22) * 2270).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button 
            onClick={() => alert("Connecting with local transport coordinator...")}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 rounded-xl text-xs text-center shadow-sm"
          >
            ☎️ Book Mandi Transport
          </button>
        </div>
      </div>
    </div>
  );
}
