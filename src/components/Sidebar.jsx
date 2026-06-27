import { t as tr } from '../utils/translations';
import React from 'react';

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
  completedTasks,
  setView,
  setFarms,
  setMobileNumber,
  setJwtToken,
  setDecodedToken,
  setSeasonPlanConfirmed
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;
  const pendingTasksCount = dashboardData 
    ? dashboardData.tasks.filter(task => !completedTasks.includes(task.id)).length 
    : 0;


  return (
    <>
      {/* Sidebar Navigation Drawer backdrop for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Collapsible Navigation Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-outline-variant/60 shadow-2xl lg:shadow-none lg:static flex flex-col sidebar-transition transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Farmer Profile Card inside Sidebar */}
        <div className="p-6 border-b border-surface-container-high bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center font-bold text-primary text-xl">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.name ? profile.name[0] : 'R'}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h4 className="font-display font-bold text-on-surface leading-tight truncate max-w-[150px]">
                {profile.name || 'Ramesh Ji'}
              </h4>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs">location_on</span>
                <span>{profile.village || 'Pimpalgaon'}</span>
              </p>
            </div>
          </div>

          {/* Mini switcher & Health summary if plan is active */}
          {seasonPlanConfirmed && farms.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">{tr("Active Farm Health:", language)}</span>
                <span className="font-bold text-primary">{dashboardData?.healthScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${dashboardData?.healthScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
            { id: 'farms', label: 'My Farms', icon: 'layers' },
            { id: 'planner', label: 'Annual Farm Planner', icon: 'calendar_month' },
            { id: 'season_planner', label: 'Season Planner', icon: 'potted_plant' },
            { id: 'tasks', label: "Today's Work", icon: 'task_alt', badge: pendingTasksCount },
            { id: 'journey', label: 'Farm Journey', icon: 'route' },
            { id: 'diagnosis', label: 'Disease Diagnosis', icon: 'photo_camera' },
            { id: 'market', label: 'Market Intelligence', icon: 'trending_up' },
            { id: 'schemes', label: 'Government Schemes', icon: 'assignment_ind' },
            { id: 'community', label: 'Community', icon: 'groups' },
            { id: 'reports', label: 'Reports & Analytics', icon: 'bar_chart' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications_none' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
            { id: 'help', label: 'Help & Support', icon: 'support_agent' }
          ].map(item => {
            const isActive = activeDashboardTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveDashboardTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-primary-container/10 text-primary border-l-4 border-primary pl-2' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                  <span>{tr(item.label, language)}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-primary text-white font-bold text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Drawer Footer */}
        <div className="p-4 border-t border-surface-container-high bg-white">
          <button 
            onClick={() => {
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
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>{tr("Sign Out / Reset", language)}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
