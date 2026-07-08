import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';

const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return null;
  let code = '';
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    code = error.code || '';
    message = error.message || '';
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return { title: "Domain Not Authorized", instructions: "This domain is not authorized for Firebase Authentication. Go to Firebase Console > Authentication > Settings > Authorized domains and add your domain.", showFallback: true };
  }
  if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
    return { title: "Google Auth Not Enabled", instructions: "Google Sign-In is not enabled for this project in Firebase Console.", showFallback: true };
  }
  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return { title: "Google Provider Disabled", instructions: "Enable Google Sign-In in your Firebase Console.", showFallback: true };
  }
  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return { title: "Popup Blocked", instructions: "Please allow popups for this site or use Demo Mode.", showFallback: true };
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return { title: "Popup Closed", instructions: "The login popup was closed before completing. Please try again.", showFallback: true };
  }
  return { title: "Authentication Error", instructions: message || "An unknown error occurred during sign-in.", showFallback: true };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, authError, setAuthError } = useAuth();
  const [loading, setLoading] = useState(false);
  const redirect = searchParams.get('redirect') || '/app';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    const success = await login();
    setLoading(false);
    if (success) {
      navigate(redirect, { replace: true });
    }
  };

  useEffect(() => {
    const initTranslate = () => {
      if (document.querySelector('#google_translate_element_login .goog-te-combo')) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,pa,gu,ta,te,bn,kn,ml,or,as,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element_login'
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
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
      {/* Top bar */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined notranslate text-white text-lg fill">eco</span>
            </div>
            <span className="font-display font-bold text-xl text-on-surface">Kisan<span className="text-primary">Mitra</span></span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-on-surface-variant hover:text-primary flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Login card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-[20px] p-8 md:p-10 border border-outline-variant/60 shadow-2xl relative overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined notranslate text-3xl fill">lock_open</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Welcome to KisanMitra</h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sign in with your Google account to access your personalized farming dashboard.
              </p>
            </div>

            {/* Auth error */}
            {authError && (() => {
              const errorDetails = getFriendlyAuthErrorMessage(authError);
              return (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900">{errorDetails.title}</p>
                    <p className="text-[11px] text-red-800 font-normal mt-0.5 leading-relaxed">{errorDetails.instructions}</p>
                  </div>
                </div>
              );
            })()}

            {/* Language Preference */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider text-center">
                Select Your Language / अपनी भाषा चुनें
              </label>
              <div className="relative group w-full h-[54px] bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl px-4 flex items-center justify-between text-sm font-bold text-on-surface cursor-pointer overflow-hidden transition-colors">
                <div id="google_translate_element_login" className="notranslate w-full h-full flex items-center z-10 relative"></div>
                <span className="material-symbols-outlined notranslate absolute right-4 pointer-events-none text-xl text-primary z-0 opacity-50 group-hover:opacity-100 transition-opacity">translate</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border border-outline-variant bg-white hover:bg-surface-container text-on-surface font-bold h-14 rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-5 text-xs text-on-surface-variant font-medium">
              <div className="flex-1 h-px bg-outline-variant/30"></div>
              <span className="px-4">OR</span>
              <div className="flex-1 h-px bg-outline-variant/30"></div>
            </div>

            {/* Demo mode link */}
            <button
              onClick={() => navigate('/demo')}
              className="w-full border-2 border-dashed border-outline-variant bg-[#fdfdfd] hover:bg-[#f4fcf0] hover:border-primary text-on-surface-variant hover:text-primary font-bold h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined notranslate text-lg">science</span>
              <span>Explore Demo Mode</span>
            </button>

            {/* Info */}
            <p className="text-[11px] text-on-surface-variant text-center mt-6 leading-relaxed">
              By signing in, you agree to KisanMitra's Terms of Service and Privacy Policy.
              Your data is encrypted and never shared with third parties.
            </p>
          </div>

          {/* Below card trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Free Forever</span>
            <span className="flex items-center gap-1.5">🔒 Secure Auth</span>
            <span className="flex items-center gap-1.5">🇮🇳 Made for India</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/30">
        © 2026 KisanMitra. Designed for Indian Farmers.
      </footer>
    </div>
  );
}
