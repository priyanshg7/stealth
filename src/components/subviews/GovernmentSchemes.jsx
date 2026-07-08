import React, { useState, useEffect } from 'react';
import { 
  Check, Volume2, Mic, MapPin, Plus, Trash2, Edit3, ArrowLeft, ArrowRight,
  Info, Cpu, Shield, Sparkles, PlusCircle, HelpCircle, Layers, Droplet,
  Smartphone, Wifi, Users, Truck, Compass, Sun, Wind, CloudRain, Calendar,
  Activity, CheckCircle2, ChevronRight, RefreshCw, Upload, AlertCircle,
  Search, Bookmark, Heart, EyeOff, Share2, Send, CheckSquare, Square,
  Building2, Phone, Mail, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';


// Custom evaluation matching engine imported locally for double insurance
const localEvaluateScheme = (scheme, profile, farm) => {
  const statesOfIndia = [
    { name: 'Maharashtra', keywords: ['maharashtra', 'm.h.', 'mh '] },
    { name: 'Rajasthan', keywords: ['rajasthan', 'raj.'] },
    { name: 'Madhya Pradesh', keywords: ['madhya pradesh', 'm.p.', 'mp '] },
    { name: 'Chhattisgarh', keywords: ['chhattisgarh', 'c.g.'] },
    { name: 'Andhra Pradesh', keywords: ['andhra pradesh', 'a.p.', 'ap '] },
    { name: 'Karnataka', keywords: ['karnataka', 'kar.'] },
    { name: 'West Bengal', keywords: ['west bengal', 'w.b.', 'wb '] },
    { name: 'Puducherry', keywords: ['puducherry', 'pondicherry'] },
    { name: 'Gujarat', keywords: ['gujarat', 'guj.'] },
    { name: 'Tamil Nadu', keywords: ['tamil nadu', 't.n.', 'tn '] },
    { name: 'Uttar Pradesh', keywords: ['uttar pradesh', 'u.p.', 'up '] },
    { name: 'Punjab', keywords: ['punjab', 'pb '] },
    { name: 'Haryana', keywords: ['haryana', 'hr '] },
    { name: 'Bihar', keywords: ['bihar'] }
  ];
  
  let schemeState = null;
  if (scheme.level === 'State') {
    const textToSearch = (scheme.name + ' ' + scheme.details + ' ' + scheme.eligibility + ' ' + scheme.slug).toLowerCase();
    for (const stateObj of statesOfIndia) {
      if (stateObj.keywords.some(kw => textToSearch.includes(kw))) {
        schemeState = stateObj.name;
        break;
      }
    }
  }

  const farmerState = farm?.state || profile?.state || '';
  const farmerCrop = farm?.crop?.name || '';
  const farmerArea = parseFloat(farm?.area) || 0;
  const farmerGender = profile?.gender || '';
  const irrigationMethods = farm?.water?.irrigationMethods || [];
  const pumpType = farm?.water?.pumpType || '';
  const farmingMethods = profile?.farmingMethod || farm?.crop?.farmingType || [];
  const machinery = farm?.machinery || [];

  let status = 'Likely Eligible';
  let score = 40;
  const reasons = [];
  const missingInfo = [];

  // 1. Location Check
  if (scheme.level === 'State' && schemeState) {
    if (farmerState && schemeState.toLowerCase() !== farmerState.toLowerCase()) {
      return {
        status: 'Not Eligible',
        score: 0,
        explanation: `Only for residents of ${schemeState}. Your active farm is in ${farmerState}.`,
        missingInfo: [],
        schemeState
      };
    } else {
      score += 20;
      reasons.push(`It is a State scheme of ${schemeState}, matching your location.`);
    }
  } else {
    reasons.push("It is a Central scheme open to all states.");
  }

  // 2. Crop matching
  const textToMatch = (scheme.name + ' ' + scheme.details + ' ' + scheme.eligibility + ' ' + scheme.tags + ' ' + scheme.category).toLowerCase();
  
  if (farmerCrop) {
    const cropKeywords = {
      wheat: ['wheat', 'gehun', 'rabi'],
      rice: ['rice', 'paddy', 'dhan', 'kharif'],
      sugarcane: ['sugarcane', 'cane', 'ganna'],
      cotton: ['cotton', 'kapas'],
      soybean: ['soybean', 'soya'],
      maize: ['maize', 'makka'],
      tomato: ['tomato', 'tamatar', 'vegetable', 'horticulture'],
      chilli: ['chilli', 'mirch', 'spice', 'horticulture']
    };
    const keywords = cropKeywords[farmerCrop.toLowerCase()] || [farmerCrop.toLowerCase()];
    const matchesCrop = keywords.some(kw => textToMatch.includes(kw));
    if (matchesCrop) {
      score += 30;
      reasons.push(`Tailored for your crop: ${farmerCrop}.`);
    }
  }

  // 3. Landholding Matching
  const smallFarmerKeywords = ['small farmer', 'marginal', 'small and marginal', '2 hectare', '5 acre', 'landless', 'unregistered laborer'];
  const isSmallFarmerScheme = smallFarmerKeywords.some(kw => textToMatch.includes(kw));
  
  if (isSmallFarmerScheme) {
    if (farmerArea > 0) {
      if (farmerArea <= 5) {
        score += 25;
        reasons.push("Matches small/marginal landholding (under 5 acres).");
        status = 'Eligible';
      } else {
        return {
          status: 'Not Eligible',
          score: 10,
          explanation: `This scheme is targeted at small/marginal farmers. Your farm size is ${farmerArea} acres.`,
          missingInfo: [],
          schemeState
        };
      }
    } else {
      missingInfo.push("Land Ownership records");
      status = 'Need More Information';
    }
  }

  // 4. Irrigation/Water matching
  const dripKeywords = ['drip', 'micro-irrigation', 'sprinkler', 'micro irrigation', 'water saving'];
  const matchesDrip = dripKeywords.some(kw => textToMatch.includes(kw));
  if (matchesDrip) {
    if (irrigationMethods.includes('drip') || irrigationMethods.includes('sprinkler')) {
      score += 25;
      reasons.push("Matches your drip/sprinkler irrigation system.");
      status = 'Eligible';
    } else {
      score += 5;
    }
  }

  const solarKeywords = ['solar pump', 'kusum', 'solar water pump', 'solar power', 'renewable pump'];
  const matchesSolar = solarKeywords.some(kw => textToMatch.includes(kw));
  if (matchesSolar) {
    if (pumpType.toLowerCase().includes('solar')) {
      score += 30;
      reasons.push("Matches your Solar Pump.");
      status = 'Eligible';
    } else {
      score += 10;
    }
  }

  // 5. Farming method (Organic)
  const organicKeywords = ['organic', 'compost', 'jaivik', 'natural farming', 'chemical free'];
  const matchesOrganic = organicKeywords.some(kw => textToMatch.includes(kw));
  if (matchesOrganic) {
    const isOrganic = farmingMethods.includes('Organic') || farmingMethods.includes('organic') || farm?.crop?.farmingType?.toLowerCase() === 'organic';
    if (isOrganic) {
      score += 30;
      reasons.push("Matches your Organic Farming profile.");
      status = 'Eligible';
    } else {
      score += 5;
    }
  }

  // 6. Gender matching
  const womenKeywords = ['women', 'female', 'mahila', 'girl', 'widow', 'daughter'];
  const isWomenScheme = womenKeywords.some(kw => textToMatch.includes(kw));
  if (isWomenScheme) {
    if (farmerGender) {
      if (farmerGender.toLowerCase() === 'female') {
        score += 35;
        reasons.push("Special priority for Women Farmers.");
        status = 'Eligible';
      } else {
        return {
          status: 'Not Eligible',
          score: 5,
          explanation: "This scheme is exclusively or primarily for women farmers.",
          missingInfo: [],
          schemeState
        };
      }
    } else {
      missingInfo.push("Gender Details");
      status = 'Need More Information';
    }
  }

  // Missing documents verification
  const requiredDocsText = (scheme.documents || '').toLowerCase();
  if (requiredDocsText.includes('aadhaar')) {
    if (!profile.governmentId || !profile.governmentId.toUpperCase().includes('AADHAAR')) {
      missingInfo.push('Aadhaar Card');
    }
  }
  if (requiredDocsText.includes('soil')) {
    if (!farm?.soil?.source || farm.soil.source !== 'card') {
      missingInfo.push('Soil Health Card');
    }
  }
  if (requiredDocsText.includes('bank')) {
    if (!profile.governmentId) {
      missingInfo.push('Bank Account Verification');
    }
  }
  if (requiredDocsText.includes('caste') || requiredDocsText.includes('sc/st')) {
    missingInfo.push('Caste Certificate');
  }
  if (requiredDocsText.includes('income')) {
    missingInfo.push('Income Certificate');
  }

  if (missingInfo.length > 0 && status !== 'Not Eligible') {
    status = 'Need More Information';
  }

  score = Math.max(15, Math.min(98, score));

  // Generate explanation
  let explanation = '';
  if (reasons.length > 0) {
    const cropText = farmerCrop ? `cultivate ${farmerCrop} in ${farmerState || 'India'}` : `farm in ${farmerState || 'India'}`;
    const sizeText = farmerArea ? `own ${farmerArea} acres` : '';
    explanation = `Recommended because you ${cropText}`;
    if (sizeText) explanation += `, ${sizeText}`;
    explanation += `. It matches your profile details.`;
  } else {
    explanation = "Recommended based on general Central and State farming benefit programs.";
  }

  return {
    status,
    score,
    explanation,
    missingInfo,
    schemeState
  };
};

const parseSchemeDocs = (scheme) => {
  const rawDocs = scheme.documents || '';
  if (!rawDocs) return [];
  
  // Split by common delimiters (dots, commas, or newlines)
  return rawDocs
    .split(/[.\n•]/)
    .map(d => d.trim())
    .filter(d => d.length > 4 && !d.toLowerCase().includes('feedback form') && !d.toLowerCase().includes('proceedings'));
};

const calculateDocProgress = (scheme, docChecklist) => {
  const docs = parseSchemeDocs(scheme);
  if (docs.length === 0) return { total: 0, checked: 0, percent: 100 };
  
  const slug = scheme.slug || scheme.name;
  const checkedList = docChecklist[slug] || {};
  let checkedCount = 0;
  
  docs.forEach(doc => {
    if (checkedList[doc]) checkedCount++;
  });
  
  return {
    total: docs.length,
    checked: checkedCount,
    percent: Math.round((checkedCount / docs.length) * 100)
  };
};

const SchemeCard = ({
  sch,
  profile,
  activeFarm,
  savedSchemes,
  setSavedSchemes,
  favSchemes,
  setFavSchemes,
  hiddenSchemes,
  setHiddenSchemes,
  appliedSchemes,
  setAppliedSchemes,
  docChecklist,
  toggleDocCheckbox,
  getStatusBadge,
  startAIChat,
  shareOnWhatsApp,
  setActiveDashboardTab,
  setSelectedSchemeForDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusBadge = getStatusBadge(sch.status);
  const docsList = parseSchemeDocs(sch);
  const progress = calculateDocProgress(sch, docChecklist);
  
  // Extract contact info or fallback
  const contactInfo = {
    dept: sch.level === 'Central' ? 'Ministry of Agriculture and Farmers Welfare' : `State Department of Agriculture, ${activeFarm?.state || profile?.state || 'Govt'}`,
    phone: '1800-180-1551 (Kisan Call Center)',
    email: 'support.myscheme@gov.in'
  };

  const isSaved = savedSchemes.includes(sch.slug || sch.name);
  const isFav = favSchemes.includes(sch.slug || sch.name);
  const isApplied = appliedSchemes.includes(sch.slug || sch.name);

  return (
    <div className={`bg-white border rounded-card shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between self-start ${
      isExpanded ? 'ring-2 ring-primary/20 border-primary' : 'border-outline-variant/60'
    }`}>
      {/* 1. Header block in solid green/blue color depending on level */}
      <div className={`${
        sch.level === 'Central' ? 'bg-[#1e8e3e]' : 'bg-[#0b57d0]'
      } text-white p-5 space-y-2 relative`}>
        <div className="flex justify-between items-center text-[10px] font-bold text-white/90">
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            🏛️ {sch.level} Scheme
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>2026-12-15</span>
          </span>
        </div>
        
        <h3 className="font-display font-extrabold text-sm sm:text-base leading-tight hover:underline cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {sch.name}
        </h3>
        
        <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed">
          {sch.details.split(/[.\n]/)[0]}.
        </p>
      </div>

      {/* 2. Quick Match Status bar */}
      <div className="px-4 py-3 bg-surface-container-low/60 border-b border-surface-container flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border flex items-center gap-1 bg-white border-outline-variant">
            <span className={`w-1.5 h-1.5 rounded-full ${
              sch.status === 'Eligible' ? 'bg-green-600' :
              sch.status === 'Likely Eligible' ? 'bg-yellow-500' :
              sch.status === 'Need More Information' ? 'bg-blue-500' : 'bg-red-500'
            }`} />
            {statusBadge.label}
          </span>
          
          {sch.score && (
            <span className="text-[9px] font-bold bg-[#fdf2f8] text-[#be185d] border border-[#fbcfe8] px-2 py-0.5 rounded-full">
              ⚡ {sch.score}% Match
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary font-bold text-[11px] flex items-center gap-0.5 hover:underline"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. Expanded Inner detailed cards */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-background/25 border-b border-surface-container">
          
          {/* AI Match Explanation */}
          {sch.explanation && sch.status !== 'Not Eligible' && (
            <div className="bg-[#f0fdf4] border border-primary/20 p-3 rounded-xl text-[11px] text-on-surface flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                <strong className="text-primary font-bold">KisanMitra Insight:</strong> {sch.explanation}
              </div>
            </div>
          )}

          {/* Missing info checklist */}
          {sch.status === 'Need More Information' && sch.missingInfo && sch.missingInfo.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Verify eligibility: Config required</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sch.missingInfo.map((info, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDashboardTab('settings')}
                    className="bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Set {info}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Block (Green Left Border) */}
          <div className="border-l-4 border-l-green-600 bg-green-50/50 p-3.5 rounded-r-xl space-y-1">
            <h4 className="font-bold text-xs text-green-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined notranslate text-green-700 text-sm font-bold">payments</span>
              Benefits
            </h4>
            <p className="text-[11px] text-green-950 leading-relaxed font-semibold">
              {sch.benefits}
            </p>
          </div>

          {/* Eligibility Block (Blue Left Border) */}
          <div className="border-l-4 border-l-blue-600 bg-blue-50/50 p-3.5 rounded-r-xl space-y-1">
            <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined notranslate text-blue-700 text-sm font-bold">fact_check</span>
              Eligibility
            </h4>
            <p className="text-[11px] text-blue-950 leading-relaxed font-semibold">
              {sch.eligibility}
            </p>
          </div>

          {/* How To Apply Block (Purple Left Border) */}
          {sch.application && (
            <div className="border-l-4 border-l-purple-600 bg-purple-50/50 p-3.5 rounded-r-xl space-y-1">
              <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined notranslate text-purple-700 text-sm font-bold">route</span>
                How To Apply
              </h4>
              <p className="text-[11px] text-purple-950 leading-relaxed font-semibold">
                {sch.application.split('.')[0]}.
              </p>
            </div>
          )}

          {/* Required Documents Block (Orange Left Border & Pills) */}
          {docsList.length > 0 && (
            <div className="border-l-4 border-l-amber-600 bg-amber-50/50 p-3.5 rounded-r-xl space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined notranslate text-amber-700 text-sm font-bold">assignment</span>
                  Required Documents
                </h4>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {progress.percent}% Ready
                </span>
              </div>
              
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress.percent}%` }} />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {docsList.map(doc => {
                  const isChecked = !!(docChecklist[sch.slug || sch.name] || {})[doc];
                  return (
                    <button
                      key={doc}
                      onClick={() => toggleDocCheckbox(sch.slug || sch.name, doc)}
                      className={`flex items-center gap-1 border px-2.5 py-1 rounded-full text-[9px] font-bold shadow-2xs transition-all ${
                        isChecked 
                          ? 'bg-[#1e8e3e] text-white border-[#1e8e3e]' 
                          : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{doc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Block (Slate Left Border) */}
          <div className="border-l-4 border-l-slate-400 bg-slate-50/50 p-3.5 rounded-r-xl space-y-2">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined notranslate text-slate-600 text-sm font-bold">contacts</span>
              Contact Info
            </h4>
            <div className="text-[10px] text-slate-800 space-y-1 font-semibold leading-relaxed">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{contactInfo.dept}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. Footer Actions block */}
      <div className="p-4 bg-white flex items-center justify-between gap-2 border-t border-surface-container-high/40">
        <div className="flex gap-2">
          <a
            href={`https://myscheme.gov.in/schemes/${sch.slug || 'search'}`}
            target="_blank"
            rel="noreferrer"
            className="bg-[#1e8e3e] hover:bg-[#156f2f] text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 transition-all shadow-2xs"
          >
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          
          <button
            onClick={() => startAIChat(sch)}
            className="bg-white hover:bg-surface-container text-on-surface border border-outline-variant font-extrabold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined notranslate text-sm font-bold text-on-surface-variant">chat</span>
            <span>Ask AI Agent</span>
          </button>
        </div>

        {/* Small icon actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const slug = sch.slug || sch.name;
              if (savedSchemes.includes(slug)) {
                setSavedSchemes(prev => prev.filter(s => s !== slug));
              } else {
                setSavedSchemes(prev => [...prev, slug]);
              }
            }}
            className={`p-1.5 rounded-lg hover:bg-surface-container transition-all ${
              isSaved ? 'text-primary' : 'text-on-surface-variant'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </button>

          <button
            onClick={() => {
              const slug = sch.slug || sch.name;
              if (favSchemes.includes(slug)) {
                setFavSchemes(prev => prev.filter(s => s !== slug));
              } else {
                setFavSchemes(prev => [...prev, slug]);
              }
            }}
            className={`p-1.5 rounded-lg hover:bg-surface-container transition-all ${
              isFav ? 'text-red-600' : 'text-on-surface-variant'
            }`}
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
          </button>

          <button
            onClick={() => shareOnWhatsApp(sch)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-green-700 transition-all"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              const slug = sch.slug || sch.name;
              if (appliedSchemes.includes(slug)) {
                setAppliedSchemes(prev => prev.filter(s => s !== slug));
              } else {
                setAppliedSchemes(prev => [...prev, slug]);
              }
            }}
            className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
              isApplied
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Mark as Applied"
          >
            {isApplied ? 'Applied' : 'Apply?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GovernmentSchemes({
  profile,
  setProfile,
  language,
  farms,
  selectedFarmIndex,
  setSelectedFarmIndex,
  setActiveDashboardTab,
  allSchemes
}) {
  const activeFarm = farms[selectedFarmIndex];

  // Component States
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Saved/Fav/Applied states stored in local storage
  const [savedSchemes, setSavedSchemes] = useState(() => JSON.parse(localStorage.getItem('km_saved_schemes') || '[]'));
  const [favSchemes, setFavSchemes] = useState(() => JSON.parse(localStorage.getItem('km_fav_schemes') || '[]'));
  const [hiddenSchemes, setHiddenSchemes] = useState(() => JSON.parse(localStorage.getItem('km_hidden_schemes') || '[]'));
  const [appliedSchemes, setAppliedSchemes] = useState(() => JSON.parse(localStorage.getItem('km_applied_schemes') || '[]'));
  const [docChecklist, setDocChecklist] = useState(() => JSON.parse(localStorage.getItem('km_doc_checklist') || '{}'));

  // Detail View State
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState('overview');

  // AI Chat Assistant State
  const [selectedSchemeForChat, setSelectedSchemeForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Accordion list for detail view
  const sections = [
    { id: 'overview', title: 'Scheme Overview', icon: 'info' },
    { id: 'benefits', title: 'Benefits & Financials', icon: 'payments' },
    { id: 'eligibility', title: 'Eligibility Criteria', icon: 'fact_check' },
    { id: 'documents', title: 'Required Documents & Checklist', icon: 'assignment' },
    { id: 'application', title: 'Step-by-step Application Process', icon: 'route' },
    { id: 'notes', title: 'Important Notes & Tips', icon: 'tips_and_updates' }
  ];

  // Filters State
  const [filters, setFilters] = useState({
    level: 'All',
    category: 'All',
    crop: 'All',
    state: activeFarm?.state || 'All',
    district: activeFarm?.district || 'All',
    status: 'All',
    showSaved: false,
    showApplied: false
  });

  // Sync state modifications to local storage
  useEffect(() => {
    localStorage.setItem('km_saved_schemes', JSON.stringify(savedSchemes));
  }, [savedSchemes]);

  useEffect(() => {
    localStorage.setItem('km_fav_schemes', JSON.stringify(favSchemes));
  }, [favSchemes]);

  useEffect(() => {
    localStorage.setItem('km_hidden_schemes', JSON.stringify(hiddenSchemes));
  }, [hiddenSchemes]);

  useEffect(() => {
    localStorage.setItem('km_applied_schemes', JSON.stringify(appliedSchemes));
  }, [appliedSchemes]);

  useEffect(() => {
    localStorage.setItem('km_doc_checklist', JSON.stringify(docChecklist));
  }, [docChecklist]);

  // Load and score schemes on mount/profile switch
  useEffect(() => {
    if (allSchemes && allSchemes.length > 0) {
      // Evaluate and score every scheme
      const scored = allSchemes.map(sch => {
        const match = localEvaluateScheme(sch, profile, activeFarm);
        return {
          ...sch,
          status: match.status,
          score: match.score,
          explanation: match.explanation,
          missingInfo: match.missingInfo,
          schemeState: match.schemeState
        };
      });
      setSchemes(scored);
      setLoading(false);
    } else {
      // Fetch schemes data if not already provided
      fetch('/schemes_data.json')
        .then(res => res.json())
        .then(data => {
          const scored = data.map(sch => {
            const match = localEvaluateScheme(sch, profile, activeFarm);
            return {
              ...sch,
              status: match.status,
              score: match.score,
              explanation: match.explanation,
              missingInfo: match.missingInfo,
              schemeState: match.schemeState
            };
          });
          setSchemes(scored);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading schemes:", err);
          setLoading(false);
        });
    }
  }, [allSchemes, profile, activeFarm]);

  // Intent parsing mapping
  const extractSearchFilters = (query) => {
    const q = query.toLowerCase();
    const extracted = { keywords: [] };
    
    if (q.includes('wheat') || q.includes('gehun') || q.includes('gehu')) {
      extracted.crop = 'Wheat';
      extracted.category = 'Agriculture';
    }
    if (q.includes('rice') || q.includes('paddy') || q.includes('dhan')) {
      extracted.crop = 'Rice';
      extracted.category = 'Agriculture';
    }
    if (q.includes('sugarcane') || q.includes('ganna') || q.includes('cane')) {
      extracted.crop = 'Sugarcane';
      extracted.category = 'Agriculture';
    }
    if (q.includes('irrigation') || q.includes('drip') || q.includes('sprinkler') || q.includes('water') || q.includes('pump') || q.includes('solar pump')) {
      extracted.category = 'Rural & Environment';
      if (q.includes('solar') || q.includes('kusum')) extracted.keywords.push('solar', 'pump', 'kusum');
    }
    if (q.includes('insurance') || q.includes('crop insurance') || q.includes('pmfby') || q.includes('loss') || q.includes('claim')) {
      extracted.category = 'Financial Services and Insurance';
      extracted.keywords.push('insurance', 'fasal', 'bima');
    }
    if (q.includes('tractor') || q.includes('machinery') || q.includes('tiller') || q.includes('rotavator') || q.includes('implement')) {
      extracted.keywords.push('tractor', 'machinery', 'implement', 'tiller', 'rotavator');
    }
    if (q.includes('organic') || q.includes('compost') || q.includes('natural') || q.includes('jaivik')) {
      extracted.keywords.push('organic', 'natural farming', 'compost', 'jaivik');
    }
    if (q.includes('women') || q.includes('female') || q.includes('mahila') || q.includes('girl')) {
      extracted.keywords.push('women', 'female', 'mahila', 'girl');
    }
    if (q.includes('pm kisan') || q.includes('pm-kisan') || q.includes('samman nidhi')) {
      extracted.keywords.push('pm-kisan', 'samman', 'nidhi');
    }

    return extracted;
  };

  // Speech Recognition hook
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      // Run intent mapping on voice query
      const extFilters = extractSearchFilters(transcript);
      if (extFilters.category) {
        setFilters(f => ({ ...f, category: extFilters.category }));
      }
      if (extFilters.crop) {
        setFilters(f => ({ ...f, crop: extFilters.crop }));
      }
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Search, Intent mapping & Filters Execution
  const filteredSchemes = schemes.filter(sch => {
    // Exclude hidden schemes
    if (hiddenSchemes.includes(sch.slug || sch.name)) return false;

    // Search query matching
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      sch.name.toLowerCase().includes(q) || 
      sch.details.toLowerCase().includes(q) || 
      sch.eligibility.toLowerCase().includes(q) || 
      sch.category.toLowerCase().includes(q) || 
      sch.tags.toLowerCase().includes(q);

    // Filters matching
    const matchesLevel = filters.level === 'All' || sch.level === filters.level;
    
    // Category matching (checks substring)
    const matchesCategory = filters.category === 'All' || 
      sch.category.toLowerCase().includes(filters.category.toLowerCase()) || 
      (filters.category === 'Machinery' && sch.tags.toLowerCase().includes('machinery')) || 
      (filters.category === 'Organic Farming' && sch.tags.toLowerCase().includes('organic'));
      
    // Crop matching
    const matchesCrop = filters.crop === 'All' || 
      sch.tags.toLowerCase().includes(filters.crop.toLowerCase()) || 
      sch.details.toLowerCase().includes(filters.crop.toLowerCase()) ||
      sch.eligibility.toLowerCase().includes(filters.crop.toLowerCase());

    // State matching (if state is selected, and scheme is state level, they must match)
    const matchesState = filters.state === 'All' || sch.level === 'Central' || 
      (sch.schemeState && sch.schemeState.toLowerCase() === filters.state.toLowerCase()) ||
      (!sch.schemeState); // if state scheme but state name not found, keep it

    // Eligibility Status
    const matchesStatus = filters.status === 'All' || sch.status === filters.status;

    // Saved/Applied filters
    const matchesSaved = !filters.showSaved || savedSchemes.includes(sch.slug || sch.name);
    const matchesApplied = filters.showApplied ? appliedSchemes.includes(sch.slug || sch.name) : !appliedSchemes.includes(sch.slug || sch.name);

    return matchesSearch && matchesLevel && matchesCategory && matchesCrop && matchesState && matchesStatus && matchesSaved && matchesApplied;
  });

  // Calculate Group Sections
  const recommendedSchemes = filteredSchemes
    .filter(s => s.status !== 'Not Eligible' && s.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const eligibleSchemes = filteredSchemes
    .filter(s => s.status === 'Eligible' && !recommendedSchemes.some(r => r.name === s.name));

  const likelyEligibleSchemes = filteredSchemes
    .filter(s => (s.status === 'Likely Eligible' || s.status === 'Need More Information') && !recommendedSchemes.some(r => r.name === s.name));

  const popularSchemes = filteredSchemes
    .filter(s => s.level === 'Central' && (s.name.includes('PM-Kisan') || s.name.includes('Fasal Bima') || s.name.includes('Sincha') || s.name.includes('KUSUM')))
    .slice(0, 4);

  // Pagination for Browse All
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const paginatedSchemes = filteredSchemes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dynamic document checklist state helpers
  const getSchemeDocs = (scheme) => {
    const rawDocs = scheme.documents || '';
    if (!rawDocs) return [];
    
    // Split by common delimiters (dots, commas, or newlines)
    return rawDocs
      .split(/[.\n•]/)
      .map(d => d.trim())
      .filter(d => d.length > 4 && !d.toLowerCase().includes('feedback form') && !d.toLowerCase().includes('proceedings'));
  };

  const getDocProgress = (scheme) => {
    const docs = getSchemeDocs(scheme);
    if (docs.length === 0) return { total: 0, checked: 0, percent: 100 };
    
    const slug = scheme.slug || scheme.name;
    const checkedList = docChecklist[slug] || {};
    let checkedCount = 0;
    
    docs.forEach(doc => {
      if (checkedList[doc]) checkedCount++;
    });
    
    return {
      total: docs.length,
      checked: checkedCount,
      percent: Math.round((checkedCount / docs.length) * 100)
    };
  };

  const toggleDocCheckbox = (schemeSlug, docName) => {
    const nextChecklist = { ...docChecklist };
    if (!nextChecklist[schemeSlug]) nextChecklist[schemeSlug] = {};
    nextChecklist[schemeSlug][docName] = !nextChecklist[schemeSlug][docName];
    setDocChecklist(nextChecklist);
  };

  // WhatsApp share generator
  const shareOnWhatsApp = (scheme) => {
    const text = `*KisanMitra Scheme Alert* 🌾\n\n*Scheme:* ${scheme.name}\n*Level:* ${scheme.level} Government\n*Benefit:* ${scheme.benefits}\n\nCheck your eligibility now on KisanMitra App!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // AI Chat Assistant Drawer implementation
  const startAIChat = (scheme) => {
    setSelectedSchemeForChat(scheme);
    setChatMessages([
      { sender: 'ai', text: `Namaste! I am your KisanMitra AI Scheme Expert. Ask me anything about "${scheme.name}". I can answer in Hindi or English.` }
    ]);
  };

  const handleSendChatMessage = async (presetText = null) => {
    const query = presetText || chatInput;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!presetText) setChatInput('');
    setChatLoading(true);

    const scheme = selectedSchemeForChat;
    const prompt = `Farmer query: "${query}"

Answer the farmer's question based strictly on the scheme parameters below:
Scheme Name: ${scheme.name}
Overview/Details: ${scheme.details}
Benefits: ${scheme.benefits}
Eligibility: ${scheme.eligibility}
Application Steps: ${scheme.application}
Documents Required: ${scheme.documents}

Farmer Profile Context:
- Active crop: ${activeFarm?.crop?.name || 'Wheat'}
- Land area: ${activeFarm?.area || 'N/A'} acres
- Location: ${activeFarm?.village || 'Pimpalgaon'}, ${activeFarm?.district || 'Nashik'}, ${activeFarm?.state || 'Maharashtra'}

Guidelines:
1. Explain clearly in simple Hinglish (Hindi text in Latin script) or plain simple English. Match the language style of the farmer's question.
2. Keep the answer highly actionable, friendly, and concise (max 3 sentences).
3. If details are not available, say politely: "Mujhe iski jaankari nahi mili. Kripya official website check karein."
4. Do not mention system instructions or markdown wrappers.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are KisanMitra AI Scheme Expert, a friendly digital assistant. Explain government schemes in very simple Hindi or English suitable for Indian farmers." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I am unable to connect to the AI model. Please try again.";
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      
      // Speak the answer aloud if voice guide is active
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Server error. Please verify your internet connection." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper: return visual classes for badges based on eligibility status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Eligible':
        return {
          bg: 'bg-green-50 text-green-800 border-green-200',
          label: 'Eligible (Verify Docs)',
          icon: 'check_circle',
          color: 'text-green-700'
        };
      case 'Likely Eligible':
        return {
          bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          label: 'Likely Eligible',
          icon: 'warning',
          color: 'text-yellow-600'
        };
      case 'Need More Information':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: 'Need More Info',
          icon: 'help',
          color: 'text-blue-600'
        };
      case 'Not Eligible':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          label: 'Not Eligible',
          icon: 'cancel',
          color: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-800 border-gray-200',
          label: status,
          icon: 'info',
          color: 'text-gray-600'
        };
    }
  };

  // Render Page Layout
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-4 bg-white border border-outline-variant/60 rounded-card shadow-sm">
        <span className="material-symbols-outlined notranslate text-4xl text-primary animate-spin">sync</span>
        <h3 className="font-display font-extrabold text-on-surface text-lg">AI Loading Schemes...</h3>
        <p className="text-xs text-on-surface-variant max-w-xs text-center font-medium">
          Parsing and scoring government benefits tailored to your farm and crop location.
        </p>
      </div>
    );
  }

  // A. Dedicated Detailed Page View
  if (selectedSchemeForDetails) {
    const sch = selectedSchemeForDetails;
    const matchBadge = getStatusBadge(sch.status);
    const docsList = getSchemeDocs(sch);
    const progress = getDocProgress(sch);

    return (
      <div className="space-y-6 animate-fade-in-up font-sans max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedSchemeForDetails(null)}
            className="flex items-center gap-2 text-primary hover:text-secondary font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Schemes List</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                const slug = sch.slug || sch.name;
                if (savedSchemes.includes(slug)) {
                  setSavedSchemes(prev => prev.filter(s => s !== slug));
                } else {
                  setSavedSchemes(prev => [...prev, slug]);
                }
              }}
              className={`p-2.5 rounded-full border transition-all ${
                savedSchemes.includes(sch.slug || sch.name) 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-on-surface-variant hover:bg-surface-container border-outline-variant'
              }`}
              title="Bookmark Scheme"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const slug = sch.slug || sch.name;
                if (favSchemes.includes(slug)) {
                  setFavSchemes(prev => prev.filter(s => s !== slug));
                } else {
                  setFavSchemes(prev => [...prev, slug]);
                }
              }}
              className={`p-2.5 rounded-full border transition-all ${
                favSchemes.includes(sch.slug || sch.name) 
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-xs' 
                  : 'bg-white text-on-surface-variant hover:bg-surface-container border-outline-variant'
              }`}
              title="Add to Favorites"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => shareOnWhatsApp(sch)}
              className="p-2.5 rounded-full border bg-white text-green-700 hover:bg-green-50 border-green-200"
              title="Share via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Hero Card */}
        <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                sch.level === 'Central' ? 'bg-primary-container text-white' : 'bg-secondary-container text-on-secondary-container'
              }`}>
                🏛️ {sch.level} Government
              </span>
              <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-3 py-1 rounded-full uppercase">
                🏷️ {sch.category.split(',')[0]}
              </span>
              <span className="text-[10px] font-bold bg-[#fdf2f8] text-[#be185d] border border-[#fbcfe8] px-3 py-1 rounded-full flex items-center gap-1">
                ⚡ Recommendation Score: {sch.score}%
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl text-on-surface leading-tight">
              {sch.name}
            </h1>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wider">Estimated Financial Benefit</span>
                <span className="text-base font-extrabold text-primary block mt-0.5">🎁 {sch.benefits || "Direct Benefit Scheme"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined notranslate text-2xl ${matchBadge.color}`}>{matchBadge.icon}</span>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wider">KisanMitra Verification</span>
                  <span className={`text-sm font-extrabold block ${matchBadge.color}`}>{matchBadge.label}</span>
                </div>
              </div>
            </div>

            {/* AI match explanation */}
            {sch.status !== 'Not Eligible' && (
              <div className="bg-[#f0fdf4] border border-primary/20 p-3.5 rounded-xl text-xs text-on-surface flex items-start gap-2">
                <span className="material-symbols-outlined notranslate text-primary text-lg font-bold mt-0.5">sparkles</span>
                <div>
                  <strong className="text-primary font-bold">KisanMitra Insight:</strong> {sch.explanation}
                </div>
              </div>
            )}

            {/* AI Checker Prompts if missing info */}
            {sch.status === 'Need More Information' && sch.missingInfo.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                  <span>Missing Information Required for Verification:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sch.missingInfo.map((info, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDashboardTab('settings')}
                      className="bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      <span>Configure {info}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://myscheme.gov.in/schemes/${sch.slug || 'search'}`}
                target="_blank"
                rel="noreferrer"
                className="bg-primary hover:bg-secondary text-white font-extrabold h-11 px-6 rounded-xl flex items-center justify-center gap-2 shadow-xs text-xs transition-all active:scale-[0.98]"
              >
                <span>Visit Official Website</span>
                <span className="material-symbols-outlined notranslate text-sm font-bold">open_in_new</span>
              </a>
              <button
                onClick={() => startAIChat(sch)}
                className="bg-white hover:bg-primary/5 text-primary border-2 border-primary font-extrabold h-11 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition-all"
              >
                <span className="material-symbols-outlined notranslate text-primary text-sm font-bold">chat</span>
                <span>Ask AI About This Scheme</span>
              </button>
              
              <button
                onClick={() => {
                  const slug = sch.slug || sch.name;
                  if (appliedSchemes.includes(slug)) {
                    setAppliedSchemes(prev => prev.filter(s => s !== slug));
                  } else {
                    setAppliedSchemes(prev => [...prev, slug]);
                  }
                  setSelectedSchemeForDetails(null);
                }}
                className={`h-11 px-5 rounded-xl border text-xs font-bold transition-all ${
                  appliedSchemes.includes(sch.slug || sch.name)
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {appliedSchemes.includes(sch.slug || sch.name) ? 'Mark as Not Applied' : 'Mark as Already Applied'}
              </button>
            </div>

          </div>
        </div>

        {/* Content Accordion Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Navigation Accordion Left */}
          <div className="space-y-2 md:col-span-1">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveAccordion(sec.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                  activeAccordion === sec.id
                    ? 'bg-primary/5 text-primary border-primary shadow-xs'
                    : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined notranslate text-sm ${activeAccordion === sec.id ? 'text-primary' : 'text-on-surface-variant'}`}>{sec.icon}</span>
                  <span>{sec.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeAccordion === sec.id ? 'rotate-90 text-primary' : 'text-on-surface-variant'}`} />
              </button>
            ))}
          </div>

          {/* Details Content Right */}
          <div className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm md:col-span-2 space-y-4 min-h-[300px]">
            {activeAccordion === 'overview' && (
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-base text-on-surface">Scheme Overview</h3>
                <div className="text-xs leading-relaxed text-on-surface-variant font-medium space-y-2">
                  {sch.details.split(/[.\n]/).filter(s => s.trim().length > 10).map((sentence, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-surface-container-low/40 p-2.5 rounded-xl">
                      <span className="text-primary font-bold text-xs mt-0.5">•</span>
                      <span>{sentence.trim()}.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAccordion === 'benefits' && (
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-base text-on-surface">Benefits & Subsidies</h3>
                <div className="grid grid-cols-1 gap-3">
                  {sch.benefits.split(/[.\n]/).filter(s => s.trim().length > 5).map((ben, idx) => (
                    <div key={idx} className="p-3 bg-green-50/50 border border-green-100 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined notranslate text-green-700 text-lg mt-0.5">payments</span>
                      <div className="text-xs font-semibold text-green-950 leading-relaxed">
                        {ben.trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAccordion === 'eligibility' && (
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-base text-on-surface">Eligibility Criteria</h3>
                <div className="space-y-2.5">
                  {sch.eligibility.split(/[.\n]/).filter(s => s.trim().length > 8).map((elig, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 bg-surface-container-lowest border rounded-xl">
                      <span className="material-symbols-outlined notranslate text-primary text-lg shrink-0">check_circle</span>
                      <span className="text-xs text-on-surface font-semibold leading-relaxed">
                        {elig.trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAccordion === 'documents' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-extrabold text-base text-on-surface">Required Documents Checklist</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                    {progress.percent}% Ready
                  </span>
                </div>

                {docsList.length === 0 ? (
                  <p className="text-xs text-on-surface-variant font-semibold">No documents listed. Standard ID certificates apply.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {docsList.map((doc, idx) => {
                        const isChecked = !!(docChecklist[sch.slug || sch.name] || {})[doc];
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleDocCheckbox(sch.slug || sch.name, doc)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              isChecked 
                                ? 'bg-primary/5 border-primary/30 text-on-surface' 
                                : 'bg-white border-outline-variant hover:bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5 text-primary">
                              {isChecked ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                            </span>
                            <span className="text-xs font-semibold leading-tight">{doc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeAccordion === 'application' && (
              <div className="space-y-5">
                <h3 className="font-display font-extrabold text-base text-on-surface">Step-by-step Application</h3>
                <div className="relative pl-6 border-l-2 border-l-primary/20 space-y-6">
                  {sch.application.split(/Step \d+:|Step \d+/i).filter(s => s.trim().length > 8).map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/30 space-y-1">
                        <span className="font-bold text-xs text-primary block">Step {idx + 1}</span>
                        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                          {step.trim().replace(/^[\s:]+/, '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAccordion === 'notes' && (
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-base text-on-surface">AI Tips & Common Mistakes</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                      <span className="material-symbols-outlined notranslate text-amber-700 text-sm">warning</span> Common Mistake
                    </span>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      Mismatch in Land Registry names compared to Aadhaar details is the #1 reason for scheme application rejection. Ensure spelling matches exactly.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-blue-900 flex items-center gap-1">
                      <span className="material-symbols-outlined notranslate text-blue-700 text-sm">lightbulb</span> Smart Farmer Tip
                    </span>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed">
                      Link your active bank account to your Aadhaar number. All financial subsidies under Direct Benefit Transfer (DBT) flow through Aadhaar-linked accounts only.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // B. Main Landing / Discovery List View
  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      
      {/* Dynamic Notifications Banner */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-card space-y-2 relative overflow-hidden shadow-xs">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined notranslate text-primary text-2xl font-bold mt-0.5">notifications_active</span>
          <div>
            <h4 className="font-display font-bold text-on-surface text-sm">Upcoming Scheme Deadlines & Alerts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs font-semibold text-on-surface-variant">
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-outline-variant/30">
                <span className="h-2 w-2 bg-red-500 rounded-full shrink-0" />
                <span>PM-Kisan DBT verify: <strong>July 15th</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-outline-variant/30">
                <span className="h-2 w-2 bg-amber-500 rounded-full shrink-0" />
                <span>Kharif PMFBY Crop Insurance: <strong>July 31st</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="text-center py-6 border-b border-surface-container-high space-y-2">
        <h1 className="font-display text-3xl font-extrabold text-primary tracking-tight">
          Government Schemes for Farmers
        </h1>
        <p className="text-xs text-on-surface-variant font-medium max-w-lg mx-auto leading-relaxed">
          KisanMitra cross-references your active crop planner, location, and landholding size to automatically discover subsidies and benefits you are eligible to claim.
        </p>
      </header>

      {/* Farm Profile Switcher */}
      <div className="bg-white border border-outline-variant/50 p-4 rounded-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Currently Selected Profile</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined notranslate text-primary font-bold">agriculture</span>
            <span className="font-bold text-sm text-on-surface">{activeFarm?.name || 'My Farm'}</span>
            <span className="text-xs font-medium text-on-surface-variant">
              ({activeFarm?.crop?.name?.toUpperCase()} · {activeFarm?.area} {activeFarm?.unit} · {activeFarm?.village}, {activeFarm?.district})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto py-1">
          {farms.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedFarmIndex(i);
                setFilters(prev => ({
                  ...prev,
                  state: f.state || 'All',
                  district: f.district || 'All'
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors shrink-0 ${
                selectedFarmIndex === i
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              🚜 {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & Voice Input */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search Input Box */}
        <div className="md:col-span-3 relative">
          <input
            type="text"
            placeholder="Search schemes manually (e.g. 'I am growing wheat', 'Solar pump subsidy', 'Crop insurance')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-input h-12 pl-11 pr-12 text-xs font-semibold focus:border-primary focus:outline-none shadow-xs"
          />
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-on-surface-variant/70" />
          
          <button
            onClick={handleVoiceSearch}
            className={`absolute right-2 top-2 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
            title="Search by Voice"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown level filter */}
        <div className="flex gap-2">
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="flex-1 bg-white border border-outline-variant rounded-input h-12 px-3 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Central">Central Govt</option>
            <option value="State">State Govt</option>
          </select>

          <button
            onClick={() => setFilters(f => ({ ...f, showSaved: !f.showSaved }))}
            className={`px-3 rounded-input border flex items-center gap-1.5 transition-all ${
              filters.showSaved 
                ? 'bg-primary text-white border-primary shadow-xs' 
                : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Toggle Bookmarked"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Saved</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Chips / Dropdowns Row */}
      <div className="bg-white border border-outline-variant/40 p-4 rounded-card space-y-4 shadow-xs">
        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Search & Category Filters</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Scheme Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Agriculture">Agriculture & Seeds</option>
              <option value="Rural & Environment">Irrigation & Environment</option>
              <option value="Financial Services and Insurance">Insurance & Credit</option>
              <option value="Business & Entrepreneurship">Machinery & CHC</option>
              <option value="Social welfare & Empowerment">Social Welfare</option>
              <option value="Women and Child">Women & Child</option>
              <option value="Education & Learning">Education</option>
            </select>
          </div>

          {/* Crop Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Target Crop</label>
            <select
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
            >
              <option value="All">All Crops</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Cotton">Cotton</option>
              <option value="Soybean">Soybean</option>
              <option value="Maize">Maize</option>
              <option value="Tomato">Tomato / Vegetables</option>
            </select>
          </div>

          {/* Location State Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase">State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
            >
              <option value="All">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Puducherry">Puducherry</option>
            </select>
          </div>

          {/* Eligibility Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Eligibility Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
            >
              <option value="All">All Eligibility</option>
              <option value="Eligible">Eligible (Match)</option>
              <option value="Likely Eligible">Likely Eligible</option>
              <option value="Need More Information">Need More Info</option>
              <option value="Not Eligible">Not Eligible</option>
            </select>
          </div>
        </div>

        {/* Saved/Applied Toggle */}
        <div className="flex items-center gap-4 border-t pt-3 border-surface-container">
          <label className="flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showApplied}
              onChange={(e) => setFilters({ ...filters, showApplied: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Show Already Applied Schemes</span>
          </label>
          
          <button 
            onClick={() => setFilters({
              level: 'All',
              category: 'All',
              crop: 'All',
              state: activeFarm?.state || 'All',
              district: activeFarm?.district || 'All',
              status: 'All',
              showSaved: false,
              showApplied: false
            })}
            className="text-primary hover:underline text-[10px] font-extrabold ml-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* --- SECTION 1: Recommended for You --- */}
      {!filters.showSaved && recommendedSchemes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-on-surface">Recommended for You</h2>
              <p className="text-[10px] text-on-surface-variant font-medium">AI-calculated top benefit opportunities matching your profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedSchemes.map(sch => (
              <SchemeCard
                key={sch.slug || sch.name}
                sch={sch}
                profile={profile}
                activeFarm={activeFarm}
                savedSchemes={savedSchemes}
                setSavedSchemes={setSavedSchemes}
                favSchemes={favSchemes}
                setFavSchemes={setFavSchemes}
                hiddenSchemes={hiddenSchemes}
                setHiddenSchemes={setHiddenSchemes}
                appliedSchemes={appliedSchemes}
                setAppliedSchemes={setAppliedSchemes}
                docChecklist={docChecklist}
                toggleDocCheckbox={toggleDocCheckbox}
                getDocProgress={calculateDocProgress}
                getSchemeDocs={parseSchemeDocs}
                getStatusBadge={getStatusBadge}
                startAIChat={startAIChat}
                shareOnWhatsApp={shareOnWhatsApp}
                setActiveDashboardTab={setActiveDashboardTab}
                setSelectedSchemeForDetails={setSelectedSchemeForDetails}
              />
            ))}
          </div>
        </section>
      )}

      {/* Grid: Eligible & Popular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- SECTION 2: You're Eligible For --- */}
        <section className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
            <span className="material-symbols-outlined notranslate text-primary text-xl">check_circle</span>
            You're Eligible For
          </h3>

          {eligibleSchemes.length === 0 ? (
            <div className="text-center py-6 text-xs text-on-surface-variant font-semibold bg-surface-container-low/20 border border-dashed rounded-xl">
              No matching schemes found. Adjust crop or location filters.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {eligibleSchemes.slice(0, 5).map(sch => (
                <div key={sch.slug || sch.name} className="p-4 rounded-xl border border-outline-variant/60 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-on-surface leading-tight hover:text-primary cursor-pointer" onClick={() => setSelectedSchemeForDetails(sch)}>
                        {sch.name}
                      </h4>
                      <span className="text-xs text-on-surface-variant font-medium mt-1.5 block line-clamp-2 leading-relaxed">
                        <strong className="text-primary">Benefit:</strong> {sch.benefits}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
                      Eligible
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-surface-container-high">
                    <span className="text-[11px] text-on-surface-variant font-bold">Docs Ready: {getDocProgress(sch).percent}%</span>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedSchemeForDetails(sch)} className="text-xs font-extrabold text-primary hover:underline">
                        Apply Now
                      </button>
                      <button onClick={() => startAIChat(sch)} className="text-xs font-extrabold text-on-surface-variant hover:text-primary">
                        Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION 3: Possibly Eligible --- */}
        <section className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
            <span className="material-symbols-outlined notranslate text-amber-600 text-xl">help</span>
            Possibly Eligible
          </h3>

          {likelyEligibleSchemes.length === 0 ? (
            <div className="text-center py-6 text-xs text-on-surface-variant font-semibold bg-surface-container-low/20 border border-dashed rounded-xl">
              No additional matching schemes.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {likelyEligibleSchemes.slice(0, 5).map(sch => {
                const badge = getStatusBadge(sch.status);
                return (
                  <div key={sch.slug || sch.name} className="p-4 rounded-xl border border-outline-variant/60 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-on-surface leading-tight hover:text-primary cursor-pointer" onClick={() => setSelectedSchemeForDetails(sch)}>
                          {sch.name}
                        </h4>
                        <span className="text-xs text-on-surface-variant font-medium mt-1.5 block line-clamp-2 leading-relaxed">
                          <strong className="text-on-surface">Benefit:</strong> {sch.benefits}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    {sch.missingInfo.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100 leading-relaxed font-semibold">
                        ⚠️ <strong>Configure Profile details to verify:</strong> {sch.missingInfo.join(', ')}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-surface-container-high">
                      <span className="text-[11px] text-on-surface-variant font-bold">Ready: {getDocProgress(sch).percent}%</span>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedSchemeForDetails(sch)} className="text-xs font-extrabold text-primary hover:underline">
                          Verify & Apply
                        </button>
                        <button onClick={() => startAIChat(sch)} className="text-xs font-extrabold text-on-surface-variant hover:text-primary">
                          Ask AI
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* --- SECTION 4: Popular Schemes --- */}
      {!filters.showSaved && (
        <section className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
            <span className="material-symbols-outlined notranslate text-primary text-xl">recommend</span>
            Popular National Schemes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {popularSchemes.map(sch => (
              <div key={sch.slug || sch.name} className="p-4 rounded-xl border border-outline-variant/40 hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[8px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                  <h4 className="font-bold text-xs text-on-surface leading-tight hover:text-primary cursor-pointer" onClick={() => setSelectedSchemeForDetails(sch)}>
                    {sch.name}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-semibold line-clamp-2">🎁 {sch.benefits}</p>
                </div>
                <button
                  onClick={() => setSelectedSchemeForDetails(sch)}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-primary font-bold py-2 rounded-lg text-[10px] text-center border border-outline-variant/20 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- SECTION 5: Browse All Schemes --- */}
      <section className="bg-white border border-outline-variant/60 rounded-card p-6 shadow-sm space-y-4">
        <h3 className="font-display font-extrabold text-base text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
          <span className="material-symbols-outlined notranslate text-primary text-xl">list_alt</span>
          Browse All Schemes ({filteredSchemes.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedSchemes.map(sch => (
            <SchemeCard
              key={sch.slug || sch.name}
              sch={sch}
              profile={profile}
              activeFarm={activeFarm}
              savedSchemes={savedSchemes}
              setSavedSchemes={setSavedSchemes}
              favSchemes={favSchemes}
              setFavSchemes={setFavSchemes}
              hiddenSchemes={hiddenSchemes}
              setHiddenSchemes={setHiddenSchemes}
              appliedSchemes={appliedSchemes}
              setAppliedSchemes={setAppliedSchemes}
              docChecklist={docChecklist}
              toggleDocCheckbox={toggleDocCheckbox}
              getDocProgress={calculateDocProgress}
              getSchemeDocs={parseSchemeDocs}
              getStatusBadge={getStatusBadge}
              startAIChat={startAIChat}
              shareOnWhatsApp={shareOnWhatsApp}
              setActiveDashboardTab={setActiveDashboardTab}
              setSelectedSchemeForDetails={setSelectedSchemeForDetails}
            />
          ))}
        </div>

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-surface-container-high pt-4">
            <button
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white text-on-surface disabled:opacity-50 hover:bg-surface-container"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-on-surface">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white text-on-surface disabled:opacity-50 hover:bg-surface-container"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Conversation AI Chat Modal Drawer */}
      {selectedSchemeForChat && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined notranslate fill text-xl">chat</span>
                <div>
                  <h3 className="font-display font-extrabold text-xs">AI Scheme Assistant</h3>
                  <p className="text-[10px] text-primary-fixed truncate max-w-[280px] font-semibold">{selectedSchemeForChat.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSchemeForChat(null)}
                className="text-white hover:bg-white/10 rounded-full p-1 flex items-center justify-center"
              >
                <span className="material-symbols-outlined notranslate text-lg">close</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-background">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-on-surface border border-outline-variant/30 shadow-xs rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-on-surface border p-3 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Preset Action Chips */}
            <div className="p-3 bg-white border-t space-y-2">
              <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Quick Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Am I eligible?",
                  "How do I apply?",
                  "Which documents are required?",
                  "How much subsidy will I get?",
                  "Can I apply online?"
                ].map(q => (
                  <button
                    key={q}
                    disabled={chatLoading}
                    onClick={() => handleSendChatMessage(q)}
                    className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-[10px] font-bold text-primary px-3 py-1.5 rounded-full transition-all shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t flex gap-2">
              <input
                type="text"
                placeholder="Type your question in Hindi or English..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage();
                }}
                disabled={chatLoading}
                className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-primary hover:bg-secondary text-white h-10 w-10 rounded-xl flex items-center justify-center disabled:opacity-50 shrink-0 transition-colors shadow-xs"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
