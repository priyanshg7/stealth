import React, { useState, useEffect } from 'react';

const steps = [
  "Uploading image...",
  "Running AI diagnosis...",
  "Checking agricultural knowledge...",
  "Calculating treatment...",
  "Preparing recovery plan...",
  "Almost done..."
];

export const LoadingOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 1500); // cycle through steps every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary-container rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        <span className="material-symbols-outlined text-[24px] text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" data-icon="neurology">neurology</span>
      </div>
      
      <h4 className="font-headline-md text-[20px] text-on-surface mb-2">{steps[currentStep]}</h4>
      
      {/* Progress Dots */}
      <div className="flex gap-2 mt-4">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentStep 
                ? 'w-6 bg-primary' 
                : i < currentStep 
                  ? 'w-2 bg-primary-fixed-dim' 
                  : 'w-2 bg-surface-variant'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
