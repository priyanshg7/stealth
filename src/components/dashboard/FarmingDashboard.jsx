import { t } from '../../utils/translations';
import React from 'react';
import { 
  Check, Volume2, Mic, MapPin, Plus, Trash2, Edit3, ArrowLeft, ArrowRight,
  Info, Cpu, Shield, Sparkles, PlusCircle, HelpCircle, Layers, Droplet,
  Smartphone, Wifi, Users, Truck, Compass, Sun, Wind, CloudRain, Calendar,
  Activity, CheckCircle2, ChevronRight, RefreshCw, Upload, AlertCircle, X,
  TrendingUp, ShieldAlert, BadgeInfo, Clock, Leaf, Droplets, BarChart3
} from 'lucide-react';

export default function FarmingDashboard({
  farms,
  selectedFarmIndex,
  setSelectedFarmIndex,
  getFarmDashboardData,
  completedTasks,
  setCompletedTasks,
  activeDialogTask,
  setActiveDialogTask,
  setShowRescheduleModal,
  selectedRescheduleDate,
  setSelectedRescheduleDate,
  selectedScheme,
  setSelectedScheme,
  selectedMandiDetails,
  setSelectedMandiDetails,
  selectedCommunityPost,
  setSelectedCommunityPost,
  showAllTasksModal,
  setShowAllTasksModal,
  startNewFarmRegistration,
  setActiveDashboardTab,
  setVoiceAssistantOpen,
  setVoiceReplies,
  translating,
  language,
  weatherData,
  weatherLoading,
  seasonPlanConfirmed,
  setSeasonPlanConfirmed,
  profile
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;

  // Compute time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? t('Good Morning', language) : hour < 17 ? t('Good Afternoon', language) : t('Good Evening', language);
  const farmerName = profile?.name || activeFarm?.owner || 'Farmer';

  // Onboarding Wizard triggers
  const handleStartAnnualPlan = () => {
    setSeasonPlanConfirmed(true);
    localStorage.setItem('km_season_confirmed', 'true');
    setActiveDashboardTab('planner');
  };

  const handleStartSeasonPlan = () => {
    setSeasonPlanConfirmed(true);
    localStorage.setItem('km_season_confirmed', 'true');
    setActiveDashboardTab('season_planner');
  };

  if (!dashboardData && farms.length > 0) return null;

  return (
    <div className="space-y-5 animate-fade-in-up font-sans pb-10">
      {translating && (
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl p-3 text-xs font-bold flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-sm font-bold animate-spin">sync</span>
          <span>{t("AI is translating your dashboard into the selected language...", language)}</span>
        </div>
      )}

      {/* ──── 1. GREETING & FARM SWITCHER ──── */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight leading-tight">
            {timeGreeting}, <span className="text-primary">{farmerName}</span> 🌾
          </h1>
          <p className="text-xs font-semibold text-on-surface-variant/80 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {activeFarm && <> · <strong>{activeFarm.name}</strong> ({activeFarm.area} {activeFarm.unit})</>}
          </p>
        </div>

        {/* Horizontal Farm Swapper */}
        <div className="space-y-2">
          <span className="text-xs md:text-sm text-on-surface-variant font-bold uppercase tracking-wider block">{t("My Farm Profiles", language)}</span>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0">
            {farms.map((f, i) => (
              <button
                key={i}
                onClick={() => setSelectedFarmIndex(i)}
                className={`p-4 rounded-card border transition-all text-left shrink-0 w-11/12 max-w-[260px] md:min-w-[200px] md:w-64 shadow-xs relative min-h-[106px] ${
                  selectedFarmIndex === i
                    ? 'bg-white border-2 border-primary ring-2 ring-primary/10'
                    : 'bg-white border-outline-variant/60 hover:border-primary/45'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-extrabold text-sm text-on-surface flex items-center gap-1">
                    🚜 {f.name}
                  </span>
                  <span className="text-[11px] md:text-xs bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full">
                    {f.area} {f.unit}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant/90 font-bold space-y-1">
                  <div>{t("Crop:", language)} <span className="text-primary">{f.crop?.name ? t(f.crop.name, language) : ''}</span></div>
                  <div>{t("Stage:", language)} <span className="text-on-surface">{f.crop?.stage ? t(f.crop.stage, language) : t('Sowing', language)}</span></div>
                  <div className="flex justify-between items-center mt-2 border-t pt-1.5 border-outline-variant/30">
                    <span>{t("Farm Health", language)}</span>
                    <span className="text-primary font-extrabold">{f.crop?.confirmedPlan ? '92%' : '88%'}</span>
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={startNewFarmRegistration}
              className="p-4 rounded-card border-2 border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 flex flex-col justify-center items-center text-center shrink-0 w-11/12 max-w-[200px] md:min-w-[180px] h-[106px] transition-colors"
            >
              <PlusCircle className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">{t("Add New Farm", language)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Start Your Farming Journey (Onboarding Hero) */}
      {!seasonPlanConfirmed && (
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-white border border-primary/30 rounded-card p-6 shadow-md space-y-5 animate-fade-in-up">
          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-on-surface">{t("Start Your Farming Journey", language)}</h2>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                Plan your seasons before you sow! Let AI guide your farm's schedule, predict diseases, analyze market prices, and optimize watering cycles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Annual Plan Card */}
            <div className="bg-white p-5 rounded-2xl border border-outline-variant hover:border-primary/50 transition-all shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] md:text-xs text-primary font-black uppercase tracking-wider">Recommended workflow</span>
                <h3 className="font-extrabold text-base text-on-surface mt-1">{t("Create Annual Farm Plan", language)}</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Plan your entire year across Kharif, Rabi, and Zaid seasons. Auto-calculates optimal crop rotations to replenish soil nutrients.
                </p>
                <div className="flex gap-2 items-center text-[11px] md:text-xs text-on-surface-variant font-bold mt-3">
                  <span className="bg-surface-container-high px-2 py-0.5 rounded">Takes 3-5 min</span>
                  <span className="text-green-700">✓ Full rotation benefits</span>
                </div>
              </div>
              <button 
                onClick={handleStartAnnualPlan}
                className="w-full bg-primary hover:bg-secondary text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all mt-4"
              >
                Create Annual Plan <ArrowRight size={14} />
              </button>
            </div>

            {/* Seasonal Plan Card */}
            <div className="bg-white p-5 rounded-2xl border border-outline-variant hover:border-primary/50 transition-all shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] md:text-xs text-on-surface-variant font-black uppercase tracking-wider">Single crop cycle</span>
                <h3 className="font-extrabold text-base text-on-surface mt-1">{t("Create Seasonal Plan", language)}</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Quickly set up a schedule for a single season. Generates localized irrigation alerts, weather advisory, and weekly diagnostics.
                </p>
                <div className="flex gap-2 items-center text-[11px] md:text-xs text-on-surface-variant font-bold mt-3">
                  <span className="bg-surface-container-high px-2 py-0.5 rounded">Takes 2 min</span>
                  <span className="text-primary">✓ Quick setup</span>
                </div>
              </div>
              <button 
                onClick={handleStartSeasonPlan}
                className="w-full bg-white border-2 border-primary text-primary hover:bg-primary/5 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all mt-4"
              >
                Create Seasonal Plan <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Onboarding Checklist & Pre-fill Option */}
          <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-on-surface-variant">
              <span>Setup Progress:</span>
              <span className="flex items-center gap-1 text-green-700"><CheckCircle2 size={14} /> Profile Setup</span>
              <span className="flex items-center gap-1 text-green-700"><CheckCircle2 size={14} /> Saved Farm</span>
              <span className="flex items-center gap-1 text-on-surface-variant/40">○ Annual Plan</span>
              <span className="flex items-center gap-1 text-on-surface-variant/40">○ Seasonal Plan</span>
            </div>
            {farms.length > 0 && (
              <button 
                onClick={handleStartSeasonPlan}
                className="text-xs font-extrabold text-primary flex items-center gap-1 hover:underline min-h-[36px]"
              >
                <RefreshCw size={12} /> Use Existing Farm Data to Pre-fill
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Farm Status Summary (Human-readable text summary block) */}
      {dashboardData && (
        <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-xs space-y-2">
          <h2 className="text-sm font-extrabold text-on-surface uppercase tracking-wider text-primary flex items-center gap-1.5">
            <BadgeInfo size={16} /> {t("Daily Farm Advisor Overview", language)}
          </h2>
          <p className="text-sm font-medium leading-relaxed text-on-surface-variant">
            {t("Your crop is progressing normally and is healthy.", language)} 
            {dashboardData.diseaseRisk === 'Low' ? t(' No urgent disease threat exists today.', language) : t(' A minor disease advisory is active for your area.', language)}
            {weatherData?.forecast?.[0]?.rainProbability > 40 
              ? t(' Expected rainfall soon may cover current watering cycles.', language) 
              : t(' Your soil moisture is stable, but plan next watering in 3 days.', language)}
            {dashboardData.market?.recommendation === 'Sell' 
              ? t(' Mandi rates are exceptionally favorable; it is a good time to transport.', language) 
              : t(' Mandi prices are currently stable; recommend holding for better wholesale returns.', language)}
          </p>
        </div>
      )}

      {/* 4. Today's Work Schedule (TIMELINE & CHECKLIST) */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
          <div>
            <h3 className="font-display font-extrabold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">calendar_today</span>
              {t("Today's Work Schedule", language)}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{t("AI-generated schedule based on active crop stage & weather warnings", language)}</p>
          </div>
          <button
            onClick={() => setShowAllTasksModal(true)}
            className="text-xs font-bold text-primary hover:underline min-h-[36px]"
          >
            {t("View Next 7 Days", language)}
          </button>
        </div>

        <div className="space-y-4">
          {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const tasks = (dashboardData?.tasks || []).filter(t => {
              const isToday = t.date === todayStr;
              const isOverdue = t.date < todayStr && t.status !== 'completed';
              return isToday || isOverdue;
            });
            const pending = tasks.filter(task => !completedTasks.includes(task.id));

            if (pending.length === 0) {
              return (
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 text-center space-y-3 animate-fade-in-up">
                  <span className="material-symbols-outlined text-primary text-4xl fill">check_circle</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-base">{t("All done for today!", language)}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{t("Your farm is fully optimized and in excellent health.", language)} 🌾</p>
                  </div>
                  {completedTasks.length > 0 && (
                    <button
                      onClick={() => setCompletedTasks([])}
                      className="text-xs font-bold text-primary border border-primary/20 rounded-lg px-3 py-1.5 bg-white hover:bg-primary/5 min-h-[36px]"
                    >
                      {t("Undo Completed Tasks", language)}
                    </button>
                  )}
                </div>
              );
            }

            // Group tasks by priority
            const highPriority = pending.filter(t => t.priority === 'High');
            const medPriority = pending.filter(t => t.priority === 'Medium');
            const lowPriority = pending.filter(t => t.priority === 'Low');

            const renderTaskList = (list, label, colorClass) => {
              if (list.length === 0) return null;
              return (
                <div className="space-y-2">
                  <span className={`text-[11px] md:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${colorClass} w-fit block`}>
                    {t(label, language)} {t("Priority Tasks", language)}
                  </span>
                  <div className="space-y-2.5">
                    {list.map(task => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl border border-outline-variant/80 bg-white hover:border-primary/45 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-bold bg-primary/10 rounded px-2 py-0.5">
                              {task.category}
                            </span>
                            <span className="text-xs text-on-surface-variant font-semibold">
                              ⏰ {task.time} ({task.duration})
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-on-surface">{task.title}</h4>
                          <p className="text-[11px] text-on-surface-variant font-medium">
                            💡 <strong>{t("Why:", language)}</strong> {t(task.why, language)} | 📈 <strong>{t("Expected Benefit:", language)}</strong> <span className="text-primary font-bold">{t(task.benefit, language)}</span>
                          </p>
                        </div>
                        <div className="w-full md:w-auto flex gap-2 pt-2 md:pt-0 shrink-0">
                          <button
                            onClick={() => setCompletedTasks([...completedTasks, task.id])}
                            className="flex-grow md:flex-grow-0 bg-primary hover:bg-secondary text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                          >
                            <Check size={14} /> {t("Complete", language)}
                          </button>
                          <button
                            onClick={() => {
                              setActiveDialogTask(task);
                              setShowRescheduleModal(true);
                            }}
                            className="flex-grow md:flex-grow-0 border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                          >
                            {t("Reschedule", language)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-4">
                {renderTaskList(highPriority, 'High', 'bg-red-50 text-red-700 border border-red-200')}
                {renderTaskList(medPriority, 'Medium', 'bg-amber-50 text-amber-800 border border-amber-200')}
                {renderTaskList(lowPriority, 'Low', 'bg-slate-50 text-slate-700 border border-outline-variant')}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 5. Farm Snapshot (Unified Farm Progress & Status indicators) */}
      {dashboardData && (
        <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl font-bold">analytics</span>
            {t("Active Farm Snapshot", language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Visual twin & growth progress */}
            <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg width="72" height="72" className="progress-ring">
                  <circle stroke="#e9f0e5" strokeWidth="6" fill="transparent" r="28" cx="36" cy="36" />
                  <circle
                    stroke="#006b2c"
                    strokeWidth="6"
                    fill="transparent"
                    r="28"
                    cx="36"
                    cy="36"
                    className="progress-ring__circle"
                    strokeDasharray="176"
                    strokeDashoffset={176 - (176 * (dashboardData.growthProgress || 0) / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl">
                  {dashboardData.cropIcon}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] md:text-xs text-on-surface-variant font-bold uppercase block">{activeFarm?.crop?.stage ? t(activeFarm.crop.stage, language) : ''} {t("Stage", language)}</span>
                <h4 className="font-extrabold text-base text-on-surface truncate">{activeFarm?.crop?.name ? t(activeFarm.crop.name, language).toUpperCase() : ''} ({activeFarm?.crop?.variety})</h4>
                <span className="text-xs text-primary font-bold block mt-0.5">{dashboardData.growthProgress}% {t("Growth Progress", language)}</span>
              </div>
            </div>

            {/* Quick Farm indicators */}
            <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 grid grid-cols-2 gap-3 md:col-span-2">
              {[
                { label: t('Farm Health', language), val: `${dashboardData.healthScore}%`, color: 'text-primary' },
                { label: t('Days since sowing', language), val: t('45 days', language), color: 'text-on-surface' },
                { label: t('Expected harvest', language), val: t('In 75 days', language), color: 'text-on-surface' },
                { label: t('Soil Moisture', language), val: '32% (' + t('Stable', language) + ')', color: 'text-blue-600' },
                { label: t('Irrigation Status', language), val: t(dashboardData.waterStatus, language), color: 'text-blue-600 font-extrabold' },
                { label: t('Disease Risk', language), val: t(dashboardData.diseaseRisk, language), color: dashboardData.diseaseRisk === 'Low' ? 'text-primary' : 'text-amber-600' }
              ].map((ind, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-0.5 border-b border-outline-variant/20 last:border-b-0">
                  <span className="text-on-surface-variant/90 font-medium">{ind.label}</span>
                  <span className={`font-extrabold ${ind.color}`}>{ind.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Farm Journey Progress Stepper */}
      {dashboardData && (
        <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">route</span>
            {t("Farm Journey Progress", language)}
          </h3>

          <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-bold py-2 overflow-x-auto no-scrollbar">
            {[
              { name: t('Planning', language), idx: 0 },
              { name: t('Land Prep', language), idx: 1 },
              { name: t('Sowing', language), idx: 2 },
              { name: t('Growth', language), idx: 3 },
              { name: t('Flowering', language), idx: 4 },
              { name: t('Harvest', language), idx: 5 }
            ].map(step => {
              const currentIdx = dashboardData.timelineStageIndex || 3;
              const isCompleted = step.idx < currentIdx;
              const isActive = step.idx === currentIdx;

              return (
                <div key={step.idx} className="space-y-1.5 flex flex-col items-center min-w-[70px]">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : isActive
                        ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant/60'
                  }`}>
                    {isCompleted ? '✓' : step.idx + 1}
                  </div>
                  <span className={`block leading-none truncate max-w-[65px] ${isActive ? 'text-primary font-black' : 'text-on-surface-variant font-medium'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Market Snapshot */}
      {dashboardData && (
        <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
            <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl font-bold">store</span>
              {t("Market Snapshot", language)}
            </h3>
            <button 
              onClick={() => setActiveDashboardTab('market')}
              className="text-xs text-primary font-bold hover:underline min-h-[36px]"
            >
              {t("Discover Mandis →", language)}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] md:text-xs text-on-surface-variant uppercase font-black tracking-wider">{t("Best Nearby Mandi", language)}</span>
              <span className="font-bold text-sm block">{t(dashboardData.market?.recommendedMandi || 'Nashik APMC', language)}</span>
              <span className="text-xs font-semibold text-primary">{dashboardData.market?.adjustedEarnings || '₹2,250 / Qtl'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] md:text-xs text-on-surface-variant uppercase font-black tracking-wider">{t("Minimum Support Price (MSP)", language)}</span>
              <span className="font-bold text-sm block">{t("MSP Target: ₹2,425", language)}</span>
              <span className="text-xs font-semibold text-green-700 font-extrabold flex items-center gap-0.5">
                ★ {t("Mandi price is", language)} {t(dashboardData.market?.recommendation === 'Hold' ? 'above' : 'near', language)} {t("MSP", language)}
              </span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col justify-between items-start">
              <span className="text-[11px] md:text-xs text-primary uppercase font-black tracking-wider">{t("Recommendation", language)}</span>
              <span className="text-xs font-black text-on-surface-variant mt-1">
                {t("Recommendation:", language)} <strong className="text-primary">{t(dashboardData.market?.recommendation === 'Hold' ? 'Monitor / Hold Prices' : 'Good Day to Sell', language)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Weather Impact */}
      {dashboardData && (
        <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
            <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-xl font-bold">wb_sunny</span>
              {t("Weather Impact Advisory", language)}
            </h3>
            <button 
              onClick={() => setActiveDashboardTab('weather')}
              className="text-xs text-primary font-bold hover:underline min-h-[36px]"
            >
              {t("Weather details →", language)}
            </button>
          </div>
          {weatherLoading ? (
            <div className="h-14 bg-surface-container-low animate-pulse rounded-xl" />
          ) : weatherData ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-on-surface">{weatherData.current?.temp}°C</span>
                <div>
                  <span className="text-xs font-extrabold text-on-surface block">
                    {weatherData.forecast?.[0]?.rainProbability > 50 ? '🌦️ ' + t('Expected Rain soon', language) : '☀️ ' + t('Sunny & Warm', language)}
                  </span>
                  <span className="text-[11px] md:text-xs text-on-surface-variant font-semibold">
                    {t("Humidity", language)}: {weatherData.current?.humidityMorning}% | {t("Wind", language)}: {weatherData.current?.windSpeed} km/h
                  </span>
                </div>
              </div>
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-900 leading-relaxed max-w-md">
                <strong>{t("Spray Advisory:", language)}</strong> {t(weatherData.rainfall?.insight || dashboardData.weatherInterpretation, language)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-on-surface-variant py-2">Weather details currently unavailable.</div>
          )}
        </div>
      )}

      {/* 9. Disease Alert (CONDITIONAL - moderate/high only, else collapsed) */}
      {dashboardData && (
        <div className={`p-4 rounded-card border transition-all ${
          dashboardData.diseaseRisk === 'High' || dashboardData.diseaseRisk === 'Medium'
            ? 'bg-red-50/40 border-red-200 shadow-xs'
            : 'bg-white border-outline-variant/60 shadow-xs'
        }`}>
          {dashboardData.diseaseRisk === 'High' || dashboardData.diseaseRisk === 'Medium' ? (
            <div className="flex gap-3 justify-between items-start">
              <div className="flex gap-2.5 items-start">
                <ShieldAlert className="text-red-700 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-black text-red-950">{t("Active Disease Risk Alert!", language)}</h4>
                  <p className="text-xs text-red-900/90 font-semibold mt-0.5">
                    {activeFarm?.crop?.name === 'wheat' ? t('Weather conditions indicate elevated risk of Stripe Rust in your area.', language) : t('Weather conditions indicate elevated risk of Blast disease in your area.', language)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDashboardTab('diagnosis')}
                className="bg-red-700 hover:bg-red-800 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shrink-0 min-h-[36px]"
              >
                {t("Scan Leaf", language)}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
              <span className="flex items-center gap-1.5 text-green-700 font-extrabold">
                <CheckCircle2 size={16} /> No major disease risk detected today.
              </span>
              <button 
                onClick={() => setActiveDashboardTab('diagnosis')}
                className="text-primary hover:underline min-h-[36px]"
              >
                Run Scan
              </button>
            </div>
          )}
        </div>
      )}

      {/* 10. Eligible Government Schemes */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl font-bold">auto_awesome</span>
            {t("Eligible Benefits", language)} ({activeFarm?.state ? t(activeFarm.state, language) : t('Maharashtra', language)})
          </h3>
          <button 
            onClick={() => setActiveDashboardTab('schemes')}
            className="text-xs text-primary font-bold hover:underline min-h-[36px]"
          >
            {t("All Schemes →", language)}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[
            { id: 1, name: t('PM Kisan Samman Nidhi', language), benefits: t('₹6,000 / year direct subsidy', language), deadline: t('Apply by July 15', language) },
            { id: 2, name: t('Subsidized Fertilizers Distribution', language), benefits: t('Up to 50% discount on Urea bags', language), deadline: t('Ongoing at APMC Coop', language) }
          ].map(scheme => (
            <div 
              key={scheme.id}
              className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low/40 flex justify-between items-center gap-3"
            >
              <div>
                <h4 className="font-bold text-xs text-on-surface">{scheme.name}</h4>
                <p className="text-[10px] text-primary font-black mt-1">{scheme.benefits}</p>
                <span className="text-[10px] text-amber-800 font-extrabold block mt-0.5">⚠️ {scheme.deadline}</span>
              </div>
              <button 
                onClick={() => setSelectedScheme(scheme)}
                className="bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-extrabold text-[11px] px-3 py-1.5 rounded-lg shrink-0 min-h-[36px]"
              >
                {t("Apply", language)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 11. Insights & Reminders */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-3">
        <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          {t("Insights & Upcoming Reminders", language)}
        </h3>
        <div className="space-y-2.5">
          {[
            { msg: 'Expected flowering milestone begins next week. Monitor moisture levels.', icon: 'water_drop', color: 'text-blue-500' },
            { msg: 'N-P-K fertilizer application due in 3 days based on crop stage planner.', icon: 'agriculture', color: 'text-primary' },
            { msg: 'Government schemes registry deadline approaching soon.', icon: 'campaign', color: 'text-amber-600' }
          ].map((rem, i) => (
            <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-on-surface-variant p-2.5 rounded-xl bg-slate-50/50 border border-outline-variant/30">
              <span className={`material-symbols-outlined text-sm mt-0.5 ${rem.color}`}>{rem.icon}</span>
              <span className="leading-normal">{t(rem.msg, language)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 12. Quick Actions */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-sm space-y-3">
        <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="material-symbols-outlined text-primary text-xl font-bold">bolt</span>
          {t("Quick Actions Control Grid", language)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Scan Disease', icon: 'photo_camera', tab: 'diagnosis' },
            { label: 'View Tasks', icon: 'task_alt', tab: 'tasks' },
            { label: 'Check Market Prices', icon: 'local_mall', tab: 'market' },
            { label: 'Ask AI Helper', icon: 'voice_chat', action: () => setVoiceAssistantOpen(true) },
            { label: 'Add Farm', icon: 'add_location', action: startNewFarmRegistration },
            { label: 'Switch Farm', icon: 'swap_horiz', action: () => setSelectedFarmIndex((selectedFarmIndex + 1) % farms.length) },
            { label: 'Crop Planner', icon: 'event_note', tab: 'season_planner' },
            { label: 'Farm Journey', icon: 'timeline', tab: 'journey' }
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => {
                if (act.tab) setActiveDashboardTab(act.tab);
                if (act.action) act.action();
              }}
              className="p-3.5 rounded-2xl border border-outline-variant/60 bg-white hover:border-primary/50 flex flex-col justify-center items-center text-center gap-2 transition-all shadow-xs hover:shadow-sm group min-h-[96px]"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">{act.icon}</span>
              <span className="text-xs font-black text-on-surface-variant leading-none">{t(act.label, language)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reschedule Task Modal Dialog */}
      {activeDialogTask && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto border border-outline-variant shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                Reschedule task
              </h3>
              <button onClick={() => setActiveDialogTask(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-on-surface block mb-1">Select Reschedule Date:</span>
                <input 
                  type="date"
                  value={selectedRescheduleDate}
                  onChange={(e) => setSelectedRescheduleDate(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-xs font-bold text-on-surface outline-none focus:border-primary min-h-[44px]"
                />
              </div>
              <div className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100 font-semibold leading-relaxed">
                ⚠️ <strong>Agronomic Warning:</strong> Delaying this fertilization/irrigation by more than 48 hours is not advised.
              </div>
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end gap-3">
              <button onClick={() => setActiveDialogTask(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold min-h-[40px]">Cancel</button>
              <button
                onClick={() => { alert(`Task "${activeDialogTask.title}" rescheduled.`); setActiveDialogTask(null); }}
                className="bg-primary hover:bg-secondary text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-sm min-h-[40px]"
              >
                {t("Reschedule", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandi Analysis Modal */}
      {selectedMandiDetails && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-outline-variant shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-sm font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-lg">trending_up</span> Mandi Price Trends Analysis
              </h3>
              <button onClick={() => setSelectedMandiDetails(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <div className="bg-surface-container-low p-3 rounded-xl border text-center font-bold text-on-surface">
                Selling Recommendation: <strong className="text-primary">{selectedMandiDetails.recommendation?.toUpperCase()}</strong>
              </div>
              <div className="space-y-2 border-b pb-3">
                <span className="font-bold text-on-surface block">Distance & Transport Math:</span>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-on-surface-variant">
                  <div>📍 Mandi: {selectedMandiDetails.recommendedMandi}</div>
                  <div>💰 Adjusted Rate: {selectedMandiDetails.adjustedEarnings}</div>
                  <div>📈 Profit Gain: {selectedMandiDetails.expectedProfitIncrease}</div>
                  <div>🎯 Confidence: {selectedMandiDetails.confidence}%</div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-on-surface block">Mandi Price Index (Past 3 Weeks):</span>
                <div className="flex justify-between text-[11px] font-bold text-on-surface bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/30">
                  <div>Week 1: <span className="text-on-surface-variant">₹2,100</span></div>
                  <div>Week 2: <span className="text-on-surface-variant">₹2,180</span></div>
                  <div>Week 3: <span className="text-primary font-bold">₹2,280</span></div>
                </div>
              </div>
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end">
              <button onClick={() => setSelectedMandiDetails(null)} className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl text-sm min-h-[40px]">
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Government Scheme Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto border border-outline-variant shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-sm font-bold text-primary">{selectedScheme.name}</h3>
              <button onClick={() => setSelectedScheme(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold block text-on-surface mb-1">Eligible benefits:</span>
                <p className="font-semibold text-primary">{selectedScheme.benefits}</p>
              </div>
              <div>
                <span className="font-bold block text-on-surface mb-1">Required Documents:</span>
                <ul className="space-y-1 text-on-surface-variant font-semibold">
                  <li>✓ Aadhaar Card (verified)</li>
                  <li>✓ Land holding registry (Khatauni)</li>
                  <li>✓ Bank Account details</li>
                  <li>? Crop Sowing certificate (Pending upload)</li>
                </ul>
              </div>
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-[10px] text-on-surface-variant font-semibold">
                KisanMitra will autofill PM-Kisan registry records based on your profile values.
              </div>
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end gap-3">
              <button onClick={() => setSelectedScheme(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold min-h-[40px]">Cancel</button>
              <button
                onClick={() => { alert(`Application drafted. Verification in 48 hours.`); setSelectedScheme(null); }}
                className="bg-primary hover:bg-secondary text-white font-extrabold px-5 py-2 rounded-xl text-xs min-h-[40px]"
              >
                {t("Apply Now", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Post Modal */}
      {selectedCommunityPost && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-outline-variant shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <div>
                <span className="text-xs text-primary font-bold">{selectedCommunityPost.author} ({selectedCommunityPost.location})</span>
                <h3 className="font-display font-extrabold text-sm text-on-surface leading-tight mt-0.5">{selectedCommunityPost.title}</h3>
              </div>
              <button onClick={() => setSelectedCommunityPost(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs leading-relaxed">
              <p className="font-semibold text-on-surface-variant bg-surface-container-low/40 p-3.5 rounded-xl border border-outline-variant/30">
                {selectedCommunityPost.content}
              </p>
              <div className="space-y-3">
                <span className="font-bold text-on-surface block">{t("Replies", language)} ({selectedCommunityPost.replies}):</span>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  <div className="p-2 rounded-lg bg-surface-container-low text-[11px]">
                    <span className="font-bold text-primary block">Anil K. (Vikas Nagar):</span>
                    Same spots noticed in my field. Recommending spraying neem oil dose.
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low text-[11px]">
                    <span className="font-bold text-primary block">Dr. S. Patil (Agronomist):</span>
                    Yes, early morning temperature rise is driving this. Spray propiconazole.
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end">
              <button onClick={() => setSelectedCommunityPost(null)} className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs min-h-[40px]">
                Close Discussions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Calendar Modal */}
      {showAllTasksModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-base font-bold text-primary">Next 7 Days Farming Calendar</h3>
              <button onClick={() => setShowAllTasksModal(false)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs leading-relaxed max-h-96 overflow-y-auto pr-1">
              {(() => {
                const today = new Date();
                const sevenDaysLater = new Date();
                sevenDaysLater.setDate(today.getDate() + 7);
                const todayStr = today.toISOString().split('T')[0];
                const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

                const upcomingTasks = (dashboardData?.tasks || [])
                  .filter(t => t.date > todayStr && t.date <= sevenDaysLaterStr && t.status !== 'completed')
                  .map(t => {
                    const taskDate = new Date(t.date);
                    const diffTime = taskDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    let dayLabel = t.date;
                    if (diffDays === 1) dayLabel = 'Tomorrow';
                    else if (diffDays === 2) dayLabel = 'Day after';
                    return {
                      day: dayLabel,
                      title: t.title,
                      category: t.category,
                      duration: t.duration || 'Flexible'
                    };
                  });

                if (upcomingTasks.length === 0) {
                  return [
                    { day: 'Rest Period', title: 'No scheduled operations in the next 7 days', category: 'Rest', duration: 'N/A' }
                  ];
                }
                return upcomingTasks;
              })().map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-outline-variant bg-surface-container-low/40 flex justify-between items-center gap-3">
                  <div>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 rounded px-1.5 py-0.5 uppercase">{item.day}</span>
                    <h4 className="font-bold text-on-surface text-xs mt-1.5 leading-tight">{item.title}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-on-surface-variant block font-medium">Type: {item.category}</span>
                    <span className="text-[10px] text-on-surface-variant block font-medium">Time: {item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end">
              <button onClick={() => setShowAllTasksModal(false)} className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs min-h-[40px]">
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
