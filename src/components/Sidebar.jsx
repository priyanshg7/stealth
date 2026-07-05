import { t as tr } from '../utils/translations';
import React from 'react';
import { Cpu } from 'lucide-react';

export default function Sidebar({
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
  setShowJwtInspector,
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
    setSidebarCollapsed(true);   // collapse desktop sidebar to icon-only
  };

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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white border-r border-outline-variant/60 shadow-2xl
          sidebar-transition transform
          transition-[width,transform] duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
          ${sidebarCollapsed ? 'lg:w-20 overflow-hidden h-screen' : 'lg:w-72'}
          w-72
        `}
      >
        {/* ── HEADER: Logo / Profile ── */}
        <div
          className={`flex items-center border-b border-surface-container-high bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300
            ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-4 p-4' : 'p-4 gap-3'}`}
        >
          {/* Avatar always visible */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center font-bold text-primary text-base">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name ? profile.name[0] : 'R'}</span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Name + location — hidden when collapsed on desktop */}
          <div className={`min-w-0 flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <h4 className="font-display font-bold text-on-surface text-sm leading-tight truncate">
              {profile.name || 'Ramesh Ji'}
            </h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">location_on</span>
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
        <nav className={`flex-1 ${sidebarCollapsed ? 'overflow-hidden' : 'overflow-y-auto'} py-3 space-y-0.5 no-scrollbar`}>
          {NAV_ITEMS.map(item => {
            const isActive = activeDashboardTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? tr(item.label, language) : undefined}
                className={`
                  w-full flex items-center font-semibold text-sm transition-all duration-150
                  ${sidebarCollapsed
                    ? 'lg:justify-center lg:px-2 lg:py-3 px-4 py-3 justify-start gap-3'
                    : 'px-4 py-3 gap-3'
                  }
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-4 border-transparent'
                  }
                `}
              >
                <span className={`material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className={`flex-1 text-left truncate transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  {tr(item.label, language)}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className={`bg-primary text-white font-bold text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {item.badge}
                  </span>
                )}
                {/* Collapsed badge dot */}
                {item.badge && item.badge > 0 && sidebarCollapsed && (
                  <span className="hidden lg:block absolute right-2 top-2 h-2 w-2 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── FOOTER: JWT Inspector + Sign Out ── */}
        <div className={`border-t border-surface-container-high bg-white transition-all duration-300 ${sidebarCollapsed ? 'lg:px-2 lg:py-3 p-3' : 'p-3'} space-y-1`}>
          {/* JWT Inspector (only when token exists) */}
          {jwtToken && (
            <button
              onClick={() => setShowJwtInspector && setShowJwtInspector(true)}
              title={sidebarCollapsed ? 'Inspect JWT' : undefined}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl font-semibold text-xs text-[#006e2d] bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] transition-colors
                ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
            >
              <Cpu className="w-4 h-4 flex-shrink-0" />
              <span className={`truncate transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                Inspect JWT
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
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors
              ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0">logout</span>
            <span className={`truncate transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              {tr("Sign Out / Reset", language)}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
