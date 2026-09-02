import React, { useState } from 'react';
import {
  Calendar, ChevronDown, ChevronUp, Sparkles, AlertCircle, Plus,
  Building2, Phone, Mail, ExternalLink, Bookmark, Heart, Share2
} from 'lucide-react';
import { parseSchemeDocs, calculateDocProgress } from '../../services/schemesService';

export function SchemeCard({
  sch,
  profile,
  activeFarm,
  savedSchemes,
  setSavedSchemes,
  favSchemes,
  setFavSchemes,
  appliedSchemes,
  setAppliedSchemes,
  docChecklist,
  toggleDocCheckbox,
  getStatusBadge,
  startAIChat,
  shareOnWhatsApp,
  setActiveDashboardTab
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusBadge = getStatusBadge(sch.status);
  const docsList = parseSchemeDocs(sch);
  const progress = calculateDocProgress(sch, docChecklist);
  
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
      {/* 1. Header block */}
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
          {sch.details ? sch.details.split(/[.\n]/)[0] + '.' : ''}
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
          {sch.explanation && sch.status !== 'Not Eligible' && (
            <div className="bg-[#f0fdf4] border border-primary/20 p-3 rounded-xl text-[11px] text-on-surface flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                <strong className="text-primary font-bold">KisanMitra Insight:</strong> {sch.explanation}
              </div>
            </div>
          )}

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

          <div className="border-l-4 border-l-green-600 bg-green-50/50 p-3.5 rounded-r-xl space-y-1">
            <h4 className="font-bold text-xs text-green-900 flex items-center gap-1.5">
              Benefits
            </h4>
            <p className="text-[11px] text-green-950 leading-relaxed font-semibold">
              {sch.benefits}
            </p>
          </div>

          <div className="border-l-4 border-l-blue-600 bg-blue-50/50 p-3.5 rounded-r-xl space-y-1">
            <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              Eligibility
            </h4>
            <p className="text-[11px] text-blue-950 leading-relaxed font-semibold">
              {sch.eligibility}
            </p>
          </div>

          {sch.application && (
            <div className="border-l-4 border-l-purple-600 bg-purple-50/50 p-3.5 rounded-r-xl space-y-1">
              <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                How To Apply
              </h4>
              <p className="text-[11px] text-purple-950 leading-relaxed font-semibold">
                {sch.application.split('.')[0]}.
              </p>
            </div>
          )}

          {docsList.length > 0 && (
            <div className="border-l-4 border-l-amber-600 bg-amber-50/50 p-3.5 rounded-r-xl space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-amber-900">Required Documents</h4>
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
                        isChecked ? 'bg-[#1e8e3e] text-white border-[#1e8e3e]' : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container'
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

          <div className="border-l-4 border-l-slate-400 bg-slate-50/50 p-3.5 rounded-r-xl space-y-2">
            <h4 className="font-bold text-xs text-slate-700">Contact Info</h4>
            <div className="text-[10px] text-slate-800 space-y-1 font-semibold leading-relaxed">
              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span>{contactInfo.dept}</span></div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span>{contactInfo.phone}</span></div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span>{contactInfo.email}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer Actions */}
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
            <span>Ask AI Agent</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const slug = sch.slug || sch.name;
              setSavedSchemes(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
            }}
            className={`p-1.5 rounded-lg hover:bg-surface-container transition-all ${isSaved ? 'text-primary' : 'text-on-surface-variant'}`}
            title="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </button>

          <button
            onClick={() => {
              const slug = sch.slug || sch.name;
              setFavSchemes(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
            }}
            className={`p-1.5 rounded-lg hover:bg-surface-container transition-all ${isFav ? 'text-red-600' : 'text-on-surface-variant'}`}
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
              setAppliedSchemes(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
            }}
            className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
              isApplied ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Mark as Applied"
          >
            {isApplied ? 'Applied' : 'Apply?'}
          </button>
        </div>
      </div>
    </div>
  );
}
