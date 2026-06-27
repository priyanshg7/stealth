import React from 'react';

export default function QuickActionFAB({
  setActiveDashboardTab,
  setVoiceAssistantOpen
}) {
  return (
    <div className="fixed bottom-20 right-4 z-40 group font-sans">
      {/* Expandable options menu */}
      <div className="flex flex-col gap-2.5 mb-3.5 scale-0 group-hover:scale-100 origin-bottom transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
        {[
          { label: 'Scan Crop', icon: 'photo_camera', action: () => setActiveDashboardTab('diagnosis') },
          { label: 'Speak to AI', icon: 'mic', action: () => setVoiceAssistantOpen(true) },
          { label: 'Add Farm Activity', icon: 'playlist_add', action: () => alert("Opened activity logger.") },
          { label: 'Agricultural Shops', icon: 'storefront', action: () => alert("Loading nearby seed and fertilizer shops...") },
          { label: 'Emergency Help', icon: 'support_agent', action: () => alert("Direct agronomist advisory call triggered.") },
          { label: 'Mandi Prices', icon: 'trending_up', action: () => setActiveDashboardTab('market') }
        ].map((act, i) => (
          <button
            key={i}
            onClick={act.action}
            className="flex items-center gap-2 self-end bg-white hover:bg-surface-container border border-outline-variant/60 text-on-surface-variant py-2 px-3.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm font-bold text-primary">{act.icon}</span>
            <span>{act.label}</span>
          </button>
        ))}
      </div>
      {/* Main FAB Trigger */}
      <button
        className="bg-primary hover:bg-secondary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform active:scale-95"
        title="Quick Actions"
      >
        <span className="material-symbols-outlined text-2xl font-bold transition-transform group-hover:rotate-45">add</span>
      </button>
    </div>
  );
}
