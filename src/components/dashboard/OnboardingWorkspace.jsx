import React from 'react';

export default function OnboardingWorkspace({
  profile,
  farms,
  currentFarm,
  soilHealthCardUploaded,
  soilCardReminderDismissed,
  setSoilCardReminderDismissed,
  handleSoilHealthCardUpload,
  showAnnualPlanWizard,
  setShowAnnualPlanWizard,
  onboardingCarouselIndex,
  setOnboardingCarouselIndex,
  onboardingSlides,
  wizardSelectedCrop,
  setWizardSelectedCrop,
  setFarms,
  setSeasonPlanConfirmed,
  crops
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up font-sans">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-[#0c7234] rounded-card p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Welcome to KisanMitra
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
            Namaste, {profile.name || 'Ramesh Ji'}! Let's setup your agricultural intelligence hub.
          </h2>
          <p className="text-white/90 text-sm max-w-xl leading-relaxed">
            Your farm is registered, but you need to activate your Season Crop Plan to begin receiving automated daily schedules, disease reports, and weather warning guidance.
          </p>
        </div>
      </div>

      {/* 2. Onboarding Progress Stepper & Soil Health Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Setup Progress Stepper */}
        <div className="bg-white rounded-card p-6 border border-outline-variant/60 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined notranslate text-primary text-xl">task_alt</span> Setup Progress
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Farmer Profile Completed', status: true },
              { label: 'Agricultural Plot Registered', status: true },
              { label: 'Soil Health Metrics Added', status: soilHealthCardUploaded || currentFarm?.soil?.source === 'card' },
              { label: 'Generate Annual Farm Plan', status: false },
              { label: 'Activate First Season Plan', status: false }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  step.status ? 'bg-primary' : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                }`}>
                  {step.status ? 'âœ“' : idx + 1}
                </div>
                <span className={`font-semibold ${step.status ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Soil Health Upload recommendation card */}
        {!soilHealthCardUploaded && !soilCardReminderDismissed && (
          <div className="bg-[#f0fcf4] border-2 border-dashed border-primary/40 rounded-card p-6 shadow-sm flex flex-col justify-between space-y-4 relative">
            <button 
              onClick={() => setSoilCardReminderDismissed(true)}
              className="absolute top-4 right-4 text-xs font-bold text-on-surface-variant hover:text-on-surface"
            >
              Skip
            </button>
            <div className="space-y-2">
              <h4 className="font-bold text-primary text-base flex items-center gap-2">
                <span className="material-symbols-outlined notranslate text-primary text-lg">science</span> Upload Soil Health Card
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Provide your soil testing values to unlock hyper-accurate fertilizer recommendations. Otherwise, KisanMitra uses district averages.
              </p>
            </div>

            <div className="flex gap-3">
              <label className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all">
                <span className="material-symbols-outlined notranslate text-sm">upload</span> Upload Now
                <input type="file" onChange={handleSoilHealthCardUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {soilHealthCardUploaded && (
          <div className="bg-primary/5 border border-primary/20 rounded-card p-6 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <h4 className="font-bold text-primary text-base flex items-center gap-1.5">
                <span className="material-symbols-outlined notranslate text-green-700 text-lg">check_circle</span> Soil Card Parsed!
              </h4>
              <p className="text-xs text-on-surface-variant">
                AI has extracted metrics successfully. Nitrogen: Medium, Phosphorus: Medium, Potassium: High.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-outline-variant/60 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div><span className="text-[10px] text-on-surface-variant block">pH</span> {currentFarm?.soil?.ph || '6.8'}</div>
              <div><span className="text-[10px] text-on-surface-variant block">Carbon</span> {currentFarm?.soil?.carbon || '0.62'}%</div>
              <div><span className="text-[10px] text-on-surface-variant block">Nitrogen</span> {currentFarm?.soil?.nitrogen || 'Medium'}</div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Primary CTA: Generate Annual Planner */}
      <div className="bg-white border-2 border-primary rounded-card p-6 md:p-8 shadow-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <span className="material-symbols-outlined notranslate text-3xl">psychology</span>
        </div>
        <h3 className="font-display font-extrabold text-xl text-on-surface leading-tight">
          Generate Your First Annual Farm & Season Plan
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          KisanMitra AI will analyze your location coordinates ({farms[0]?.lat || 'Nashik'}), soil pH, irrigation water resources, and weather forecast histories to build a custom calendar.
        </p>
        <button
          onClick={() => setShowAnnualPlanWizard(true)}
          className="bg-primary hover:bg-secondary text-white font-extrabold px-8 py-3 rounded-xl text-sm shadow-md transition-all active:scale-[0.97] inline-flex items-center gap-2"
        >
          <span>Generate Crop Plan</span>
          <span className="material-symbols-outlined notranslate text-sm font-bold">arrow_forward</span>
        </button>
      </div>

      {/* 4. Onboarding swipeable feature cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-display font-bold text-on-surface text-base">Explore KisanMitra Capabilities</h4>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setOnboardingCarouselIndex(prev => Math.max(0, prev - 1))}
              className="p-1 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-30"
              disabled={onboardingCarouselIndex === 0}
            >
              <span className="material-symbols-outlined notranslate text-xs">chevron_left</span>
            </button>
            <button 
              onClick={() => setOnboardingCarouselIndex(prev => Math.min(onboardingSlides.length - 1, prev + 1))}
              className="p-1 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-30"
              disabled={onboardingCarouselIndex === onboardingSlides.length - 1}
            >
              <span className="material-symbols-outlined notranslate text-xs">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Horizontal Swipeable Card */}
        <div className="relative overflow-hidden w-full h-44 rounded-card border border-outline-variant/60 shadow-sm bg-white">
          <div 
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${onboardingCarouselIndex * 100}%)` }}
          >
            {onboardingSlides.map((slide, idx) => (
              <div key={idx} className="w-full flex-shrink-0 flex flex-col md:flex-row h-full">
                <div className={`w-full md:w-2/5 bg-gradient-to-br ${slide.color} p-6 flex flex-col justify-between text-white`}>
                  <span className="material-symbols-outlined notranslate text-3xl">{slide.icon}</span>
                  <h4 className="font-display font-bold text-lg leading-tight">{slide.title}</h4>
                </div>
                <div className="flex-1 p-6 flex items-center text-sm font-semibold text-on-surface-variant leading-relaxed bg-white">
                  {slide.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {onboardingSlides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all ${
                onboardingCarouselIndex === idx ? 'w-4 bg-primary' : 'w-2 bg-outline-variant/60'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 5. Onboarding Plan Generator Simulation Modal */}
      {showAnnualPlanWizard && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-lg font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined notranslate text-primary text-lg">science</span> AI Annual Crop Plan Recommendations
              </h3>
              <button 
                onClick={() => setShowAnnualPlanWizard(false)}
                className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined notranslate text-lg">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs font-semibold text-on-surface-variant leading-relaxed">
                Based on soil type (pH 6.8), water source ({farms[0]?.water?.sources?.join(', ') || 'borewell'}), and Nashik weather history, the AI proposes two optimized crop schedules:
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'wheat', name: 'Wheat (Karan Vandana)', yield: '22 Qtl/Acre', profit: 'â‚¹1.1L', cost: 'â‚¹18,000/Acre', icon: 'ðŸŒ¾' },
                  { id: 'rice', name: 'Rice (Pusa Basmati)', yield: '28 Qtl/Acre', profit: 'â‚¹1.3L', cost: 'â‚¹22,000/Acre', icon: 'ðŸŒ±' }
                ].map(c => {
                  const isSel = wizardSelectedCrop === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setWizardSelectedCrop(c.id)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-40 transition-all ${
                        isSel 
                          ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                          : 'bg-white border-outline-variant/60 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-3xl">{c.icon}</span>
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          isSel ? 'bg-primary text-white' : 'border-outline-variant'
                        }`}>
                          {isSel && 'âœ“'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-on-surface mt-2">{c.name}</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold mt-1">Yield: {c.yield} | Net Profit: {c.profit}</p>
                        <p className="text-[9px] text-on-surface-variant leading-none mt-0.5">Input Cost: {c.cost}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-surface-container-low/60 rounded-xl p-3 border text-[11px] leading-relaxed text-on-surface-variant font-medium">
                ðŸŒ¾ <strong>Annual Crop Rotation Advice:</strong> Rotating {wizardSelectedCrop === 'wheat' ? 'Wheat' : 'Rice'} with a nitrogen-fixing legume like Moong or Chickpea in the secondary season will restore 25% soil nitrogen naturally and reduce urea expenditures by â‚¹4,500.
              </div>
            </div>

            <div className="border-t border-surface-container-high pt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAnnualPlanWizard(false)}
                className="px-4 py-2 border rounded-xl hover:bg-surface-container transition-colors text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedFarms = [...farms];
                  if (updatedFarms[0]) {
                    updatedFarms[0].crop = {
                      name: wizardSelectedCrop,
                      variety: wizardSelectedCrop === 'wheat' ? 'Karan Vandana' : 'Pusa Basmati',
                      stage: wizardSelectedCrop === 'wheat' ? 'Vegetative / Growth' : 'Sowing',
                      sowingDate: '2026-06-01',
                      harvestDate: '2026-10-15',
                      previousCrop: 'Rice',
                      farmingType: 'Conventional'
                    };
                    setFarms(updatedFarms);
                  }
                  setSeasonPlanConfirmed(true);
                  setShowAnnualPlanWizard(false);
                }}
                className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2 rounded-xl text-xs shadow-sm transition-all"
              >
                Confirm & Activate Season Plan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

