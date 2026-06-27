import React from 'react';

export default function SettingsPanel({
  profile,
  setProfile,
  voiceGuide,
  setVoiceGuide
}) {
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-2xl mx-auto animate-fade-in-up font-sans">
      <div className="border-b border-surface-container-high pb-4">
        <h2 className="font-display font-extrabold text-xl text-on-surface">Farmer Profile Settings</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Edit credentials, preferred languages, and voice guide parameters</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-xs">Farmer Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-xs">Linked Mobile Number</label>
            <input 
              type="text" 
              disabled
              value={profile.mobile ? `+91 ${profile.mobile}` : '1234567890'}
              className="bg-surface-container border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold text-on-surface-variant cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-surface-container-high pt-4">
          <div>
            <span className="font-bold text-sm block">Voice Helper Guidance</span>
            <span className="text-xs text-on-surface-variant font-medium">Plays simulated vocal guides during navigation</span>
          </div>
          <button 
            onClick={() => setVoiceGuide(!voiceGuide)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              voiceGuide 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-on-surface-variant'
            }`}
          >
            {voiceGuide ? 'Helper Active' : 'Helper Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
}
