import React, { useState } from 'react';
import type { PlannerTask } from '../models/diagnosis';
import { api } from '../services/api';

interface PlannerPanelProps {
  tasks: PlannerTask[];
}

const PlannerPanel: React.FC<PlannerPanelProps> = ({ tasks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToPlanner = async () => {
    setIsAdding(true);
    try {
      await api.post('/planner/tasks', { tasks });
      setAdded(true);
      // Simulating a toast notification
      alert("Task Added Successfully");
    } catch (error) {
      console.error("Failed to add to planner:", error);
      alert("Failed to add tasks to planner.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 w-full">
        <h3 className="font-headline-md text-on-surface mb-2">Schedule Treatment</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg mb-4">
          {tasks.map((task, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-1">
                <span className={`material-symbols-outlined text-sm ${task.priority.toLowerCase() === 'high' ? 'text-error' : 'text-primary'}`}>
                  {task.category.toLowerCase() === 'action' ? 'check_circle' : 'schedule'}
                </span> 
                {task.task} ({task.recommended_date})
              </div>
              {index < tasks.length - 1 && <div className="w-1 h-1 bg-outline rounded-full hidden sm:block"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <button 
        className={`w-full md:w-auto h-[56px] px-8 rounded-full font-button transition-colors shadow-md whitespace-nowrap flex items-center justify-center gap-2 ${
          added 
            ? 'bg-surface-container-highest text-primary border border-primary' 
            : 'bg-primary text-on-primary hover:bg-primary-container'
        }`}
        onClick={handleAddToPlanner}
        disabled={isAdding || added}
      >
        <span className="material-symbols-outlined">
          {added ? 'check_circle' : 'event_available'}
        </span>
        {isAdding ? 'Adding...' : added ? 'Added' : 'Add to My Tasks'}
      </button>
    </div>
  );
};

export default PlannerPanel;
