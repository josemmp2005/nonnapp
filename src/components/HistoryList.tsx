import React from 'react';
import type { RecipeDB } from '../types';
import { Clock, ChevronRight } from 'lucide-react';

interface Props {
  recipes: RecipeDB[];
  isLoading?: boolean;
  onSelect: (recipe: RecipeDB) => void;
}

const HistoryList: React.FC<Props> = ({ recipes, isLoading = false, onSelect }) => {
  
  if (isLoading) {
    return (
      <div className="mt-12" id="history-section">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-1">Recientes</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="mt-12" id="history-section">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-1">Recientes</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            onClick={() => onSelect(recipe)}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden relative">
               {recipe.main_image_url ? (
                 <img 
                   src={recipe.main_image_url} 
                   alt={recipe.recipe_metadata?.title || 'Receta'} 
                   loading="lazy"
                   className="w-full h-full object-cover transition-opacity duration-500 opacity-0 animate-in fade-in"
                   onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500 bg-gray-50 dark:bg-gray-700">🍲</div>
               )}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.recipe_metadata?.title || 'Receta sin título'}
            </h4>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.recipe_metadata?.cooking_time || 'N/A'}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;