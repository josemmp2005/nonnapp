/**
 * Lista de tarjetas de recetas (con estado de carga), reutilizada en el
 * Dashboard y en el historial.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RecipeDB } from '../types';
import { Clock, ChevronRight, ChefHat } from 'lucide-react';
import RecipeImage from './ui/RecipeImage';

interface Props {
  recipes: RecipeDB[];
  isLoading?: boolean;
  onSelect: (recipe: RecipeDB) => void;
}

const HistoryList: React.FC<Props> = ({ recipes, isLoading = false, onSelect }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="mt-12" id="history-section">
        <h3 className="text-lg font-bold text-body dark:text-body-dark mb-4 px-1">{t('app.historyList.title')}</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-dark rounded-xl p-3 shadow-sm border border-ink/10 dark:border-ink-light/10">
              <div className="aspect-video bg-ink/10 dark:bg-[#221B12] rounded-lg mb-3 animate-pulse"></div>
              <div className="h-4 bg-ink/10 dark:bg-[#221B12] rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-3 bg-ink/10 dark:bg-[#221B12] rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-ink/10 dark:bg-[#221B12] rounded w-4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="mt-12" id="history-section">
        <h3 className="text-lg font-bold text-body dark:text-body-dark mb-4 px-1">{t('app.historyList.title')}</h3>
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-cream dark:bg-surface-dark/50 border border-dashed border-ink/15 dark:border-ink-light/15 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#221B12] shadow-sm flex items-center justify-center mb-3">
            <ChefHat aria-hidden="true" className="w-6 h-6 text-muted" />
          </div>
          <p className="font-semibold text-body dark:text-body-dark">{t('app.historyList.emptyTitle')}</p>
          <p className="text-sm text-muted dark:text-muted-dark mt-1">{t('app.historyList.emptySubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12" id="history-section">
      <h3 className="text-lg font-bold text-body dark:text-body-dark mb-4 px-1">{t('app.historyList.title')}</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {recipes.map((recipe) => (
          <button
            type="button"
            key={recipe.id}
            onClick={() => onSelect(recipe)}
            className="w-full text-left bg-white dark:bg-surface-dark rounded-xl p-3 shadow-sm border border-ink/10 dark:border-ink-light/10 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition cursor-pointer group"
          >
            <div className="aspect-video bg-primary/10 rounded-lg mb-3 overflow-hidden relative">
               {recipe.main_image_url ? (
                 <RecipeImage
                   src={recipe.main_image_url}
                   alt={recipe.recipe_metadata?.title || t('app.common.untitledRecipe')}
                   loading="lazy"
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div aria-hidden="true" className="w-full h-full flex items-center justify-center text-ink/20 dark:text-muted bg-cream dark:bg-[#221B12]">🍲</div>
               )}
            </div>
            <h4 className="font-semibold text-ink dark:text-[#F0E4CE] text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.recipe_metadata?.title || t('app.common.untitledRecipe')}
            </h4>
            <div className="flex items-center justify-between mt-2 text-xs text-muted dark:text-muted-dark">
              <div className="flex items-center gap-1">
                <Clock aria-hidden="true" className="w-3 h-3" />
                {recipe.recipe_metadata?.cooking_time || t('app.common.na')}
              </div>
              <ChevronRight aria-hidden="true" className="w-4 h-4 text-ink/20 dark:text-[#5C4E3A] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;