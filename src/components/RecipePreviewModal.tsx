import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Flame, Users, ChefHat, Loader2, ArrowRight } from 'lucide-react';
import type { RecipeDB } from '../types';
import { getFullRecipeById } from '../services/data';

interface Props {
  recipeId: number | string;
  onClose: () => void;
}

const RecipePreviewModal: React.FC<Props> = ({ recipeId, onClose }) => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      const data = await getFullRecipeById(recipeId);
      if (cancelled) return;
      if (data) setRecipe(data);
      else setError(true);
      setLoading(false);
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const meta = recipe?.recipe_metadata;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130F0A] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-[#8C7C63] dark:text-[#7C715E]">Cargando receta...</p>
          </div>
        ) : error || !recipe ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
            <p className="text-[#241B10] dark:text-[#F8F2E6] font-bold">No se pudo cargar la receta.</p>
            <button onClick={onClose} className="text-primary font-medium hover:underline">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="relative aspect-video bg-primary/10 flex-shrink-0">
              {recipe.main_image_url ? (
                <img
                  src={recipe.main_image_url}
                  alt={meta?.title || 'Receta'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 text-orange-200 dark:text-orange-900/50">
                  <span className="text-5xl">🍳</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                aria-label="Cerrar vista previa"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="absolute bottom-3 left-4 right-4 text-white text-xl font-bold leading-tight line-clamp-2">
                {meta?.title || 'Receta sin título'}
              </h2>
            </div>

            <div className="p-5 overflow-y-auto flex-grow">
              <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> {meta?.cooking_time || 'N/A'}
                </span>
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <Flame className="w-3.5 h-3.5" /> {meta?.calories || 0} kcal
                </span>
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <Users className="w-3.5 h-3.5" /> {meta?.servings || 2} raciones
                </span>
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
                  <ChefHat className="w-3.5 h-3.5" /> {meta?.difficulty || 'Media'}
                </span>
              </div>

              <p className="text-sm text-[#5C4E3A] dark:text-[#A89C86] leading-relaxed mb-5">
                {meta?.description || 'Sin descripción disponible.'}
              </p>

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#8C7C63] dark:text-[#6E6350] mb-2">
                    Ingredientes ({recipe.ingredients.length})
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
                    <p className="text-xs text-[#8C7C63] dark:text-[#6E6350] mt-2">
                      +{recipe.ingredients.length - 8} más...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 flex-shrink-0">
              <button
                onClick={() => navigate(`/app/recipe/${recipeId}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
              >
                Ver receta completa
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipePreviewModal;
