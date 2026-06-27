import { t } from '../../utils/translations';
import React from 'react';

export default function FarmingDashboard({
  farms,
  selectedFarmIndex,
  setSelectedFarmIndex,
  getFarmDashboardData,
  completedTasks,
  setCompletedTasks,
  activeDialogTask,
  setActiveDialogTask,
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
  language
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;

  if (!dashboardData) return null;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {translating && (
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl p-3 text-xs font-bold flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-sm font-bold animate-spin">sync</span>
          <span>{t("AI is translating your dashboard into the selected language...", language)}</span>
        </div>
      )}

      {/* 1. Horizontal Farm Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high pb-4">
        <div>
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t("Select Active Farm Profile", language)}</span>
          <div className="flex items-center gap-2 mt-1 overflow-x-auto no-scrollbar py-1">
            {farms.map((f, i) => (
              <button
                key={i}
                onClick={() => setSelectedFarmIndex(i)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  selectedFarmIndex === i
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white hover:bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}
              >
                🚜 {f.name} ({f.area} {f.unit})
              </button>
            ))}
            <button
              onClick={startNewFarmRegistration}
              className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 shrink-0"
            >
              + {t("Add Farm", language)}
            </button>
          </div>
        </div>

        <div className="text-xs text-on-surface-variant font-semibold flex items-center gap-1.5 shrink-0 bg-white border p-2 rounded-xl">
          <span className="material-symbols-outlined text-primary text-sm font-bold animate-spin-slow">sync</span>
          <span>{t("All details sync with:", language)} <strong>{activeFarm?.crop?.name?.toUpperCase()}</strong></span>
        </div>
      </div>

      {/* 2. Farm Digital Twin Card */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

          {/* Visual illustration / Ring */}
          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-surface-container-high pb-4 lg:pb-0 lg:pr-6">
            <div className="relative flex-shrink-0">
              <svg width="90" height="90" className="progress-ring">
                <circle stroke="#e9f0e5" strokeWidth="8" fill="transparent" r="36" cx="45" cy="45" />
                <circle
                  stroke="#006b2c"
                  strokeWidth="8"
                  fill="transparent"
                  r="36"
                  cx="45"
                  cy="45"
                  className="progress-ring__circle"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (dashboardData.growthProgress || 0) / 100)}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
                {dashboardData.cropIcon}
              </span>
            </div>

            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase block">{t("Active Digital Twin", language)}</span>
              <h3 className="font-display font-extrabold text-xl text-on-surface">
                {activeFarm?.name}
              </h3>
              <p className="text-xs text-on-surface-variant font-bold mt-0.5">
                Crop: <span className="text-primary">{dashboardData.cropName} ({activeFarm?.crop?.variety})</span>
              </p>
            </div>
          </div>

          {/* Center parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:col-span-2">
            {[
              { label: t('Crop Growth Stage', language), val: activeFarm?.crop?.stage, icon: 'psychology' },
              { label: t('Health Score', language), val: `${dashboardData.healthScore} / 100`, icon: 'favorite', color: 'text-red-600' },
              { label: t('Growth Progress', language), val: `${dashboardData.growthProgress}%`, icon: 'donut_large' },
              { label: t('Expected Yield', language), val: dashboardData.expectedYield, icon: 'inventory_2' },
              { label: t('Harvest Countdown', language), val: `${dashboardData.harvestDays} ${t('Days left', language)}`, icon: 'schedule' },
              { label: t('Estimated Profit', language), val: `₹${dashboardData.estimatedProfit.toLocaleString('en-IN')}`, icon: 'payments', color: 'text-green-700' },
              { label: t('Disease Risk', language), val: dashboardData.diseaseRisk, icon: 'pest_control', color: dashboardData.diseaseRisk === 'Low' ? 'text-primary' : 'text-amber-600' },
              { label: t('Water Status', language), val: dashboardData.waterStatus, icon: 'water_drop', color: 'text-blue-600' }
            ].map((param, idx) => (
              <div key={idx} className="bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/30 flex items-start gap-2.5">
                <span className={`material-symbols-outlined text-sm mt-0.5 ${param.color || 'text-on-surface-variant'}`}>{param.icon}</span>
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-medium leading-none mb-1">{param.label}</span>
                  <span className="text-xs font-extrabold text-on-surface">{param.val}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Today's Work Schedule */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
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
            className="text-xs font-bold text-primary hover:underline"
          >
            {t("View Next 7 Days", language)}
          </button>
        </div>

        <div className="space-y-4">
          {(() => {
            const tasks = dashboardData.tasks || [];
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
                      className="text-xs font-bold text-primary border border-primary/20 rounded-lg px-3 py-1 bg-white hover:bg-primary/5"
                    >
                      {t("Undo Completed Tasks", language)}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {pending.map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-outline-variant/80 bg-white hover:border-primary/40 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row gap-4 items-start"
                  >
                    {/* Left side: Time, category */}
                    <div className="md:w-36 flex-shrink-0 flex md:flex-col justify-between md:justify-start gap-2">
                      <div>
                        <span className="text-xs text-primary font-bold bg-primary/10 rounded-md px-2 py-0.5 block w-max">
                          {task.category}
                        </span>
                        <span className="text-sm font-extrabold text-on-surface mt-1.5 block">
                          ⏰ {task.time}
                        </span>
                      </div>
                      <div className="flex md:flex-col items-center md:items-start gap-1">
                        <span className="text-[10px] text-on-surface-variant font-medium">{t("Duration:", language)} {task.duration}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {task.priority === 'High' ? t("High Priority", language) : t("Medium Priority", language)}
                        </span>
                      </div>
                    </div>

                    {/* Center: Details */}
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-base text-on-surface">{task.title}</h4>
                      <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/30">
                        <p>💡 <strong>Why:</strong> {task.why}</p>
                        <p>📈 <strong>Expected Benefit:</strong> <span className="text-primary font-semibold">{task.benefit}</span></p>
                        <p className="mt-1 text-[11px] text-on-surface-variant">🎒 <strong>Required inputs:</strong> {task.resources}</p>
                      </div>
                    </div>

                    {/* Right side: Action CTA */}
                    <div className="w-full md:w-auto flex md:flex-col justify-end gap-2.5 self-center">
                      <button
                        onClick={() => setCompletedTasks([...completedTasks, task.id])}
                        className="flex-grow md:flex-grow-0 bg-primary hover:bg-secondary text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                        <span>{t("Complete", language)}</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveDialogTask(task);
                            setSelectedRescheduleDate('');
                          }}
                          className="flex-1 p-2 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-xs text-on-surface-variant font-bold flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {t("Reschedule", language)}
                        </button>
                        <button
                          onClick={() => {
                            setVoiceAssistantOpen(true);
                            setVoiceReplies(prev => [
                              ...prev,
                              { sender: 'user', text: `Tell me about task: ${task.title}` },
                              { sender: 'ai', text: `Sure. The task "${task.title}" is scheduled at ${task.time}. It is recommended because: ${task.why}. Benefit: ${task.benefit}.` }
                            ]);
                          }}
                          className="p-2 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-primary flex items-center justify-center"
                          title={t("Ask Voice Assistant", language)}
                        >
                          <span className="material-symbols-outlined text-sm font-bold">mic</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 4. Intelligent Action Feed */}
      <div className="space-y-3">
        <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-amber-600 font-bold">bolt</span>
          {t("Dynamic Advisor Action Feed", language)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const actions = dashboardData.actionFeed || [];
            if (actions.length === 0) {
              return (
                <div className="md:col-span-2 p-4 bg-white rounded-2xl border text-center text-xs font-semibold text-on-surface-variant">
                  No immediate warnings. Your fields are running smoothly!
                </div>
              );
            }

            return actions.map(act => (
              <div key={act.id} className="bg-white border-l-4 border-l-amber-500 border border-outline-variant/60 rounded-card p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${act.type === 'disease' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    {act.title}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase">{t("Actionable", language)}</span>
                </div>

                <div className="text-xs space-y-1.5 leading-relaxed text-on-surface-variant">
                  <p>⚠️ <strong>Problem:</strong> {act.problem}</p>
                  <p>🔬 <strong>Reason:</strong> {act.reason}</p>
                  <p>🚜 <strong>Recommendation:</strong> <span className="font-semibold text-on-surface">{act.action}</span></p>
                  <p>📈 <strong>Benefit:</strong> <span className="text-primary font-bold">{act.benefit}</span></p>
                </div>

                <button
                  onClick={() => {
                    if (act.type === 'disease') setActiveDashboardTab('diagnosis');
                    else if (act.type === 'weather') alert("Irrigation cycle rescheduled. System updated.");
                    else if (act.type === 'market') setActiveDashboardTab('market');
                    else if (act.type === 'deadline') alert("Redirecting to portal verification...");
                  }}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-primary font-bold py-2 rounded-xl text-xs text-center border border-outline-variant/40 transition-colors"
                >
                  {act.actionText}
                </button>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 5. Farm Progress Timeline & Weather Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Progress Timeline */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">route</span>
            {t("Farm Journey Timeline", language)}
          </h3>

          <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-bold py-2">
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
                <div key={step.idx} className="space-y-2 flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : isActive
                        ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant/60'
                  }`}>
                    {isCompleted ? '✓' : step.idx + 1}
                  </div>
                  <span className={`block leading-none truncate max-w-[50px] ${isActive ? 'text-primary font-black' : 'text-on-surface-variant font-medium'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs font-semibold text-on-surface flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-sm font-bold mt-0.5">info</span>
            <div className="leading-relaxed">
              Currently in <strong>{activeFarm?.crop?.stage} Stage</strong>. Sowing was done on {activeFarm?.crop?.sowingDate}. Estimated remaining days to Flowering: <strong>18 days</strong>.
            </div>
          </div>
        </div>

        {/* Weather Intelligence */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600 text-xl font-bold">wb_sunny</span>
            {t("Weather Intelligence", language)}
          </h3>

          <div className="flex justify-between items-center border-b border-surface-container-high pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">31°C</span>
              <div>
                <span className="text-xs font-extrabold text-on-surface block">Nashik</span>
                <span className="text-[10px] text-on-surface-variant font-medium leading-none">Humidity: 65% | Wind: 8 km/h</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {t("Rain Chance:", language)} 82%
            </span>
          </div>

          <div className="p-3 bg-[#fcf8f0] border border-amber-100 rounded-xl text-xs flex gap-2 items-start font-semibold text-amber-900">
            <span className="material-symbols-outlined text-amber-700 text-sm font-bold mt-0.5">tips_and_updates</span>
            <div>
              <span className="block font-bold text-amber-950 mb-0.5">{t("Agricultural Advisory:", language)}</span>
              {dashboardData.weatherInterpretation}
            </div>
          </div>
        </div>

      </div>

      {/* 6. Health Gauges & Market Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Health Gauges */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl font-bold">monitoring</span>
            {t("Apple Health-style Farm Indicators", language)}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {[
              { name: t('Water Health', language), val: dashboardData.healthMetrics.water, color: '#0ea5e9' },
              { name: t('Nutrient Health', language), val: dashboardData.healthMetrics.nutrient, color: '#eab308' },
              { name: t('Disease Prevention', language), val: 100 - (dashboardData.healthMetrics.disease || 0), color: '#ef4444' },
              { name: t('Market Readiness', language), val: dashboardData.healthMetrics.readiness, color: '#22c55e' }
            ].map((gauge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 bg-surface-container-low/40 rounded-xl p-3 border border-outline-variant/30">
                <div className="relative">
                  <svg width="64" height="64" className="progress-ring">
                    <circle stroke="#e9f0e5" strokeWidth="5" fill="transparent" r="26" cx="32" cy="32" />
                    <circle
                      stroke={gauge.color}
                      strokeWidth="5"
                      fill="transparent"
                      r="26"
                      cx="32"
                      cy="32"
                      className="progress-ring__circle"
                      strokeDasharray="163"
                      strokeDashoffset={163 - (163 * gauge.val / 100)}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-surface">
                    {gauge.val}%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">{gauge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-green-700 text-xl font-bold">trending_up</span>
            {t("Market Intelligence", language)}
          </h3>

          <div className="p-3.5 bg-[#f0fcf4] rounded-xl border border-primary/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-semibold">{t("Should I Sell Today?", language)}</span>
              <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${
                dashboardData.market.recommendation === 'Sell' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {dashboardData.market.recommendation.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xl font-black text-on-surface">
                {dashboardData.market.adjustedEarnings}
              </span>
              <span className="text-[10px] text-green-700 font-bold">
                📈 {t("Trend: Rising", language)} ({dashboardData.market.confidence}% confidence)
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {dashboardData.market.reasoning}
            </p>
          </div>

          <button
            onClick={() => setSelectedMandiDetails(dashboardData.market)}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-2.5 rounded-xl text-xs text-center shadow-sm transition-all"
          >
            {t("View Mandi & Transport Analysis", language)}
          </button>
        </div>

      </div>

      {/* 7. Government Benefits & Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Government Benefits */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
            <span className="material-symbols-outlined text-primary text-xl">assignment_ind</span>
            {t("Customized Government Schemes", language)}
          </h3>

          <div className="space-y-3">
            {dashboardData.schemes.map(sch => (
              <div key={sch.id} className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 space-y-2.5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface leading-tight">{sch.name}</h4>
                    <span className="text-[10px] text-primary font-bold mt-1 block">Benefit: {sch.benefits}</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded-full shrink-0 border border-green-200">
                    {sch.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">{t("Deadline:", language)} <strong className="text-on-surface">{sch.deadline}</strong></span>
                  <button
                    onClick={() => setSelectedScheme(sch)}
                    className="bg-primary hover:bg-secondary text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] transition-all"
                  >
                    {t("Apply Now", language)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Highlights */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
            <span className="material-symbols-outlined text-primary text-xl">groups</span>
            {t("Nearby Regional Bulletins", language)}
          </h3>

          <div className="space-y-3">
            {dashboardData.community.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedCommunityPost(post)}
                className="p-3.5 rounded-xl border border-outline-variant/60 hover:border-primary/40 bg-white shadow-xs cursor-pointer transition-colors space-y-2"
              >
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-primary">{post.author} ({post.location})</span>
                  <span className="text-on-surface-variant text-[10px]">{post.date}</span>
                </div>
                <h4 className="font-bold text-xs text-on-surface leading-tight">{post.title}</h4>
                <p className="text-[11px] text-on-surface-variant truncate leading-relaxed">
                  {post.content}
                </p>
                <div className="flex gap-3 text-[10px] text-on-surface-variant font-bold mt-1">
                  <span>💬 {post.replies} {t("Replies", language)}</span>
                  <span>👍 {post.likes} {t("Likes", language)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 8. Reschedule Modal */}
      {activeDialogTask && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <h3 className="font-display text-sm font-bold text-on-surface">{t("Reschedule", language)} Task</h3>
              <button onClick={() => setActiveDialogTask(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div className="text-xs">
                <span className="font-semibold text-on-surface-variant block">Task:</span>
                <span className="font-bold text-on-surface">{activeDialogTask.title}</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs text-on-surface">Select New Date & Time</label>
                <input
                  type="date"
                  value={selectedRescheduleDate}
                  onChange={(e) => setSelectedRescheduleDate(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold"
                />
              </div>
              <div className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100 font-semibold leading-relaxed">
                ⚠️ <strong>Agronomic Warning:</strong> Delaying this fertilization/irrigation by more than 48 hours is not advised.
              </div>
            </div>
            <div className="border-t border-surface-container-high pt-4 flex justify-end gap-3">
              <button onClick={() => setActiveDialogTask(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
              <button
                onClick={() => { alert(`Task "${activeDialogTask.title}" rescheduled.`); setActiveDialogTask(null); }}
                className="bg-primary hover:bg-secondary text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-sm"
              >
                {t("Reschedule", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Mandi Analysis Modal */}
      {selectedMandiDetails && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
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
              <button onClick={() => setSelectedMandiDetails(null)} className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl text-sm">
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Government Scheme Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
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
              <button onClick={() => setSelectedScheme(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
              <button
                onClick={() => { alert(`Application drafted. Verification in 48 hours.`); setSelectedScheme(null); }}
                className="bg-primary hover:bg-secondary text-white font-extrabold px-5 py-2 rounded-xl text-xs"
              >
                {t("Apply Now", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Community Post Modal */}
      {selectedCommunityPost && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
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
              <button onClick={() => setSelectedCommunityPost(null)} className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs">
                Close Discussions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. 7-Day Calendar Modal */}
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
              {[
                { day: 'Tomorrow', title: 'Check drip line clogging', category: 'Irrigation', duration: '1 hour' },
                { day: 'Day after', title: 'Prepare compost mixture dressing', category: 'Nutrition', duration: '2 hours' },
                { day: 'July 1st', title: 'Pesticide weed spray', category: 'Protection', duration: '2.5 hours' },
                { day: 'July 3rd', title: 'Secondary tillering measurement check', category: 'Agronomy', duration: '1 hour' }
              ].map((item, idx) => (
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
              <button onClick={() => setShowAllTasksModal(false)} className="bg-primary hover:bg-secondary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs">
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
