import React from 'react';

export default function FarmsList({
  farms,
  setCurrentFarm,
  setBoundaryPoints,
  setEditingFarmIndex,
  setView,
  startNewFarmRegistration
}) {
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-on-surface">Manage Farm Profiles</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Review, register, or modify agricultural holdings</p>
        </div>
        <button 
          onClick={startNewFarmRegistration}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined notranslate text-sm font-bold">add</span>
          <span>Add New Farm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map((f, i) => (
          <div key={i} className="p-4 rounded-2xl border border-outline-variant bg-surface-container-low/40 relative space-y-3">
            <button
              onClick={() => {
                setCurrentFarm(f);
                setBoundaryPoints(f.boundary || []);
                setEditingFarmIndex(i);
                setView('REVIEW');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-container-high text-primary"
              title="Edit Farm"
            >
              <span className="material-symbols-outlined notranslate text-sm font-bold">edit</span>
            </button>

            <div>
              <h4 className="font-bold text-on-surface text-base">{f.name}</h4>
              <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{f.village}, {f.district}, {f.state}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div><span className="text-[10px] text-on-surface-variant block">Total Area:</span> {f.area} {f.unit}</div>
              <div><span className="text-[10px] text-on-surface-variant block">Planted Crop:</span> {f.crop?.name.toUpperCase()}</div>
              <div><span className="text-[10px] text-on-surface-variant block">Soil Type:</span> {f.soil?.type} soil (pH {f.soil?.ph})</div>
              <div><span className="text-[10px] text-on-surface-variant block">Irrigation Source:</span> {f.water?.sources.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
