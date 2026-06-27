import React from 'react';

export default function GovernmentSchemes({
  setSelectedScheme
}) {
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      <div className="border-b border-surface-container-high pb-4">
        <h2 className="font-display font-extrabold text-xl text-on-surface">Customized Subsidies & Benefits</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Review and apply directly to active central and state agricultural schemes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'PM-Kisan Samman Nidhi Yojana', benefit: '₹6,000 yearly income support paid in 3 equal installments', documents: 'Aadhaar, Land Registry (Khatauni), Bank Passbook', status: 'Approved' },
          { name: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance)', benefit: 'Comprehensive risk coverage for drought, pest outbreak, and waterlogging', documents: 'Land Sowing certificate, Tenant registry, Aadhaar', status: 'Eligible (Apply Now)' },
          { name: 'Subsidized Solar Irrigation Pump Scheme (KUSUM)', benefit: 'Up to 90% subsidy on electric/solar water pumps (3HP - 7.5HP)', documents: 'Electricity board certificate, Water resource details, Soil card', status: 'Eligible (Apply Now)' },
          { name: 'Organic Farming Promotion Subsidy', benefit: '₹10,000 cash grant per hectare for organic composting inputs', documents: 'Farming type certification (Organic), Soil test health card', status: 'Eligible (Apply Now)' }
        ].map((sch, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-outline-variant bg-surface-container-low/20 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <h4 className="font-bold text-sm text-on-surface leading-tight">{sch.name}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                sch.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-primary/10 text-primary border border-primary/20'
              }`}>{sch.status}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
              🎁 <strong>Benefit:</strong> {sch.benefit}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium">
              🎒 <strong>Required Documents:</strong> {sch.documents}
            </p>
            {sch.status !== 'Approved' && (
              <button 
                onClick={() => setSelectedScheme({ name: sch.name, benefits: sch.benefit, documents: sch.documents })}
                className="w-full bg-white hover:bg-primary/5 text-primary border border-primary/20 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
