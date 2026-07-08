import { t } from '../utils/translations';
import React, { useEffect } from 'react';

export default function Header({
  activeDashboardTab,
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
  useEffect(() => {
    const initTranslate = () => {
      if (document.querySelector('#google_translate_element_header .goog-te-combo')) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,pa,gu,ta,te,bn,kn,ml,or,as,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element_header'
      );
    };

    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      initTranslate();
    } else {
      window.googleTranslateElementInit = initTranslate;
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-container-high px-4 py-3 flex items-center justify-between gap-4 shadow-sm">
      
      {/* Left Side: Sidebar Toggle + Dynamic Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger or back button */}
        {activeDashboardTab !== 'dashboard' ? (
          <button 
            onClick={() => setActiveDashboardTab('dashboard')}
            className="p-3 rounded-xl border border-outline-variant hover:bg-surface-container lg:hidden text-on-surface-variant flex items-center justify-center min-h-[48px] min-w-[48px]"
            title="Go Back"
          >
            <span className="material-symbols-outlined notranslate text-xl">arrow_back</span>
          </button>
        ) : (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-3 rounded-xl border border-outline-variant hover:bg-surface-container lg:hidden text-on-surface-variant flex items-center justify-center min-h-[48px] min-w-[48px]"
            title="Open navigation"
          >
            <span className="material-symbols-outlined notranslate text-xl">menu</span>
          </button>
        )}

        {/* Desktop collapse/expand toggle */}
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="hidden lg:flex p-3 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors min-h-[48px] min-w-[48px] items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined notranslate text-xl">
            {sidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-sm md:text-lg text-on-surface flex items-center gap-1 md:gap-1.5 truncate">
            <span className="truncate">
              {(() => {
                const hr = new Date().getHours();
                if (hr < 12) return t('Good Morning', language);
                if (hr < 17) return t('Good Afternoon', language);
                return t('Good Evening', language);
              })()}
              <span className="text-primary font-extrabold ml-1">
                {profile.name ? `${profile.name.split(' ')[0]} Ji` : 'Ramesh Ji'}
              </span>
            </span>
            <span className="hidden sm:inline">🌾</span>
          </h2>
          <p className="text-xs text-on-surface-variant font-medium hidden sm:block truncate">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right Side: Lang Switcher, Voice Helper, Notifications */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Language Dropdown Selector via Google Translate */}
        <div className="relative group min-w-[100px] h-[48px] bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl px-2 flex items-center justify-between text-[13px] md:text-sm font-bold text-on-surface cursor-pointer overflow-hidden">
          <div id="google_translate_element_header" className="notranslate w-full flex items-center z-10 relative"></div>
          <span className="material-symbols-outlined notranslate absolute right-2 pointer-events-none text-xs text-on-surface-variant z-0">arrow_drop_down</span>
        </div>

        {/* Notification Button */}
        <button 
          onClick={() => setActiveDashboardTab('notifications')}
          className="p-3 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant relative min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <span className="material-symbols-outlined notranslate text-lg">notifications</span>
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
          <span className="material-symbols-outlined notranslate text-lg font-bold">{isListening ? 'settings_voice' : 'mic'}</span>
        </button>

      </div>
    </header>
  );
}
