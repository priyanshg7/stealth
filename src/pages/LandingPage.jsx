import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ArrowRight, Cpu, Shield, Globe, Mic, Sparkles, Zap, Sun, Droplet, Activity, CheckCircle2, Users, Layers, BarChart3, Calendar, Camera, BookOpen } from 'lucide-react';
import './LandingPage.css';

// Intersection Observer hook for scroll animations
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealDiv({ className = '', children, stagger = false, ...props }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`${stagger ? 'reveal-stagger' : 'reveal'} ${className}`} {...props}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// NAVBAR
// ────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoClick = () => {
    setMobileMenuOpen(false);
    demoLogin('rajesh');
    navigate('/app');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`landing-nav fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="material-symbols-outlined text-white text-lg fill">eco</span>
            </div>
            <span className="font-display font-bold text-xl text-on-surface">Kisan<span className="text-primary">Mitra</span></span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/app' : '/login')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary-container/20 transition-colors"
            >
              {isAuthenticated ? 'Open App' : 'Login'}
            </button>
            <button
              onClick={handleDemoClick}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-secondary transition-colors shadow-md hover:shadow-lg active:scale-[0.97]"
            >
              Try Demo
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-outline-variant/30 mt-1 pt-3 space-y-1 animate-fade-in-up">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isAuthenticated ? '/app' : '/login'); }}
                className="w-full px-5 py-3 rounded-xl text-sm font-bold text-primary border border-primary/30 hover:bg-primary-container/20"
              >
                {isAuthenticated ? 'Open App' : 'Login'}
              </button>
              <button
                onClick={handleDemoClick}
                className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-secondary shadow-md"
              >
                Try Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────
// HERO SECTION
// ────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  
  const handleDemoClick = () => {
    demoLogin('rajesh');
    navigate('/app');
  };

  const trustBadges = [
    { icon: <Cpu className="w-3.5 h-3.5" />, label: 'AI-Powered' },
    { icon: <Shield className="w-3.5 h-3.5" />, label: 'Govt Data' },
    { icon: <Globe className="w-3.5 h-3.5" />, label: 'Multilingual' },
    { icon: <Mic className="w-3.5 h-3.5" />, label: 'Voice Assist' },
    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Smart Planning' },
    { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Free to Use' },
  ];

  return (
    <section className="landing-hero-gradient pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-outline-variant/40 text-xs font-bold text-primary tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
              India's AI Farming Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-on-surface leading-[1.1] tracking-tight">
              Transform Every Field with{' '}
              <span className="gradient-text">Intelligent Farming</span>
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant max-w-xl mx-auto lg:mx-0 leading-relaxed">
              From sowing to selling — KisanMitra guides Indian farmers with AI crop recommendations, real-time weather intelligence, government scheme matching, and market insights. All in your local language.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-primary hover:bg-secondary transition-all shadow-lg hover:shadow-xl active:scale-[0.97] flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-primary bg-white border-2 border-primary/20 hover:border-primary/40 hover:bg-primary-container/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">play_circle</span>
                Explore Demo
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-4">
              {trustBadges.map((badge, i) => (
                <span key={i} className="trust-badge">
                  {badge.icon}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="flex-1 max-w-lg lg:max-w-xl w-full animate-float">
            <div className="dashboard-mockup">
              <div className="dashboard-mockup-header">
                <div className="mockup-dot" style={{ background: '#ff5f57' }}></div>
                <div className="mockup-dot" style={{ background: '#ffbd2e' }}></div>
                <div className="mockup-dot" style={{ background: '#28c840' }}></div>
                <span className="ml-3 text-white/80 text-xs font-medium">KisanMitra Dashboard</span>
              </div>
              <div className="p-4 space-y-3 bg-[#f4fcf0]">
                {/* Mock dashboard cards */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-xl p-3 border border-outline-variant/40">
                    <div className="text-[10px] font-medium text-on-surface-variant mb-1">Farm Health</div>
                    <div className="text-xl font-bold text-primary">92%</div>
                    <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-3 border border-outline-variant/40">
                    <div className="text-[10px] font-medium text-on-surface-variant mb-1">Today's Tasks</div>
                    <div className="text-xl font-bold text-on-surface">5 <span className="text-xs font-normal text-on-surface-variant">pending</span></div>
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-1.5 flex-1 rounded-full bg-primary/20"></div>)}
                    </div>
                  </div>
                  <div className="hidden sm:block flex-1 bg-white rounded-xl p-3 border border-outline-variant/40">
                    <div className="text-[10px] font-medium text-on-surface-variant mb-1">Weather</div>
                    <div className="text-xl font-bold text-on-surface">32°C</div>
                    <div className="text-[10px] text-on-surface-variant mt-1">☀️ Sunny, Low Rain</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-outline-variant/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-on-surface">AI Recommendation</span>
                    <span className="text-[9px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-bold">URGENT</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Apply Zinc Sulphate (25kg/acre) before irrigation. Soil test shows Zinc deficiency affecting wheat tillering.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-xl p-3 border border-outline-variant/40">
                    <div className="text-[10px] font-medium text-on-surface-variant mb-1">Wheat Price</div>
                    <div className="text-base font-bold text-on-surface">₹2,275/q</div>
                    <div className="text-[10px] text-primary font-semibold">↑ ₹50 MSP</div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-3 border border-outline-variant/40">
                    <div className="text-[10px] font-medium text-on-surface-variant mb-1">Crop Stage</div>
                    <div className="text-base font-bold text-on-surface">Tillering</div>
                    <div className="text-[10px] text-on-surface-variant">Day 48 of 135</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// FEATURES SECTION
// ────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Farm Setup & Planning',
      desc: 'Register multiple farms with detailed soil profiles, water sources, and GPS boundaries. Get a personalized seasonal crop plan.'
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI Crop Intelligence',
      desc: 'Daily AI recommendations for fertilizers, pest management, and irrigation schedules tailored to your exact conditions.'
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: 'Weather Intelligence',
      desc: 'Hyperlocal weather forecasts with crop-specific alerts. Know exactly when to irrigate, spray, or harvest.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Government Schemes',
      desc: 'Access 500+ central and state government schemes. AI-powered eligibility matching finds schemes you qualify for.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Market & Mandi Prices',
      desc: 'Live mandi prices, MSP comparisons, nearby market discovery, and optimal selling recommendations.'
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Disease Diagnosis',
      desc: 'Upload a photo of your crop and get instant AI-powered disease identification with treatment recommendations.'
    }
  ];

  return (
    <section id="features" className="landing-section bg-white">
      <div className="max-w-7xl mx-auto">
        <RevealDiv className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Core Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Everything a Farmer Needs, In One App
          </h2>
          <p className="text-on-surface-variant text-lg">
            KisanMitra covers the entire farming lifecycle — from planning your season to selling your harvest.
          </p>
        </RevealDiv>

        <RevealDiv stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card group">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/15 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-on-surface mb-2">{f.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </RevealDiv>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// HOW IT WORKS
// ────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Setup Your Farm', desc: 'Register your farm with GPS boundaries, soil type, water sources, and crop details.', icon: 'add_location_alt' },
    { num: '02', title: 'Get AI Plans', desc: 'Receive a personalized seasonal plan with optimized crop calendar, fertilizer schedule, and irrigation cycles.', icon: 'smart_toy' },
    { num: '03', title: 'Execute Daily', desc: 'Follow daily AI task recommendations. Mark tasks done, reschedule, or get alternative suggestions.', icon: 'task_alt' },
    { num: '04', title: 'Track & Grow', desc: 'Monitor farm journey, sell at best prices, access government schemes, and optimize continuously.', icon: 'trending_up' },
  ];

  return (
    <section id="how-it-works" className="landing-section bg-background">
      <div className="max-w-7xl mx-auto">
        <RevealDiv className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
            From Setup to Harvest in 4 Steps
          </h2>
          <p className="text-on-surface-variant text-lg">
            Getting started is simple. KisanMitra guides you every step of the way.
          </p>
        </RevealDiv>

        <RevealDiv stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, i) => (
            <div key={i} className={`landing-step-card ${i < steps.length - 1 ? 'step-connector' : ''}`}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl fill">{step.icon}</span>
              </div>
              <div className="text-xs font-bold text-primary/60 mb-2 tracking-widest">{step.num}</div>
              <h3 className="font-display text-base font-bold text-on-surface mb-2">{step.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </RevealDiv>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// AI DECISION SUPPORT
// ────────────────────────────────────────────────────────────
function AISection() {
  const capabilities = [
    { icon: 'psychology', title: 'Crop Stage Analysis', desc: 'Knows exactly what your crop needs at each growth stage.' },
    { icon: 'vaccines', title: 'Disease Risk Prediction', desc: 'Predicts disease risk based on weather, crop stage, and soil.' },
    { icon: 'water_drop', title: 'Smart Irrigation', desc: 'Schedules irrigation based on soil moisture and weather forecast.' },
    { icon: 'nutrition', title: 'Nutrient Management', desc: 'Recommends precise fertilizer doses based on soil health data.' },
    { icon: 'translate', title: 'Multilingual Support', desc: 'All recommendations available in Hindi, Marathi, Telugu, Punjabi & more.' },
    { icon: 'record_voice_over', title: 'Voice Assistant', desc: 'Ask questions in your language. Get spoken answers about your farm.' },
  ];

  return (
    <section className="landing-section bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          <RevealDiv className="flex-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
              <Cpu className="w-3.5 h-3.5" /> AI-Powered
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Your Personal Agronomist, Available 24/7
            </h2>
            <p className="text-on-surface-variant text-lg mb-8 max-w-lg">
              KisanMitra's AI engine processes your farm's unique data — soil, crop, weather, and market conditions — to deliver hyper-personalized recommendations every single day.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-lg fill">{cap.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{cap.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealDiv>

          <RevealDiv className="flex-1 max-w-md w-full">
            {/* AI conversation mockup */}
            <div className="bg-background rounded-2xl border border-outline-variant/50 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm fill">smart_toy</span>
                </div>
                <span className="text-sm font-bold text-on-surface">KisanMitra AI</span>
                <span className="text-[10px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-bold ml-auto">LIVE</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 border border-outline-variant/30 text-sm text-on-surface-variant">
                  <p className="font-medium text-on-surface mb-1">🌾 Wheat — Tillering Stage (Day 48)</p>
                  <p className="text-xs leading-relaxed">Your soil report shows Zinc deficiency at 0.42 ppm. Apply Zinc Sulphate Monohydrate at 25 kg/acre before next irrigation for optimal tillering.</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 text-sm">
                  <p className="font-medium text-primary mb-1">⚡ Action Required</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Western disturbance approaching. Irrigate tomorrow morning (6-8 AM) and postpone fertilizer application by 2 days.</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-outline-variant/30 text-sm">
                  <p className="font-medium text-on-surface mb-1">💰 Market Alert</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Wheat MSP ₹2,275/q. Nashik Mandi offering ₹2,340/q — ₹65 above MSP. Consider selling within 3 days.</p>
                </div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// GOVERNMENT SCHEMES SECTION
// ────────────────────────────────────────────────────────────
function GovtSection() {
  return (
    <section className="landing-section bg-background">
      <div className="max-w-7xl mx-auto">
        <RevealDiv className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left visual */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white rounded-2xl border border-outline-variant/50 p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Eligible Government Schemes
              </h3>
              {[
                { name: 'PM-KISAN', match: '95%', benefit: '₹6,000/year', tag: 'Central' },
                { name: 'PMFBY', match: '88%', benefit: 'Crop Insurance', tag: 'Central' },
                { name: 'PM Kusum', match: '92%', benefit: 'Solar Pump Subsidy', tag: 'Central' },
              ].map((scheme, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">{scheme.name}</span>
                      <span className="text-[9px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-bold">{scheme.tag}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{scheme.benefit}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-primary">{scheme.match}</div>
                    <div className="text-[10px] text-on-surface-variant">match</div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-on-surface-variant pt-2">+ 47 more schemes matching your profile</p>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
              <Shield className="w-3.5 h-3.5" /> Government Integration
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Never Miss a Scheme You Deserve
            </h2>
            <p className="text-on-surface-variant text-lg mb-6">
              KisanMitra connects to official government databases to match farmers with eligible schemes, subsidies, and benefits automatically.
            </p>
            <ul className="space-y-3">
              {[
                '500+ Central & State schemes indexed',
                'AI eligibility scoring based on your profile',
                'Application guidance with required documents',
                'Real-time updates on new scheme announcements',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealDiv>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// BENEFITS SECTION
// ────────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    { icon: <Zap className="w-5 h-5" />, title: 'Save Time', desc: 'No more guesswork. Get precise daily task lists and recommendations.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Increase Yield', desc: 'Data-driven decisions lead to 15-30% higher crop yields on average.' },
    { icon: <Shield className="w-5 h-5" />, title: 'Reduce Risk', desc: 'Weather alerts, disease prediction, and crop insurance matching.' },
    { icon: <Globe className="w-5 h-5" />, title: 'Your Language', desc: 'Available in Hindi, Marathi, Telugu, Punjabi, Kannada, and English.' },
    { icon: <Activity className="w-5 h-5" />, title: 'Better Prices', desc: 'Sell at the right time, at the right mandi, at the best price.' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Learn & Grow', desc: 'Community discussions, expert advice, and farming best practices.' },
  ];

  return (
    <section id="benefits" className="landing-section bg-white">
      <div className="max-w-7xl mx-auto">
        <RevealDiv className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
            Why KisanMitra
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Built for the Indian Farmer
          </h2>
          <p className="text-on-surface-variant text-lg">
            Real impact for real farmers. Every feature is designed around the needs of Indian agriculture.
          </p>
        </RevealDiv>

        <RevealDiv stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <div key={i} className="benefit-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {b.icon}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-on-surface mb-1">{b.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </RevealDiv>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// FAQ SECTION
// ────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'Is KisanMitra free to use?', a: 'Yes! KisanMitra is completely free for all Indian farmers. We believe every farmer deserves access to AI-powered farming intelligence regardless of farm size or budget.' },
    { q: 'Which languages are supported?', a: 'KisanMitra supports Hindi, English, Marathi, Punjabi, Telugu, and Kannada. Both text and voice interactions are available in all supported languages.' },
    { q: 'How does the AI recommendation work?', a: 'Our AI engine analyzes your farm\'s specific conditions — soil type, crop stage, local weather, water availability — and generates personalized daily recommendations for fertilizer, irrigation, pest management, and more.' },
    { q: 'Do I need internet to use KisanMitra?', a: 'An internet connection is required for real-time features like weather updates and market prices. However, your farm data and crop plans are cached locally so you can view them offline.' },
    { q: 'How are government schemes matched?', a: 'KisanMitra indexes 500+ central and state government agricultural schemes. Our AI compares your profile (location, crops, land size, gender, irrigation type) against each scheme\'s eligibility criteria to calculate a match score.' },
    { q: 'Is my farm data secure?', a: 'Absolutely. Your data is encrypted and stored securely. We never share individual farm data with third parties. KisanMitra uses Google Firebase for authentication and data storage with enterprise-grade security.' },
    { q: 'Can I manage multiple farms?', a: 'Yes! KisanMitra supports multi-farm management. Register as many farms as you own, each with different crops, soil types, and water sources. Switch between farms instantly from the dashboard.' },
  ];

  return (
    <section id="faq" className="landing-section bg-background">
      <div className="max-w-3xl mx-auto">
        <RevealDiv className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Frequently Asked Questions
          </h2>
        </RevealDiv>

        <RevealDiv className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-display text-sm font-bold text-on-surface pr-4">{faq.q}</span>
                <ChevronDown className="w-4.5 h-4.5 text-on-surface-variant flex-shrink-0 faq-chevron" />
              </button>
              <div className="faq-answer">
                <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </RevealDiv>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// CTA SECTION
// ────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  
  const handleDemoClick = () => {
    demoLogin('rajesh');
    navigate('/app');
  };

  return (
    <section className="landing-cta-gradient py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <RevealDiv className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
          Start Your Smart Farming Journey Today
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
          Join thousands of Indian farmers using AI to grow better, save time, and earn more. It's free, it's simple, and it's built for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-bold text-primary bg-white hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl active:scale-[0.97] flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-bold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_circle</span>
            Try Demo First
          </button>
        </div>
      </RevealDiv>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// FOOTER
// ────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-outline-variant/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm fill">eco</span>
            </div>
            <span className="font-display font-bold text-lg text-on-surface">Kisan<span className="text-primary">Mitra</span></span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-primary transition-colors">Benefits</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <p className="text-xs text-on-surface-variant">© 2026 KisanMitra. Designed for Indian Farmers.</p>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
// STATS SECTION
// ────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: '500+', label: 'Govt Schemes Indexed' },
    { value: '8', label: 'Major Crops Supported' },
    { value: '6', label: 'Indian Languages' },
    { value: '24/7', label: 'AI Assistance' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-y border-outline-variant/30">
      <RevealDiv stagger className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
            <div className="text-sm text-on-surface-variant font-medium">{stat.label}</div>
          </div>
        ))}
      </RevealDiv>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-background text-on-surface font-sans">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AISection />
      <GovtSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
