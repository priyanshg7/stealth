import React from 'react';

export default function DiseaseDiagnosis() {
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-2xl mx-auto animate-fade-in-up font-sans">
      <div className="border-b border-surface-container-high pb-4">
        <h2 className="font-display font-extrabold text-xl text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl font-bold">photo_camera</span> AI Leaf Disease Diagnoser
        </h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Upload a photo of damaged leaves or stems to receive instant organic or chemical remedies</p>
      </div>

      {/* Diagnostic simulator */}
      <div className="border-2 border-dashed border-outline-variant/80 rounded-2xl p-8 text-center bg-surface-container-low/40 space-y-4">
        <span className="material-symbols-outlined text-outline-variant text-5xl">potted_plant</span>
        
        <div>
          <h4 className="font-bold text-on-surface text-sm">Take a photo or upload leaf image</h4>
          <p className="text-[11px] text-on-surface-variant mt-1">Accepts PNG, JPG (Max 8MB)</p>
        </div>

        {/* Interactive scan button */}
        <button
          onClick={() => {
            const btn = document.getElementById('diag-result');
            if (btn) {
              btn.classList.remove('hidden');
              btn.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
        >
          Simulate Camera Scan
        </button>
      </div>

      {/* Hidden simulator result panel */}
      <div id="diag-result" className="hidden p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-fade-in-up">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-red-600 text-lg">error_outline</span> Pest Detected: Stem Rust (Fungal Outbreak)
          </h4>
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">92% Confidence</span>
        </div>
        <p className="text-xs text-red-800 leading-relaxed font-semibold">
          Recommendation: Apply Propiconazole 25% EC fungicide at 2 ml/litre dosage. Alternatively, spray ginger-garlic extract or copper oxychloride if practicing organic farming.
        </p>
        <div className="flex justify-end gap-2 text-[10px] font-bold pt-1">
          <button 
            onClick={() => alert("Agronomist call scheduled. Advisor will contact you within 2 hours.")}
            className="bg-white border border-red-200 rounded-lg px-3 py-1.5 text-red-800 hover:bg-red-100"
          >
            ☎️ Request Call with Expert
          </button>
        </div>
      </div>
    </div>
  );
}
