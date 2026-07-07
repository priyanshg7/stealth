import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Wheat } from 'lucide-react';

export default function DemoLoginPage() {
  const navigate = useNavigate();
  const { demoLogin, DEMO_PROFILES } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(false);

  const personas = [
    {
      key: 'rajesh',
      data: DEMO_PROFILES.rajesh,
      avatar: '👨‍🌾',
      color: 'bg-amber-50 border-amber-200',
      tagColor: 'bg-amber-100 text-amber-800',
      highlight: 'Maharashtra · Wheat & Sugarcane',
      farmCount: 2,
    },
    {
      key: 'priya',
      data: DEMO_PROFILES.priya,
      avatar: '👩‍🌾',
      color: 'bg-sky-50 border-sky-200',
      tagColor: 'bg-sky-100 text-sky-800',
      highlight: 'Punjab · Rice (Organic)',
      farmCount: 1,
    }
  ];

  const handleDemoLogin = async (personaKey) => {
    setLoading(true);
    setSelectedPersona(personaKey);

    // Small delay for smooth transition
    await new Promise(r => setTimeout(r, 600));

    const success = demoLogin(personaKey);
    if (success) {
      navigate('/app', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
      {/* Top bar */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg fill">eco</span>
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

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Demo badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide uppercase mb-5">
              <span className="material-symbols-outlined text-sm">science</span>
              Demo Environment
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-3">
              Experience KisanMitra
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Choose a demo farmer to instantly explore the full platform. No sign-up required.
              All data is simulated and won't affect any real accounts.
            </p>
          </div>

          {/* Persona cards */}
          <div className="space-y-4 mb-8">
            {personas.map((persona) => (
              <button
                key={persona.key}
                onClick={() => handleDemoLogin(persona.key)}
                disabled={loading}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all group
                  ${loading && selectedPersona === persona.key
                    ? 'border-primary bg-primary/5 scale-[0.98]'
                    : `${persona.color} hover:border-primary/40 hover:shadow-lg active:scale-[0.98]`
                  }
                  disabled:opacity-70
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant/40 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                    {loading && selectedPersona === persona.key ? (
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      persona.avatar
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-base font-bold text-on-surface">{persona.data.profile.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${persona.tagColor}`}>
                        Demo Profile
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">{persona.data.profile.email}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {persona.highlight}
                      </span>
                      <span className="flex items-center gap-1">
                        🌾 {persona.farmCount} {persona.farmCount === 1 ? 'Farm' : 'Farms'}
                      </span>
                      <span className="flex items-center gap-1">
                        📐 {persona.data.farms.reduce((sum, f) => sum + parseFloat(f.area || 0), 0)} Acres
                      </span>
                    </div>

                    {/* Farm names */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {persona.data.farms.map((farm, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-white/80 border border-outline-variant/40 px-2.5 py-1 rounded-lg font-medium text-on-surface-variant">
                          <span className="material-symbols-outlined text-xs text-primary fill">eco</span>
                          {farm.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Info notice */}
          <div className="bg-white rounded-xl border border-outline-variant/40 p-4 text-center">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">🔬 Demo Mode</span> — All farm data, weather information, market prices, and government schemes are simulated.
              Changes made in demo mode are temporary and will not persist after you exit.
            </p>
          </div>

          {/* Alternative links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-on-surface-variant">
              Have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
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
