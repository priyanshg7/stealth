import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Clock, Calendar, AlertCircle, MapPin, 
  Sprout, ThermometerSun, Droplets, TrendingUp,
  History, Activity, Bug, ArrowRight, Sun, CloudRain, ShieldCheck, FileText, UploadCloud
} from 'lucide-react';
import { t } from '../../utils/translations';

// Mock Previous Crop Data for Digital Diary functionality
const MOCK_PREVIOUS_CROP = {
  id: 'season_2025_kharif',
  cropName: 'Rice',
  variety: 'Pusa Basmati 1121',
  sowingDate: '2025-06-15',
  harvestDate: '2025-11-05',
  totalDays: 143,
  yield: '28 Quintals/Acre',
  profit: '₹85,000',
  completionScore: 100,
  tasks: [
    { id: 'p1', title: 'Nursery Bed Preparation', date: '2025-06-05', status: 'completed', stage: 'Preparation' },
    { id: 'p2', title: 'Seed Treatment', date: '2025-06-12', status: 'completed', stage: 'Sowing' },
    { id: 'p3', title: 'Transplanting', date: '2025-07-05', status: 'completed', stage: 'Transplanting' },
    { id: 'p4', title: 'First Top Dressing (Urea)', date: '2025-07-25', status: 'completed', stage: 'Vegetative Growth' },
    { id: 'p5', title: 'Stem Borer Spray', date: '2025-08-15', status: 'completed', stage: 'Pest Management' },
    { id: 'p6', title: 'Harvesting', date: '2025-11-05', status: 'completed', stage: 'Harvest' }
  ],
  milestones: [
    { title: 'Sowing Completed', date: '2025-06-15', icon: 'Sprout' },
    { title: 'Maximum Tillering', date: '2025-08-10', icon: 'Activity' },
    { title: 'Flowering Stage', date: '2025-09-20', icon: 'Sun' },
    { title: 'Harvested', date: '2025-11-05', icon: 'CheckCircle2' }
  ],
  analytics: {
    totalTasks: 24, completedOnTime: 22, delayed: 2, irrigations: 16, fertilizers: 3, diseases: 1
  }
};

export default function FarmJourney({
  farms = [],
  selectedFarmIndex = 0,
  setSelectedFarmIndex,
  getFarmDashboardData,
  completedTasks = [],
  weatherData,
  language
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;
  const rawTasks = dashboardData?.tasks || [];
  
  // State for historical view
  const [activeSeason, setActiveSeason] = useState('current'); // 'current' or 'season_2025_kharif'

  const currentCropData = {
    cropName: dashboardData?.cropName || activeFarm?.crop?.name || 'Wheat',
    variety: activeFarm?.crop?.variety || 'Karan Vandana',
    sowingDate: activeFarm?.crop?.sowingDate || '2026-06-01',
    harvestDate: activeFarm?.crop?.harvestDate || '2026-10-15',
    currentStage: dashboardData?.timelineStageIndex || 3,
    ageDays: 35, // Mocked for calculation based on sowing date
    remainingDays: dashboardData?.harvestDays || 85,
    completionPercentage: dashboardData?.growthProgress || 35,
    expectedYield: dashboardData?.expectedYield || '24 Quintals/Acre'
  };

  const isHistorical = activeSeason !== 'current';
  const displayData = isHistorical ? MOCK_PREVIOUS_CROP : currentCropData;
  const displayTasks = isHistorical ? MOCK_PREVIOUS_CROP.tasks : rawTasks;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      
      {/* 1. Header & Farm/Season Selector */}
      <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-card p-6 text-white shadow-lg relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute right-0 bottom-0 opacity-10">
          <Sprout className="w-48 h-48 -mb-10 -mr-10" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Digital Crop Diary
              </span>
              <select 
                value={activeSeason}
                onChange={(e) => setActiveSeason(e.target.value)}
                className="bg-black/20 border border-white/30 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="current" className="text-black">Current Season ({currentCropData.cropName})</option>
                <option value="season_2025_kharif" className="text-black">Kharif 2025 ({MOCK_PREVIOUS_CROP.cropName})</option>
              </select>
            </div>
            
            <h1 className="font-display font-extrabold text-3xl mb-1 flex items-center gap-2">
              {displayData.cropName} <span className="text-emerald-200 text-xl font-bold">({displayData.variety})</span>
            </h1>
            <p className="text-sm text-emerald-100 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {activeFarm?.name || 'My Farm'} • Sown on {displayData.sowingDate}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-black/15 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
            {!isHistorical && (
              <div className="text-center">
                <div className="text-3xl font-black text-white">{displayData.ageDays}</div>
                <div className="text-[10px] uppercase font-bold text-emerald-100">Days Age</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-3xl font-black text-white">{displayData.remainingDays || displayData.totalDays}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-100">{isHistorical ? 'Total Days' : 'Days to Harvest'}</div>
            </div>
            <div className="h-12 w-px bg-white/20 mx-2"></div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-black/20" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-white drop-shadow-md" strokeDasharray={`${displayData.completionPercentage || displayData.completionScore}, 100`} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {displayData.completionPercentage || displayData.completionScore}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Content Layout (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Timeline & Tasks) - Takes 2/3 space */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Crop Journey Timeline Component */}
           <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2"><Sprout className="w-5 h-5 text-primary"/> Crop Journey Timeline</h3>
               <span className="text-xs bg-surface-container px-3 py-1 rounded-full font-bold text-on-surface-variant">
                 {displayTasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length} of {displayTasks.length} Completed
               </span>
             </div>
             
             <div className="relative border-l-2 border-outline-variant ml-4 space-y-8 pb-4">
               
               {/* Stage: Pre-Sowing */}
               <div className="relative">
                 <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                 </div>
                 <div className="pl-6">
                   <h4 className="font-bold text-sm text-on-surface mb-1">Pre-Sowing & Preparation</h4>
                   <p className="text-xs text-on-surface-variant mb-3">Soil testing, land preparation, and seed selection.</p>
                   
                   <div className="space-y-2">
                     {displayTasks.filter(t => ['Planning', 'Preparation', 'Soil'].includes(t.stage) || ['Planning', 'Land Preparation'].includes(t.category)).map(task => {
                       const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                       return (
                         <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                           {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-outline-variant mt-0.5 shrink-0" />}
                           <div>
                             <div className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-on-surface'}`}>{task.title}</div>
                             <div className="text-[10px] text-on-surface-variant mt-0.5">{task.date || 'Completed'}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

               {/* Stage: Sowing */}
               <div className="relative">
                 <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${currentCropData.currentStage >= 1 || isHistorical ? 'bg-emerald-500' : 'bg-outline-variant'}`}>
                    {(currentCropData.currentStage >= 1 || isHistorical) && <CheckCircle2 className="w-3 h-3 text-white" />}
                 </div>
                 <div className="pl-6">
                   <h4 className="font-bold text-sm text-on-surface mb-1">Sowing & Germination</h4>
                   <p className="text-xs text-on-surface-variant mb-3">Seed treatment, sowing, and early emergence.</p>
                   
                   {/* Integrated Weather Event Example */}
                   {isHistorical && (
                     <div className="mb-3 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3">
                       <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
                       <div>
                         <div className="text-xs font-bold text-blue-900">Heavy Rainfall Delayed Sowing</div>
                         <div className="text-[10px] text-blue-700 mt-0.5">Sowing was delayed by 3 days due to continuous rain (13-15 June).</div>
                       </div>
                     </div>
                   )}

                   <div className="space-y-2">
                     {displayTasks.filter(t => ['Sowing', 'Seed Treatment', 'Transplanting'].includes(t.stage) || t.category === 'Sowing').map(task => {
                       const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                       return (
                         <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                           {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-outline-variant mt-0.5 shrink-0" />}
                           <div>
                             <div className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-on-surface'}`}>{task.title}</div>
                             <div className="text-[10px] text-on-surface-variant mt-0.5">{task.date || (isDone ? 'Completed' : 'Pending')}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

               {/* Stage: Vegetative */}
               <div className="relative">
                 <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${currentCropData.currentStage >= 3 || isHistorical ? 'bg-emerald-500' : (currentCropData.currentStage === 2 ? 'bg-primary animate-pulse' : 'bg-outline-variant')}`}>
                    {(currentCropData.currentStage > 2 || isHistorical) && <CheckCircle2 className="w-3 h-3 text-white" />}
                 </div>
                 <div className="pl-6">
                   <h4 className="font-bold text-sm text-on-surface mb-1">Vegetative Growth</h4>
                   <p className="text-xs text-on-surface-variant mb-3">Irrigation, fertilization, and weed management.</p>
                   
                   <div className="space-y-2">
                     {displayTasks.filter(t => ['Vegetative Growth', 'Fertilization', 'Irrigation', 'Weed Management'].includes(t.stage) || ['Fertilization', 'Irrigation'].includes(t.category)).map(task => {
                       const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                       return (
                         <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                           {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-outline-variant mt-0.5 shrink-0" />}
                           <div>
                             <div className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-on-surface'}`}>{task.title}</div>
                             <div className="text-[10px] text-on-surface-variant mt-0.5">{task.date || (isDone ? 'Completed' : task.time || 'Pending')}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

               {/* Stage: Reproductive */}
               <div className="relative">
                 <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${currentCropData.currentStage >= 5 || isHistorical ? 'bg-emerald-500' : (currentCropData.currentStage === 4 ? 'bg-primary animate-pulse' : 'bg-outline-variant')}`}>
                    {(currentCropData.currentStage > 4 || isHistorical) && <CheckCircle2 className="w-3 h-3 text-white" />}
                 </div>
                 <div className="pl-6">
                   <h4 className="font-bold text-sm text-on-surface mb-1">Reproductive & Grain Formation</h4>
                   <p className="text-xs text-on-surface-variant mb-3">Flowering, pest monitoring, and disease management.</p>
                   
                   {/* Integrated Disease Diagnosis Example */}
                   {isHistorical && (
                     <div className="mb-3 bg-red-50/50 border border-red-100 rounded-xl p-3 flex gap-3">
                       <Bug className="w-4 h-4 text-red-600 shrink-0" />
                       <div>
                         <div className="text-xs font-bold text-red-900">Diagnosis: Stem Borer Detected</div>
                         <div className="text-[10px] text-red-700 mt-0.5">Detected on Aug 12. Applied recommended Cartap Hydrochloride on Aug 15. Plant recovered.</div>
                       </div>
                     </div>
                   )}

                   <div className="space-y-2">
                     {displayTasks.filter(t => ['Flowering', 'Pest Management', 'Disease Management'].includes(t.stage) || t.category === 'Crop Protection').map(task => {
                       const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                       return (
                         <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                           {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-outline-variant mt-0.5 shrink-0" />}
                           <div>
                             <div className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-on-surface'}`}>{task.title}</div>
                             <div className="text-[10px] text-on-surface-variant mt-0.5">{task.date || (isDone ? 'Completed' : 'Pending')}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

               {/* Stage: Harvest */}
               <div className="relative">
                 <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${isHistorical ? 'bg-emerald-500' : 'bg-outline-variant'}`}>
                    {isHistorical && <CheckCircle2 className="w-3 h-3 text-white" />}
                 </div>
                 <div className="pl-6">
                   <h4 className="font-bold text-sm text-on-surface mb-1">Harvest & Selling</h4>
                   <p className="text-xs text-on-surface-variant mb-3">Harvesting, storage, and market intelligence.</p>
                   
                   <div className="space-y-2">
                     {displayTasks.filter(t => ['Harvest', 'Selling'].includes(t.stage) || t.category === 'Harvest').map(task => {
                       const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                       return (
                         <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                           {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-outline-variant mt-0.5 shrink-0" />}
                           <div>
                             <div className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-on-surface'}`}>{task.title}</div>
                             <div className="text-[10px] text-on-surface-variant mt-0.5">{task.date || (isDone ? 'Completed' : 'Expected: ' + currentCropData.harvestDate)}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                   
                   {/* Integrated Market Journey Example */}
                   {isHistorical && (
                     <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                       <h5 className="font-bold text-xs text-amber-900 flex items-center gap-2 mb-2">
                         <TrendingUp className="w-4 h-4" /> Market Intelligence Journey
                       </h5>
                       <div className="grid grid-cols-2 gap-2 mt-2">
                         <div className="bg-white rounded-lg p-2 border border-amber-100/50">
                           <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Mandi Selected</div>
                           <div className="text-xs font-bold text-on-surface">Karnal APMC</div>
                         </div>
                         <div className="bg-white rounded-lg p-2 border border-amber-100/50">
                           <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Selling Price</div>
                           <div className="text-xs font-bold text-emerald-700">₹3,035 / Quintal</div>
                         </div>
                         <div className="bg-white rounded-lg p-2 border border-amber-100/50 col-span-2">
                           <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Outcome</div>
                           <div className="text-xs font-bold text-on-surface">Sold 28 Quintals on Nov 10 for ₹85,000 (Above MSP)</div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>

             </div>
           </div>

           {/* Task History Component */}
           <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5 text-primary"/> Activity History Log</h3>
               <div className="flex gap-2">
                 <select className="text-xs border border-outline-variant rounded-lg px-2 py-1 bg-surface-container-lowest font-medium focus:outline-none focus:border-primary">
                   <option>All Stages</option>
                   <option>Vegetative</option>
                   <option>Reproductive</option>
                 </select>
               </div>
             </div>
             
             <div className="space-y-3">
               {displayTasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length > 0 ? (
                 displayTasks
                  .filter(t => t.status === 'completed' || completedTasks.includes(t.id))
                  .map((task, i) => (
                   <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:border-primary/30 transition-colors">
                     <div className="flex gap-3 items-start">
                       <div className="bg-emerald-100 p-2 rounded-lg mt-0.5">
                         <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                       </div>
                       <div>
                         <h4 className="font-bold text-sm text-on-surface">{task.title}</h4>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-md text-on-surface-variant">
                             {task.stage || task.category || 'General'}
                           </span>
                           <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {task.date || 'Today'}
                           </span>
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                         Completed on time
                       </span>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/40">
                   <div className="text-sm text-on-surface-variant font-medium">No completed activities yet.</div>
                   <div className="text-xs text-on-surface-variant/70 mt-1">Complete tasks in Today's Work to build your history.</div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Right Column (Upcoming, Analytics, Notes) - Takes 1/3 space */}
        <div className="space-y-6">
          
          {/* Milestone Tracker */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-card shadow-sm border border-amber-100 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-amber-900"><AlertCircle className="w-5 h-5"/> Key Milestones</h3>
            <div className="grid grid-cols-2 gap-3">
              {(isHistorical ? MOCK_PREVIOUS_CROP.milestones : [
                { title: 'Sowing Completed', date: currentCropData.sowingDate, icon: 'Sprout', done: true },
                { title: 'First Irrigation', date: 'Upcoming', icon: 'Droplets', done: false },
                { title: 'Flowering Stage', date: 'Expected: Sep 10', icon: 'Sun', done: false },
                { title: 'Harvest Ready', date: `Expected: ${currentCropData.harvestDate}`, icon: 'CheckCircle2', done: false }
              ]).map((m, i) => (
                <div key={i} className={`p-3 rounded-xl border ${m.done || isHistorical ? 'bg-white border-amber-200' : 'bg-white/50 border-outline-variant/40 opacity-70'}`}>
                  <div className={`p-1.5 w-fit rounded-lg mb-2 ${m.done || isHistorical ? 'bg-amber-100 text-amber-600' : 'bg-surface-container text-on-surface-variant'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className={`text-[11px] font-bold ${m.done || isHistorical ? 'text-amber-900' : 'text-on-surface'}`}>{m.title}</div>
                  <div className="text-[9px] font-medium text-on-surface-variant mt-0.5">{m.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Journey */}
          {!isHistorical && (
            <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary"/> Upcoming Roadmap</h3>
              <div className="space-y-3">
                {displayTasks.filter(t => t.status !== 'completed' && !completedTasks.includes(t.id)).slice(0, 3).map((task, i) => (
                  <div key={i} className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
                     <h4 className="font-bold text-xs text-on-surface">{task.title}</h4>
                     <div className="flex gap-2 mt-2">
                       <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">Expected: {task.date || 'Next Week'}</span>
                       {task.duration && <span className="text-[9px] font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-md">{task.duration}</span>}
                     </div>
                  </div>
                ))}
                <button className="w-full py-2 mt-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-1">
                  View Full Season Calendar <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Analytics / Stats Summary */}
          <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary"/> Journey Analytics</h3>
            
            {isHistorical ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 text-center">
                    <div className="text-2xl font-black text-on-surface">{MOCK_PREVIOUS_CROP.analytics.totalTasks}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">Total Activities</div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 text-center">
                    <div className="text-2xl font-black text-emerald-600">{MOCK_PREVIOUS_CROP.analytics.completedOnTime}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">On-Time</div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 text-center">
                    <div className="text-2xl font-black text-blue-600">{MOCK_PREVIOUS_CROP.analytics.irrigations}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">Irrigations</div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 text-center">
                    <div className="text-2xl font-black text-red-600">{MOCK_PREVIOUS_CROP.analytics.diseases}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">Disease Alerts</div>
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-emerald-800">Final Yield</div>
                    <div className="text-sm font-black text-emerald-900">{MOCK_PREVIOUS_CROP.yield}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-emerald-800">Est. Profit</div>
                    <div className="text-sm font-black text-emerald-900">{MOCK_PREVIOUS_CROP.profit}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="text-xs font-bold text-on-surface-variant">Activities Completed</span>
                  <span className="text-sm font-black text-on-surface">
                    {displayTasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length} / {displayTasks.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="text-xs font-bold text-on-surface-variant">On-Time Rate</span>
                  <span className="text-sm font-black text-emerald-600">100%</span>
                </div>
                <p className="text-[10px] text-center text-on-surface-variant font-medium">Analytics will build automatically as you log progress.</p>
              </div>
            )}
          </div>

          {/* Season Comparison (Only if historical is selected) */}
          {isHistorical && (
            <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-16 h-16"/></div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ArrowRight className="w-5 h-5 text-primary"/> Season Comparison</h3>
              <p className="text-xs text-on-surface-variant mb-4">Comparing {MOCK_PREVIOUS_CROP.cropName} (Previous) vs {currentCropData.cropName} (Current)</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="w-1/3 font-bold text-on-surface-variant">Duration</span>
                  <span className="w-1/3 text-center font-bold text-on-surface">{MOCK_PREVIOUS_CROP.totalDays} Days</span>
                  <span className="w-1/3 text-right font-bold text-primary">Est. 120 Days</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-outline-variant/30 pt-2">
                  <span className="w-1/3 font-bold text-on-surface-variant">Irrigations</span>
                  <span className="w-1/3 text-center font-bold text-on-surface">{MOCK_PREVIOUS_CROP.analytics.irrigations}</span>
                  <span className="w-1/3 text-right font-bold text-primary">Planned: 4</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Media */}
          <div className="bg-white rounded-card shadow-sm border border-outline-variant/60 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Farmer Notes & Diary</h3>
            
            {isHistorical ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl relative">
                  <div className="text-[10px] text-amber-800 font-bold mb-1">July 15, 2025</div>
                  <p className="text-xs text-amber-900">Used a different weedicide (Bispyribac Sodium) this time. Results seem better than last year. Will monitor.</p>
                </div>
                <div className="p-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl relative">
                  <div className="text-[10px] text-on-surface-variant font-bold mb-1">Sept 10, 2025</div>
                  <p className="text-xs text-on-surface">Flowering started beautifully. Weather has been highly supportive this week.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea 
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-on-surface-variant/50"
                  rows="3"
                  placeholder="Record an observation, yield estimate, or note for future reference..."
                ></textarea>
                <div className="flex justify-between items-center">
                  <button className="text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </button>
                  <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors">
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
