import React from 'react';
import { CalendarClock, PlusCircle, CheckCircle2 } from 'lucide-react';

export function ActionTimeline({ timeline, addToCalendar }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b border-surface-container pb-4">
        <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          <span>7-Day Recovery Action Roadmap</span>
        </h3>
      </div>

      <div className="space-y-4">
        {timeline.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/40 hover:bg-surface-container transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {step.day || `Day ${idx + 1}`}
              </div>
              <div>
                <h4 className="font-bold text-xs text-on-surface">{step.action || step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{step.details || step.description}</p>
              </div>
            </div>

            {addToCalendar && (
              <button
                type="button"
                onClick={() => addToCalendar(step.action || step.title)}
                className="bg-white hover:bg-primary hover:text-white text-primary border border-primary/30 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
