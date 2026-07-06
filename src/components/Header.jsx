import { t } from '../utils/translations';
import React from 'react';

export default function Header({
  profile,
  language,
  setLanguage,
  languages,
  setActiveDashboardTab,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  setVoiceAssistantOpen,
  isListening,
  startSpeechRecognition,
  handleVoiceCommand
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-container-high px-4 py-3 flex items-center justify-between gap-4 shadow-sm">
      
      {/* Left Side: Sidebar Toggle + Dynamic Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — opens mobile drawer */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-3 rounded-xl border border-outline-variant hover:bg-surface-container lg:hidden text-on-surface-variant flex items-center justify-center min-h-[48px] min-w-[48px]"
          title="Open navigation"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Desktop collapse/expand toggle */}
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="hidden lg:flex p-3 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors min-h-[48px] min-w-[48px] items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-xl">
            {sidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
        
        <div>
          <h2 className="font-display font-bold text-base md:text-lg text-on-surface flex items-center gap-1.5">
            <span>
              {(() => {
                const hr = new Date().getHours();
                if (hr < 12) return t('Good Morning', language);
                if (hr < 17) return t('Good Afternoon', language);
                return t('Good Evening', language);
              })()}
            </span>
            <span className="text-primary font-extrabold">
              {profile.name ? `${profile.name.split(' ')[0]} Ji` : 'Ramesh Ji'}
            </span>
            <span>🌾</span>
          </h2>
          <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right Side: Lang Switcher, Voice Helper, Notifications */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Language Dropdown Selector */}
        <div className="relative">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl min-h-[48px] px-3 pr-8 text-[13px] md:text-sm font-bold text-on-surface appearance-none cursor-pointer w-full max-w-[100px] md:max-w-none"
          >
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.native}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-on-surface-variant">arrow_drop_down</span>
        </div>

        {/* Notification Button */}
        <button 
          onClick={() => setActiveDashboardTab('notifications')}
          className="p-3 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant relative min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-600 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-600 rounded-full" />
        </button>

        {/* Microphone shortcut */}
        <button 
          onClick={() => {
            setVoiceAssistantOpen(true);
            startSpeechRecognition(
              (transcript) => {
                handleVoiceCommand(transcript);
              },
              (err) => console.error("Mic error:", err)
            );
          }}
          className={`bg-primary hover:bg-secondary text-white p-3 rounded-xl flex items-center justify-center shadow-md min-h-[48px] min-w-[48px] ${isListening ? 'bg-red-600 animate-pulse' : 'animate-pulse-ring'}`}
        >
          <span className="material-symbols-outlined text-lg font-bold">{isListening ? 'settings_voice' : 'mic'}</span>
        </button>

      </div>
    </header>
  );
}
