import React, { useState } from 'react';
import { CheckSquare, Square, Clock, AlertCircle, ShieldAlert, CheckCircle2, CloudRain, Sun, Calendar, Plus, X, Bell } from 'lucide-react';
import { t } from '../../utils/translations';
import { getTaskWeatherCheck } from '../../utils/weatherService';

export default function TodayTasks({
  dashboardData,
  completedTasks,
  setCompletedTasks,
  activeDialogTask,
  setActiveDialogTask,
  setShowRescheduleModal,
  weatherData,
  language,
  farms,
  selectedFarmIndex,
  setFarms
}) {
  const rawTasks = dashboardData?.tasks || [];
  
  const [personalTasks, setPersonalTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskTime, setNewTaskTime] = useState('Anytime');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState('PERSONAL');
  const [emailReminder, setEmailReminder] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('today'); // 'today' | 'upcoming' | 'previous'

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Dynamically adjust tasks based on weather forecast
  const generatedTasks = rawTasks.map(task => {
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

  const allTasks = [...generatedTasks, ...personalTasks];
  
  // Filter tasks based on selected tab/type
  let tasks = [];
  if (filterType === 'today') {
    tasks = allTasks.filter(t => {
      const isScheduledToday = t.date === selectedDate;
      const isOverdue = t.date < selectedDate && t.status !== 'completed';
      return isScheduledToday || isOverdue;
    });
  } else if (filterType === 'upcoming') {
    tasks = allTasks.filter(t => t.date > selectedDate);
  } else if (filterType === 'previous') {
    tasks = allTasks.filter(t => t.date < selectedDate || t.status === 'completed');
  }

  const handleToggleTask = (taskId) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  const handleAddPersonalTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `personal_task_${Date.now()}`,
      title: newTaskTitle,
      category: newTaskCategory,
      priority: newTaskPriority,
      time: newTaskTime,
      date: newTaskDate,
      duration: 'Flexible',
      why: 'User-added custom task',
      benefit: 'Personal productivity',
      isPersonal: true,
      emailReminder: emailReminder,
      status: 'pending'
    };

    if (farms && setFarms && farms[selectedFarmIndex]?.crop?.confirmedPlan) {
      const updatedFarms = [...farms];
      const activeFarm = updatedFarms[selectedFarmIndex];
      activeFarm.crop.confirmedPlan.tasks = [
        ...(activeFarm.crop.confirmedPlan.tasks || []),
        newTask
      ];
      setFarms(updatedFarms);
    } else {
      setPersonalTasks([...personalTasks, newTask]);
    }

    setNewTaskTitle('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
    setNewTaskTime('Anytime');
    setNewTaskPriority('Medium');
    setNewTaskCategory('PERSONAL');
    setEmailReminder(false);
    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up font-sans relative">
      
      {/* Header */}
      <div className="bg-white border border-outline-variant/60 rounded-card p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
            📋 Automated Daily Work Plan
          </span>
          <h2 className="font-display font-extrabold text-xl text-on-surface mt-1.5 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" /> Work Tasks
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={handlePrevDay} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant font-bold text-xs border border-outline-variant/50 px-2 flex items-center gap-1">← Prev</button>
            <span className="text-xs font-bold text-primary">{selectedDate === new Date().toISOString().split('T')[0] ? "Today" : selectedDate}</span>
            <button onClick={handleNextDay} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant font-bold text-xs border border-outline-variant/50 px-2 flex items-center gap-1">Next →</button>
          </div>
        </div>
        <button 
          onClick={() => setShowAddTaskModal(true)}
          className="shrink-0 bg-primary hover:bg-secondary text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Personal Task
        </button>
      </div>

      {/* Task Filters */}
      <div className="flex bg-white border border-outline-variant/60 rounded-xl p-1 shadow-2xs">
        <button
          onClick={() => setFilterType('today')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterType === 'today' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Today's Work & Overdue
        </button>
        <button
          onClick={() => setFilterType('upcoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterType === 'upcoming' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Upcoming Work
        </button>
        <button
          onClick={() => setFilterType('previous')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterType === 'previous' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Previous & Completed
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/50 w-full max-w-md overflow-hidden flex flex-col animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" /> New Personal Task
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPersonalTask} className="p-5 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Task Description</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="E.g., Call dealer for seeds"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</label>
                  <input type="date" required value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Time</label>
                  <select value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="Anytime">Anytime</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Priority</label>
                  <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tag/Category</label>
                  <input type="text" placeholder="E.g., Personal" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-on-surface">Email Reminder</div>
                    <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">Receive a notification an hour before</div>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setEmailReminder(!emailReminder)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${emailReminder ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute ${emailReminder ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <h4 className="font-bold text-on-surface text-sm">
              {filterType === 'today' ? 'All Tasks Cleared!' : filterType === 'upcoming' ? 'No Upcoming Work' : 'No Previous Records'}
            </h4>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              {filterType === 'today' 
                ? 'No pending tasks scheduled for this day or overdue. Check upcoming work or enjoy your rest!' 
                : filterType === 'upcoming' 
                  ? 'No future crop lifecycle events scheduled yet. Generate a new plan to add activities.' 
                  : 'No completed or historical activities exist on this farm yet.'}
            </p>
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
                    task.isPersonal ? 'border-blue-200 bg-blue-50/10' :
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
                          <span className={`px-2 py-0.5 rounded-md ${task.isPersonal ? 'bg-blue-100 text-blue-800' : 'bg-surface-container text-on-surface'}`}>{task.category}</span>
                          {!task.isPersonal && <span className={`px-2 py-0.5 rounded-md ${isHigh ? 'bg-red-50 text-red-700' : 'bg-slate-100'}`}>{task.priority} Priority</span>}
                          {task.time && <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {task.time} ({task.duration})</span>}
                          {task.isPersonal && task.emailReminder && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md"><Bell className="w-2.5 h-2.5" /> Reminder Set</span>
                          )}
                          {isCompleted ? (
                            <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">✓ Completed</span>
                          ) : task.date && task.date < new Date().toISOString().split('T')[0] ? (
                            <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md animate-pulse">⚠️ Overdue ({task.date})</span>
                          ) : task.date ? (
                            <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md">Scheduled: {task.date}</span>
                          ) : null}
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

                  {!isCompleted && (
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setActiveDialogTask(task);
                          setShowRescheduleModal(true);
                        }}
                        className="border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant font-bold px-3 py-1.5 rounded-xl text-xs"
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
