/**
 * Modal con la vista previa de una receta del historial, sin salir de la
 * lista.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Clock, Flame, Users, ChefHat, ArrowRight } from 'lucide-react';
import type { RecipeDB } from '../types';
import { getFullRecipeById } from '../services/data';
import { useEscapeKey } from '../hooks/useEscapeKey';
import RecipeImage from './ui/RecipeImage';

interface Props {
  recipeId: number | string;
  onClose: () => void;
}

const RecipePreviewModal: React.FC<Props> = ({ recipeId, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await getFullRecipeById(recipeId);
    if (data) setRecipe(data);
    else setError(true);
    setLoading(false);
  }, [recipeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      const data = await getFullRecipeById(recipeId);
      if (cancelled) return;
      if (data) setRecipe(data);
      else setError(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  useEscapeKey(onClose);

  const meta = recipe?.recipe_metadata;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={meta?.title || t('app.recipePreview.defaultAriaTitle')}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130F0A] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="animate-pulse">
            <div className="aspect-video bg-[#241B10]/10 dark:bg-[#221B12]" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-2/3" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-16 bg-[#241B10]/10 dark:bg-[#221B12] rounded-lg" />
                ))}
              </div>
              <div className="h-3 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-full" />
              <div className="h-3 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-4/5" />
            </div>
          </div>
        ) : error || !recipe ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
            <p className="text-[#241B10] dark:text-[#F8F2E6] font-bold">{t('app.recipePreview.loadError')}</p>
            <div className="flex items-center gap-4">
              <button onClick={load} className="text-primary font-medium hover:underline">
                {t('app.common.retry')}
              </button>
              <button onClick={onClose} className="text-[#6B5D48] dark:text-[#9A8D74] font-medium hover:underline">
                {t('app.common.close')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-video bg-primary/10 flex-shrink-0">
              {recipe.main_image_url ? (
                <RecipeImage
                  src={recipe.main_image_url}
                  alt={meta?.title || t('app.common.untitledRecipe')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div aria-hidden="true" className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 text-orange-200 dark:text-orange-900/50">
                  <span className="text-5xl">🍳</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                aria-label={t('app.recipePreview.closeAria')}
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="absolute bottom-3 left-4 right-4 text-white text-xl font-bold leading-tight line-clamp-2">
                {meta?.title || t('app.common.untitledRecipe')}
              </h2>
            </div>

            <div className="p-5 overflow-y-auto flex-grow">
              <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <Clock aria-hidden="true" className="w-3.5 h-3.5" /> {meta?.cooking_time || t('app.common.na')}
                </span>
                <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-2.5 py-1.5 rounded-lg">
                  <Flame aria-hidden="true" className="w-3.5 h-3.5" /> {t('app.recipePreview.kcal', { count: meta?.calories || 0 })}
                </span>
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <Users aria-hidden="true" className="w-3.5 h-3.5" /> {t('app.recipePreview.servings', { count: meta?.servings || 2 })}
                </span>
                <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-2.5 py-1.5 rounded-lg">
                  <ChefHat aria-hidden="true" className="w-3.5 h-3.5" /> {meta?.difficulty || 'Media'}
                </span>
              </div>

              <p className="text-sm text-[#5C4E3A] dark:text-[#A89C86] leading-relaxed mb-5">
                {meta?.description || t('app.recipePreview.noDescription')}
              </p>

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6B5D48] dark:text-[#9A8D74] mb-2">
                    {t('app.recipePreview.ingredientsHeading', { count: recipe.ingredients.length })}
                  </h3>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-[#3A2E1D] dark:text-[#D4D4D8]">
                    {recipe.ingredients.slice(0, 8).map((ing, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        <span className="truncate">
                          {ing.item}
                          {ing.quantity ? ` — ${ing.quantity}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {recipe.ingredients.length > 8 && (
                    <p className="text-xs text-[#6B5D48] dark:text-[#9A8D74] mt-2">
                      {t('app.recipePreview.moreIngredients', { count: recipe.ingredients.length - 8 })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 flex-shrink-0">
              <button
                onClick={() => navigate(`/app/recipe/${recipeId}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors active:scale-[0.98]"
              >
                {t('app.recipePreview.viewFullRecipe')}
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipePreviewModal;
