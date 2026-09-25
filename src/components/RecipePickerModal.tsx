/**
 * Modal para elegir una receta del historial y asignarla a un hueco del
 * planificador semanal.
 */

import React, { useEffect, useState } from 'react';
import { X, Search, ChefHat, Loader2 } from 'lucide-react';
import type { RecipeDB } from '../types';
import { fetchUserHistory } from '../services/data';
import { Modal } from './ui/Modal';
import RecipeImage from './ui/RecipeImage';

interface Props {
  onSelect: (recipe: RecipeDB) => void;
  onClose: () => void;
}

const RecipePickerModal: React.FC<Props> = ({ onSelect, onClose }) => {
  const [recipes, setRecipes] = useState<RecipeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchUserHistory();
        if (!cancelled) setRecipes(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = recipes.filter((r) =>
    (r.recipe_metadata?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      onClose={onClose}
      labelledBy="recipe-picker-title"
      panelClassName="bg-white dark:bg-cream-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
    >
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white flex-shrink-0">
          <h3 id="recipe-picker-title" className="text-lg font-bold">Elige una receta</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-ink/10 dark:border-ink-light/10 flex-shrink-0">
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en tu historial..."
              aria-label="Buscar receta"
              className="w-full pl-9 pr-3 py-2 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-ink dark:text-[#F8F2E6]"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 aria-hidden="true" className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 px-4">
              <ChefHat aria-hidden="true" className="w-8 h-8 text-muted dark:text-muted-dark mx-auto mb-2" />
              <p className="text-sm text-muted dark:text-muted-dark">
                {recipes.length === 0 ? 'Todavía no tienes recetas guardadas.' : 'No hay recetas que coincidan con la búsqueda.'}
              </p>
            </div>
          ) : (
            filtered.map((recipe) => (
              <button
                type="button"
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {recipe.main_image_url ? (
                    <RecipeImage src={recipe.main_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ChefHat aria-hidden="true" className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-ink dark:text-[#F8F2E6] truncate">
                    {recipe.recipe_metadata?.title || 'Receta sin título'}
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark">{recipe.recipe_metadata?.cooking_time || 'N/A'}</p>
                </div>
              </button>
            ))
          )}
        </div>
    </Modal>
  );
};

export default RecipePickerModal;
