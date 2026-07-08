import React, { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ur', name: 'اردو (Urdu)' }
];

export default function LanguageSwitcher({ className }) {
  const [currentLang, setCurrentLang] = useState('en');

  // Read current language from Google Translate cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match) {
      const parts = match[2].split('/');
      if (parts.length > 2) {
        setCurrentLang(parts[2]);
      }
    }
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('km_language', langCode);
    
    // Retry mechanism in case Google Translate hasn't finished loading yet
    let retries = 0;
    const attemptChange = () => {
      const googleSelect = document.querySelector('.goog-te-combo');
      if (googleSelect) {
        googleSelect.value = langCode;
        googleSelect.dispatchEvent(new Event('change'));
        // Dispatch a custom event so other components can react
        window.dispatchEvent(new CustomEvent('kmLanguageChange', { detail: langCode }));
      } else if (retries < 10) {
        retries++;
        setTimeout(attemptChange, 300);
      }
    };
    attemptChange();
  };

  return (
    <div className={`notranslate relative flex items-center justify-between text-sm font-bold text-on-surface cursor-pointer overflow-hidden group ${className || ''}`}>
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full h-full bg-transparent appearance-none outline-none cursor-pointer z-10 pl-3 pr-8 truncate font-bold text-on-surface"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-on-surface font-sans">
            {l.name}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined notranslate absolute right-2 pointer-events-none text-xs text-on-surface-variant z-0 group-hover:text-primary transition-colors">
        arrow_drop_down
      </span>
    </div>
  );
}
