import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

export default function RescheduleTaskModal({ task, onClose, onSave }) {
  // Default to today if task has no date, else use task's date
  const defaultDate = task?.date || new Date().toISOString().split('T')[0];
  const defaultTime = task?.time && task.time !== 'Anytime' ? task.time : '09:00 AM';

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(task.id, date, time);
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/50 w-full max-w-md overflow-hidden flex flex-col animate-scale-in">
        <div className="flex justify-between items-center p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Reschedule Task
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{task.category}</div>
            <div className="font-bold text-on-surface">{task.title}</div>
            {task.why && <div className="text-xs text-on-surface-variant mt-2 line-clamp-2">{task.why}</div>}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> New Date
              </label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> New Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="Anytime">Anytime</option>
                <option value="06:00 AM">06:00 AM</option>
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary hover:bg-secondary text-white shadow-sm transition-all"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
