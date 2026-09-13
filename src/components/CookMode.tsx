import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { StepItem } from '../types';

interface Props {
  steps: StepItem[];
  title: string;
  onClose: () => void;
}

const CookMode: React.FC<Props> = ({ steps, title, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
        // Finished
        onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Modo Cocina</span>
            <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-lg">{title}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5">
        <div 
            className="bg-primary h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center p-8 max-w-3xl mx-auto text-center">
         <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary font-bold text-2xl mb-8 shadow-sm">
            {steps[currentStep].step_number}
         </span>
         
         <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-snug md:leading-tight animate-in slide-in-from-bottom-4 fade-in duration-500 key={currentStep}">
            {steps[currentStep].instruction}
         </h3>

         {/* Future implementation: Image for this step would go here */}
         <div className="mt-8 text-gray-400 dark:text-gray-500 text-sm italic">
            Visual Tag: {steps[currentStep].visual_tag}
         </div>
      </div>

      {/* Controls */}
      <div className="p-6 md:p-10 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center gap-4">
        <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-lg hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
        >
            <ChevronLeft className="w-6 h-6" />
            Anterior
        </button>

        <button
            onClick={handleNext}
            className={`flex-1 py-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                ${currentStep === steps.length - 1 ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-orange-600'}
            `}
        >
            {currentStep === steps.length - 1 ? (
                <>Terminar <Check className="w-6 h-6" /></>
            ) : (
                <>Siguiente <ChevronRight className="w-6 h-6" /></>
            )}
        </button>
      </div>
    </div>
  );
};

export default CookMode;