import React from 'react';
import type { PlannerTask } from '../models/diagnosis';

interface TimelinePanelProps {
  tasks: PlannerTask[];
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({ tasks }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6">
      <h3 className="font-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Recovery Tracker</h3>
      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-surface-variant before:to-surface-variant">
        
        {tasks.map((task, index) => {
          const isFirst = index === 0;
          const isCompleted = false; // We don't have task status in this payload yet
          
          let icon = "calendar_month";
          if (task.category === "Action") icon = "science";
          if (task.category === "Monitoring") icon = "visibility";
          if (task.category === "Preparation") icon = "inventory_2";

          return (
            <div key={index} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isFirst ? 'is-active' : ''}`}>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white ${isFirst || isCompleted ? 'bg-primary text-white' : 'bg-surface-variant text-outline'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-1.6rem]`}>
                <span className="material-symbols-outlined text-[14px]">
                  {isCompleted ? "check" : icon}
                </span>
              </div>
              <div className="w-full">
                <h4 className={`font-button ${isFirst || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {task.task}
                </h4>
                <p className={`text-sm ${isFirst || isCompleted ? 'text-on-surface-variant' : 'text-outline-variant'}`}>
                  {task.recommended_date}
                </p>
              </div>
            </div>
          );
        })}

        {/* Final Recovery Step */}
        {tasks.length > 0 && (
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-surface-variant text-outline shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-1.6rem]">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
            </div>
            <div className="w-full">
              <h4 className="font-button text-on-surface-variant">Case Closed</h4>
              <p className="text-sm text-outline-variant">Recovery Verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePanel;
