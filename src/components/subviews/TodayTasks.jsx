import React, { useState } from 'react';
import { CheckSquare, Square, Clock, AlertCircle, ShieldAlert, CheckCircle2, CloudRain, Sun, Calendar } from 'lucide-react';
import { t } from '../../utils/translations';
import { getTaskWeatherCheck } from '../../utils/weatherService';

export default function TodayTasks({
  farms = [],
  selectedFarmIndex = 0,
  getFarmDashboardData,
  completedTasks,
  setCompletedTasks,
  weatherData,
  language
}) {
  const activeFarm = farms[selectedFarmIndex];
  const dashboardData = activeFarm ? getFarmDashboardData(activeFarm) : null;
  const rawTasks = dashboardData?.tasks || [];

  // Dynamically adjust tasks based on weather forecast
  const tasks = rawTasks.map(task => {
    const weatherCheck = getTaskWeatherCheck(weatherData, task.category);
    if (weatherCheck.adjusted) {
      return {
        ...task,
        weatherAdjusted: true,
        weatherBadge: weatherCheck.badge,
        why: `${weatherCheck.reason} Original task context: ${task.why}`,
        originalStatus: task.status
      };
    }
    return task;
  });

  const handleToggleTask = (taskId) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      
      {/* Header */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
            📋 Automated Daily Work Plan
          </span>
          <h2 className="font-display font-extrabold text-xl text-on-surface mt-1.5 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" /> Today's Work Tasks
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            AI-generated tasks adjusted dynamically based on active crop stage, soil metrics, and IMD weather forecasts.
          </p>
        </div>
      </div>

      {/* Weather Alert Context Info */}
      {weatherData && (
        <div className="bg-white border border-outline-variant/60 p-4 rounded-card flex gap-3 items-start shadow-2xs">
          <div className="bg-blue-50 p-2 rounded-lg shrink-0">
            <CloudRain className="w-5 h-5 text-blue-600 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-on-surface block">
              Weather Integration Active
            </span>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Current Condition: <strong className="text-on-surface">{weatherData.current?.condition} ({weatherData.current?.temp}°C)</strong>. 
              Today's tasks have been cross-checked with the weather: {weatherData.rainfall?.insight || dashboardData?.weatherInterpretation}
            </p>
          </div>
        </div>
      )}

      {/* Task Checklist list */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-card p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h4 className="font-bold text-on-surface text-sm">All Tasks Cleared!</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">No pending tasks for today. Check back tomorrow morning for your next AI-generated planner.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const isCompleted = completedTasks.includes(task.id);
              const isHigh = task.priority === 'High';
              
              return (
                <div 
                  key={task.id} 
                  className={`bg-white border rounded-card p-5 shadow-2xs transition-all flex items-start gap-4 ${
                    isCompleted ? 'opacity-65 border-outline-variant' : 
                    task.weatherAdjusted ? 'border-amber-200 bg-amber-50/10' :
                    isHigh ? 'border-primary/20 hover:border-primary' : 'border-outline-variant/60'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-1 text-primary shrink-0 hover:scale-105 transition-all"
                  >
                    {isCompleted 
                      ? <CheckCircle2 className="w-5 h-5 text-primary fill-primary text-white" /> 
                      : <Square className="w-5 h-5 text-outline" />
                    }
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`font-extrabold text-sm text-on-surface leading-tight ${isCompleted ? 'line-through text-on-surface-variant' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center mt-1.5 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                          <span className="bg-surface-container px-2 py-0.5 rounded-md text-on-surface">{task.category}</span>
                          <span className={`px-2 py-0.5 rounded-md ${isHigh ? 'bg-red-50 text-red-700' : 'bg-slate-100'}`}>{task.priority} Priority</span>
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {task.time} ({task.duration})</span>
                        </div>
                      </div>
                      
                      {task.weatherAdjusted && (
                        <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                          {task.weatherBadge || 'Weather Adjusted'}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] leading-relaxed text-on-surface-variant font-semibold bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 space-y-1">
                      <div>
                        <strong className="text-on-surface">Why:</strong> {task.why}
                      </div>
                      {!isCompleted && task.benefit && (
                        <div className="pt-1.5 border-t border-outline-variant/30 mt-1.5">
                          <strong className="text-primary">Expected Benefit:</strong> {task.benefit}
                        </div>
                      )}
                    </div>

                    {!isCompleted && task.resources && (
                      <div className="text-[10px] text-on-surface-variant font-bold">
                        🎒 Required Inputs: <span className="font-semibold text-on-surface">{task.resources}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
