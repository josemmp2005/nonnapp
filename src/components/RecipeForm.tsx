import React, { useState } from 'react';
import { Wand2, Search, Refrigerator, Clock, Lock } from 'lucide-react';
import type { GenerationParams } from '../types';

interface Props {
  isLoading: boolean;
  onSubmit: (params: GenerationParams) => void;
  hasAdvancedPantry?: boolean;
}

const RecipeForm: React.FC<Props> = ({ isLoading, onSubmit, hasAdvancedPantry = true }) => {
  const [mode, setMode] = useState<'text' | 'pantry'>('text');
  const [input, setInput] = useState('');
  const [servings, setServings] = useState(2);
  const [timeLimit, setTimeLimit] = useState('unlimited');

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
      ingredients: mode === 'pantry' ? input : undefined
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-primary/5 border border-white dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => handleModeChange('text')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'bg-primary/5 dark:bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          <Wand2 className="w-4 h-4" />
          Modo Creativo
        </button>
        <button 
          onClick={() => handleModeChange('pantry')}
          disabled={!hasAdvancedPantry}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
            !hasAdvancedPantry 
              ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' 
              : mode === 'pantry' 
                ? 'bg-primary/5 dark:bg-primary/10 text-primary border-b-2 border-primary' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          title={!hasAdvancedPantry ? 'Disponible en plan La Mamma' : ''}
        >
          <Refrigerator className="w-4 h-4" />
          Modo Despensa
          {!hasAdvancedPantry && (
            <Lock className="w-3 h-3 absolute top-2 right-2 text-amber-500" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
            {mode === 'text' ? '¿Qué te apetece comer hoy?' : 'Ingredientes disponibles (separados por comas)'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'text' ? "Ej: Una cena romántica vegana..." : "Ej: Huevos, tomate, arroz, pollo..."}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 border rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
               {mode === 'text' ? <Search className="w-5 h-5" /> : <Refrigerator className="w-5 h-5" />}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
           <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Comensales</label>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
                 <button 
                  type="button" 
                  onClick={() => setServings(Math.max(1, servings - 1))} 
                  className="w-8 h-8 rounded bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-200 border border-gray-100 dark:border-gray-500 hover:text-primary dark:hover:text-primary hover:border-primary transition-colors"
                >
                  -
                </button>
                 <span className="font-bold text-gray-800 dark:text-gray-100 w-4 text-center">{servings}</span>
                 <button 
                  type="button" 
                  onClick={() => setServings(servings + 1)} 
                  className="w-8 h-8 rounded bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-200 border border-gray-100 dark:border-gray-500 hover:text-primary dark:hover:text-primary hover:border-primary transition-colors"
                >
                  +
                </button>
              </div>
           </div>
           <div className="flex-1 min-w-[150px]">
               <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Tiempo Máximo</label>
               <div className="relative">
                  <select 
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary focus:border-transparent pl-10 cursor-pointer"
                  >
                    <option value="unlimited">Sin prisa (Automático)</option>
                    <option value="15 minutes">15 min (Rápido)</option>
                    <option value="30 minutes">30 min</option>
                    <option value="45 minutes">45 min</option>
                    <option value="1 hour">1 hora</option>
                    <option value="2 hours">Lento (+1 hora)</option>
                  </select>
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
               </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !input}
          className="w-full py-4 bg-primary hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transform transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Wand2 className="w-5 h-5" />
          Generar Receta Mágica
        </button>
        
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Utilizamos Gemini Flash 2.5 + Nano Banana para la mejor experiencia.
        </p>
      </form>
    </div>
  );
};

export default RecipeForm;