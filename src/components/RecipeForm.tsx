/**
 * Formulario de generación de recetas: modo texto o despensa, raciones,
 * tiempo, robot de cocina y utensilios.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wand2, Search, Refrigerator, Clock, Lock, CookingPot } from 'lucide-react';
import type { GenerationParams } from '../types';

interface Props {
  isLoading: boolean;
  onSubmit: (params: GenerationParams) => void;
  hasAdvancedPantry?: boolean;
}

const RecipeForm: React.FC<Props> = ({ isLoading, onSubmit, hasAdvancedPantry = true }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'text' | 'pantry'>('text');
  const [input, setInput] = useState('');
  const [servings, setServings] = useState(2);
  const [timeLimit, setTimeLimit] = useState('unlimited');
  const [hasKitchenRobot, setHasKitchenRobot] = useState(false);

  const handleModeChange = (newMode: 'text' | 'pantry') => {
    if (newMode === 'pantry' && !hasAdvancedPantry) {
      return; // No permitir cambio si no tiene acceso
    }
    setMode(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSubmit({
      mode,
      prompt: input,
      servings,
      timeLimit,
      ingredients: mode === 'pantry' ? input : undefined,
      hasKitchenRobot
    });
  };

  return (
    <div className="bg-white dark:bg-[#18130D] rounded-3xl shadow-xl shadow-primary/5 border border-white dark:border-[#F5E6CD]/10 overflow-hidden transition-colors duration-300">
      <div className="flex border-b border-[#241B10]/10 dark:border-[#F5E6CD]/10">
        <button 
          onClick={() => handleModeChange('text')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'bg-primary/5 dark:bg-primary/10 text-primary border-b-2 border-primary' : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'}`}
        >
          <Wand2 className="w-4 h-4" />
          {t('app.recipeForm.tabCreative')}
        </button>
        <button
          onClick={() => handleModeChange('pantry')}
          disabled={!hasAdvancedPantry}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
            !hasAdvancedPantry
              ? 'opacity-50 cursor-not-allowed text-[#6B5D48] dark:text-[#9A8D74]'
              : mode === 'pantry'
                ? 'bg-primary/5 dark:bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'
          }`}
          title={!hasAdvancedPantry ? t('app.recipeForm.pantryLockedTitle') : ''}
        >
          <Refrigerator className="w-4 h-4" />
          {t('app.recipeForm.tabPantry')}
          {!hasAdvancedPantry && (
            <Lock className="w-3 h-3 absolute top-2 right-2 text-amber-500" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#3A2E1D] dark:text-[#D4D4D8] block">
            {mode === 'text' ? t('app.recipeForm.labelTextMode') : t('app.recipeForm.labelPantryMode')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'text' ? t('app.recipeForm.placeholderText') : t('app.recipeForm.placeholderPantry')}
              className="w-full pl-12 pr-4 py-4 bg-[#FCF6EC] dark:bg-[#221B12] border-[#241B10]/15 dark:border-[#F5E6CD]/15 border rounded-xl focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none text-lg text-[#241B10] dark:text-[#F8F2E6] placeholder-[#8C7C63] dark:placeholder-[#6E6350]"
              required
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5D48] dark:text-[#9A8D74]">
               {mode === 'text' ? <Search className="w-5 h-5" /> : <Refrigerator className="w-5 h-5" />}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
           <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-[#6B5D48] dark:text-[#9A8D74] uppercase mb-2 block">{t('app.recipeForm.servingsLabel')}</label>
              <div className="flex items-center gap-4 bg-[#FCF6EC] dark:bg-[#221B12] rounded-lg p-2 border border-[#241B10]/15 dark:border-[#F5E6CD]/15">
                 <button 
                  type="button" 
                  onClick={() => setServings(Math.max(1, servings - 1))} 
                  className="w-8 h-8 rounded bg-white dark:bg-[#2A2114] shadow-sm flex items-center justify-center text-[#5C4E3A] dark:text-[#D4D4D8] border border-[#241B10]/10 dark:border-[#F5E6CD]/20 hover:text-primary dark:hover:text-primary hover:border-primary transition-colors"
                >
                  -
                </button>
                 <span className="font-bold text-[#3A2E1D] dark:text-[#F0E4CE] w-4 text-center">{servings}</span>
                 <button 
                  type="button" 
                  onClick={() => setServings(servings + 1)} 
                  className="w-8 h-8 rounded bg-white dark:bg-[#2A2114] shadow-sm flex items-center justify-center text-[#5C4E3A] dark:text-[#D4D4D8] border border-[#241B10]/10 dark:border-[#F5E6CD]/20 hover:text-primary dark:hover:text-primary hover:border-primary transition-colors"
                >
                  +
                </button>
              </div>
           </div>
           <div className="flex-1 min-w-[150px]">
               <label className="text-xs font-semibold text-[#6B5D48] dark:text-[#9A8D74] uppercase mb-2 block">{t('app.recipeForm.timeLabel')}</label>
               <div className="relative">
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full appearance-none bg-[#FCF6EC] dark:bg-[#221B12] rounded-lg p-3 border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#3A2E1D] dark:text-[#D4D4D8] outline-none focus:ring-2 focus:ring-primary focus:border-transparent pl-10 cursor-pointer"
                  >
                    <option value="unlimited">{t('app.recipeForm.timeUnlimited')}</option>
                    <option value="15 minutes">{t('app.recipeForm.time15')}</option>
                    <option value="30 minutes">{t('app.recipeForm.time30')}</option>
                    <option value="45 minutes">{t('app.recipeForm.time45')}</option>
                    <option value="1 hour">{t('app.recipeForm.time60')}</option>
                    <option value="2 hours">{t('app.recipeForm.time120')}</option>
                  </select>
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D48] dark:text-[#9A8D74] pointer-events-none" />
               </div>
           </div>
           <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-[#6B5D48] dark:text-[#9A8D74] uppercase mb-2 flex items-center gap-1.5">
                <CookingPot className="w-3.5 h-3.5" />
                {t('app.recipeForm.robotLabel')}
              </label>
              <div className="flex bg-[#FCF6EC] dark:bg-[#221B12] rounded-lg p-1 border border-[#241B10]/15 dark:border-[#F5E6CD]/15">
                <button
                  type="button"
                  onClick={() => setHasKitchenRobot(true)}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                    hasKitchenRobot
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'
                  }`}
                >
                  {t('app.recipeForm.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setHasKitchenRobot(false)}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                    !hasKitchenRobot
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'
                  }`}
                >
                  {t('app.recipeForm.no')}
                </button>
              </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !input}
          className="w-full py-4 bg-primary hover:bg-orange-600 disabled:bg-[#241B10]/15 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transform transition active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Wand2 className="w-5 h-5" />
          {t('app.recipeForm.submit')}
        </button>

        <p className="text-center text-xs text-[#6B5D48] dark:text-[#9A8D74]">
          {t('app.recipeForm.disclaimer')}
        </p>
      </form>
    </div>
  );
};

export default RecipeForm;