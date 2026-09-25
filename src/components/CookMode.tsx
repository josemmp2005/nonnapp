/**
 * Modo cocina: pantalla completa que muestra los pasos de la receta uno a uno
 * para seguirlos mientras se cocina.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { StepItem } from '../types';

interface Props {
  steps: StepItem[];
  title: string;
  onClose: () => void;
}

const CookMode: React.FC<Props> = ({ steps, title, onClose }) => {
  const { t } = useTranslation();
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
    <div className="fixed inset-0 z-50 bg-white dark:bg-cream-dark flex flex-col animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-ink/10 dark:border-ink-light/10">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('app.cookMode.badge')}</span>
            <h2 className="font-bold text-ink dark:text-[#F8F2E6] line-clamp-1 text-lg">{title}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label={t('app.cookMode.exitAria')}
          className="p-2 bg-primary/10 rounded-full hover:bg-ink/10 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-6 h-6 text-[#5C4E3A] dark:text-[#A89C86]" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-primary/10 h-1.5">
        <div 
            className="bg-primary h-1.5 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center p-8 max-w-3xl mx-auto text-center">
         <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary font-bold text-2xl mb-8 shadow-sm">
            {steps[currentStep].step_number}
         </span>
         
         <h3
            key={currentStep}
            className="text-2xl md:text-4xl font-bold text-ink dark:text-[#F8F2E6] leading-snug md:leading-tight animate-in slide-in-from-bottom-4 fade-in duration-500"
         >
            {steps[currentStep].instruction}
         </h3>

         {/* Future implementation: Image for this step would go here */}
      </div>

      {/* Controls */}
      <div className="p-6 md:p-10 border-t border-ink/10 dark:border-ink-light/10 bg-cream dark:bg-cream-dark flex justify-between items-center gap-4">
        <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-6 rounded-2xl bg-white dark:bg-surface-dark border-2 border-ink/15 dark:border-ink-light/15 text-[#5C4E3A] dark:text-[#A89C86] font-bold text-lg hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2"
        >
            <ChevronLeft className="w-6 h-6" />
            {t('app.cookMode.prev')}
        </button>

        <button
            onClick={handleNext}
            className={`flex-1 py-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-[0.98] flex items-center justify-center gap-2
                ${currentStep === steps.length - 1 ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-orange-600'}
            `}
        >
            {currentStep === steps.length - 1 ? (
                <>{t('app.cookMode.finish')} <Check className="w-6 h-6" /></>
            ) : (
                <>{t('app.cookMode.next')} <ChevronRight className="w-6 h-6" /></>
            )}
        </button>
      </div>
    </div>
  );
};

export default CookMode;