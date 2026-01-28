
import React from 'react';
import { ReportStep } from '../types';

interface StepProgressBarProps {
  currentStep: ReportStep;
}

const steps = [
  ReportStep.BASICS,
  ReportStep.RESOURCES,
  ReportStep.DATA_UPLOAD,
  ReportStep.ASSETS,
  ReportStep.PREVIEW,
  ReportStep.FINAL
];

const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2 z-0" />
        {steps.map((step, idx) => {
          const isActive = step === currentStep;
          const isCompleted = steps.indexOf(currentStep) > idx;
          
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isActive ? 'bg-[#e64d25] text-white scale-125 ring-4 ring-orange-100' : 
                isCompleted ? 'bg-[#283b82] text-white' : 'bg-white text-gray-400 border-2 border-gray-300'
              }`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`mt-2 text-xs font-medium hidden md:block ${isActive ? 'text-[#e64d25]' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
