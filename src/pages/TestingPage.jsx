import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TestingPage() {
  const navigate = useNavigate();
  const { demoLogin, logout, isAuthenticated, isDemo, profile, jwtToken, DEMO_PROFILES } = useAuth();
  const [storageKeys, setStorageKeys] = useState([]);
  const [message, setMessage] = useState('');

  const refreshStorageInfo = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('km_')) {
        const val = localStorage.getItem(key);
        keys.push({ key, size: val ? val.length : 0 });
      }
    }
    keys.sort((a, b) => a.key.localeCompare(b.key));
    setStorageKeys(keys);
  };

  useEffect(() => {
    refreshStorageInfo();
  }, [isAuthenticated, isDemo]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDemoLogin = async (personaKey) => {
    demoLogin(personaKey);
    showMessage(`✅ Logged in as ${DEMO_PROFILES[personaKey].profile.name}`);
    refreshStorageInfo();
  };

  const handleResetDemoData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('km_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    showMessage(`🗑️ Cleared ${keysToRemove.length} localStorage keys`);
    refreshStorageInfo();
  };

  const handleClearAll = () => {
    localStorage.clear();
    showMessage('💥 All localStorage cleared');
    refreshStorageInfo();
    window.location.reload();
  };

  const handleSwitchFarm = () => {
    const current = parseInt(localStorage.getItem('km_selected_farm_index') || '0', 10);
    const next = current === 0 ? 1 : 0;
    localStorage.setItem('km_selected_farm_index', next.toString());
    showMessage(`🔄 Switched to Farm Index: ${next}`);
    refreshStorageInfo();
  };

  const handleLogout = async () => {
    await logout();
    showMessage('👋 Logged out');
    refreshStorageInfo();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
              🛠
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">KisanMitra Developer Console</h1>
              <p className="text-xs text-gray-500">Internal Testing & Debug Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isAuthenticated ? (isDemo ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400') : 'bg-gray-700 text-gray-400'}`}>
              {isAuthenticated ? (isDemo ? '🔬 DEMO' : '🔐 AUTH') : '⚪ GUEST'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Status message */}
        {message && (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in-up">
            {message}
          </div>
        )}

        {/* Current State */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Current State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/60 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Auth Status</div>
              <div className={`text-sm font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-gray-500'}`}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Mode</div>
              <div className={`text-sm font-bold ${isDemo ? 'text-amber-400' : 'text-sky-400'}`}>
                {isDemo ? 'Demo Mode' : 'Production'}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">User</div>
              <div className="text-sm font-bold text-white truncate">
                {profile?.name || 'None'}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Storage Keys</div>
              <div className="text-sm font-bold text-white">{storageKeys.length}</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleDemoLogin('rajesh')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">👨‍🌾</div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400">Demo: Rajesh</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Maharashtra · Wheat</div>
            </button>

            <button
              onClick={() => handleDemoLogin('priya')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-sky-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">👩‍🌾</div>
              <div className="text-xs font-bold text-white group-hover:text-sky-400">Demo: Priya</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Punjab · Rice</div>
            </button>

            <button
              onClick={handleSwitchFarm}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">🔄</div>
              <div className="text-xs font-bold text-white group-hover:text-violet-400">Switch Farm</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Toggle farm index</div>
            </button>

            <button
              onClick={handleResetDemoData}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">🗑️</div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400">Reset KM Data</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Clear km_* keys</div>
            </button>

            <button
              onClick={handleClearAll}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">💥</div>
              <div className="text-xs font-bold text-white group-hover:text-red-400">Clear All Storage</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Nuclear reset</div>
            </button>

            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-600 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-lg mb-2">👋</div>
              <div className="text-xs font-bold text-white group-hover:text-orange-400">Logout</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Sign out current user</div>
            </button>
          </div>
        </section>

        {/* Navigation */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Navigation</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '🏠 Landing', path: '/' },
              { label: '🔐 Login', path: '/login' },
              { label: '🔬 Demo', path: '/demo' },
              { label: '📊 App', path: '/app' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>
        </section>

        {/* Storage Inspector */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">LocalStorage (km_* keys)</h2>
            <button
              onClick={refreshStorageInfo}
              className="text-[10px] text-gray-500 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
          {storageKeys.length === 0 ? (
            <p className="text-xs text-gray-600">No km_* keys found in localStorage.</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {storageKeys.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/40 hover:bg-gray-800/80 transition-colors">
                  <span className="text-xs text-gray-300 font-medium truncate flex-1">{item.key}</span>
                  <span className="text-[10px] text-gray-600 ml-4 flex-shrink-0">{(item.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* JWT Info */}
        {jwtToken && (
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">JWT Token</h2>
            <div className="bg-gray-800/60 rounded-xl p-4 overflow-x-auto">
              <code className="text-[10px] text-gray-400 break-all leading-relaxed">
                <span className="text-red-400">{jwtToken.split('.')[0]}</span>.
                <span className="text-blue-400">{jwtToken.split('.')[1]}</span>.
                <span className="text-green-400">{jwtToken.split('.')[2]}</span>
              </code>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-center">
        <p className="text-[10px] text-gray-600">
          This page is for development use only. Not visible in production navigation.
        </p>
      </footer>
    </div>
  );
}
