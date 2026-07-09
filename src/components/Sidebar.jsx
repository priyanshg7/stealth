import { t as tr } from '../utils/translations';
import React, { useEffect, useRef } from 'react';

export default function Sidebar({
  isDemo,
  language,
  profile,
  seasonPlanConfirmed,
  farms,
  selectedFarmIndex,
  getFarmDashboardData,
  activeDashboardTab,
  setActiveDashboardTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  completedTasks,
  setView,
  setFarms,
  setMobileNumber,
  setJwtToken,
  setDecodedToken,
  setSeasonPlanConfirmed,
  jwtToken,
  handleSignOut
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;
  const pendingTasksCount = dashboardData 
    ? dashboardData.tasks.filter(task => !completedTasks.includes(task.id)).length 
    : 0;

  // When a nav item is clicked: navigate + auto-collapse on desktop, close drawer on mobile
  const handleNavClick = (tabId) => {
    setActiveDashboardTab(tabId);
    setSidebarOpen(false);       // close mobile drawer
    // We do not force collapse on desktop anymore so user can leave it open
  };

  const navRef = useRef(null);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen, setSidebarOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeDashboardTab, sidebarCollapsed]);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'weather', label: 'Weather Intelligence', icon: 'thermostat' },
    { id: 'planner', label: 'Annual Farm Planner', icon: 'calendar_month' },
    { id: 'season_planner', label: 'Season Planner', icon: 'potted_plant' },
    { id: 'tasks', label: "Today's Work", icon: 'task_alt', badge: pendingTasksCount },
    { id: 'journey', label: 'Farm Journey', icon: 'route' },
    { id: 'diagnosis', label: 'Disease Diagnosis', icon: 'photo_camera' },
    { id: 'market', label: 'Market Intelligence', icon: 'trending_up' },
    { id: 'schemes', label: 'Government Schemes', icon: 'assignment_ind' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] flex flex-col
          bg-white border-r border-outline-variant/60 shadow-2xl
          transform transition-[width,transform] duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 flex-shrink-0 h-[100dvh]
          w-[85vw] max-w-[320px]
          ${sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
        `}
      >
        {/* ── HEADER: Logo / Profile ── */}
        <div
          className={`flex items-center border-b border-surface-container-high bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 flex-shrink-0 overflow-hidden whitespace-nowrap
            ${sidebarCollapsed ? 'p-4 lg:p-0 lg:h-[80px] lg:justify-center' : 'p-4 gap-3'}`}
        >
          {/* Avatar always visible */}
          <div className="relative flex-shrink-0 flex items-center justify-center lg:w-[80px] lg:h-[80px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center font-bold text-primary text-base">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name ? profile.name[0] : 'R'}</span>
              )}
            </div>
            <span className="absolute bottom-4 right-4 lg:bottom-[22px] lg:right-[22px] h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Name + location — fades out when collapsed on desktop */}
          <div className={`transition-all duration-300 overflow-hidden flex flex-col justify-center ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100 w-auto min-w-0 pr-4'}`}>
            <h4 className="font-display font-bold text-on-surface text-sm leading-tight truncate">
              {profile.name || 'Ramesh Ji'}
            </h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined notranslate text-xs">location_on</span>
              <span className="truncate">{profile.village || 'Pimpalgaon'}</span>
            </p>
            {/* Farm health bar */}
            {seasonPlanConfirmed && farms.length > 0 && (
              <div className="mt-2 bg-surface-container-low border border-outline-variant/50 rounded-lg p-2 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">{tr("Farm Health:", language)}</span>
                  <span className="font-bold text-primary">{dashboardData?.healthScore}%</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all" 
                    style={{ width: `${dashboardData?.healthScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <nav 
          ref={navRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 scroll-smooth
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-outline-variant/30 hover:[&::-webkit-scrollbar-thumb]:bg-outline-variant/60 [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {NAV_ITEMS.map(item => {
            const isActive = activeDashboardTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? tr(item.label, language) : undefined}
                className={`
                  w-full flex items-center font-semibold text-[15px] transition-colors duration-200 whitespace-nowrap overflow-hidden relative
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }
                `}
              >
                {/* Active Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isActive ? 'bg-primary' : 'bg-transparent'}`} />

                {/* Fixed width icon wrapper to ensure perfect centering */}
                <div className="w-14 lg:w-[80px] h-12 flex-shrink-0 flex items-center justify-center">
                  <span className={`material-symbols-outlined notranslate text-xl transition-all duration-300 ${isActive ? 'fill' : ''}`}>
                    {item.icon}
                  </span>
                </div>
                
                {/* Text and Badge Container */}
                <div className={`flex items-center justify-between transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100 pr-4'}`}>
                  <span className="text-left truncate">
                    {tr(item.label, language)}
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-primary text-white font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Collapsed badge dot */}
                {item.badge > 0 && sidebarCollapsed && (
                  <span className="hidden lg:block absolute right-[22px] top-[10px] h-2 w-2 bg-primary rounded-full shadow-sm ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── FOOTER: JWT Inspector + Sign Out ── */}
        <div className={`border-t border-surface-container-high bg-white transition-all duration-300 flex-shrink-0 overflow-hidden whitespace-nowrap space-y-1
          ${sidebarCollapsed ? 'p-2 lg:p-0 lg:py-2' : 'p-3'}`}
        >
          {/* Exit Demo (only in demo environment) */}
          {isDemo && (
            <button
              onClick={() => {
                if (handleSignOut) handleSignOut();
                setView('WELCOME');
                setFarms([]);
                setMobileNumber('');
                setJwtToken('');
                setDecodedToken(null);
                setSeasonPlanConfirmed(false);
                localStorage.removeItem('km_jwt');
                localStorage.removeItem('km_decoded_jwt');
                localStorage.removeItem('km_season_confirmed');
              }}
              title={sidebarCollapsed ? 'Exit Demo' : undefined}
              className={`w-full flex items-center font-bold text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors rounded-xl overflow-hidden relative
                ${sidebarCollapsed ? 'lg:rounded-none lg:bg-transparent lg:hover:bg-amber-50' : 'border border-amber-200'}`}
            >
              <div className="w-12 lg:w-[80px] h-12 flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined notranslate text-lg">science</span>
              </div>
              <span className={`text-left truncate transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100 pr-3'}`}>
                Exit Demo
              </span>
            </button>
          )}

          {/* Sign Out */}
          <button 
            onClick={() => {
              if (handleSignOut) handleSignOut();
              setView('WELCOME');
              setFarms([]);
              setMobileNumber('');
              setJwtToken('');
              setDecodedToken(null);
              setSeasonPlanConfirmed(false);
              localStorage.removeItem('km_jwt');
              localStorage.removeItem('km_decoded_jwt');
              localStorage.removeItem('km_season_confirmed');
            }}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center font-bold text-sm text-red-600 transition-colors rounded-xl overflow-hidden relative
              ${sidebarCollapsed ? 'hover:bg-red-50 lg:rounded-none lg:hover:bg-red-50' : 'hover:bg-red-50 hover:text-red-700'}`}
          >
            <div className="w-12 lg:w-[80px] h-12 flex-shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined notranslate text-lg">logout</span>
            </div>
            <span className={`text-left truncate transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'flex-1 opacity-100 pr-3'}`}>
              {tr("Sign Out / Reset", language)}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
