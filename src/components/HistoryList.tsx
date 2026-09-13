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
        <h3 className="text-lg font-bold text-[#3A2E1D] dark:text-[#D4D4D8] mb-4 px-1">Recientes</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#18130D] rounded-xl p-3 shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10">
              <div className="aspect-video bg-[#241B10]/10 dark:bg-[#221B12] rounded-lg mb-3 animate-pulse"></div>
              <div className="h-4 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-3 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-[#241B10]/10 dark:bg-[#221B12] rounded w-4 animate-pulse"></div>
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
      <h3 className="text-lg font-bold text-[#3A2E1D] dark:text-[#D4D4D8] mb-4 px-1">Recientes</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            onClick={() => onSelect(recipe)}
            className="bg-white dark:bg-[#18130D] rounded-xl p-3 shadow-sm border border-[#241B10]/10 dark:border-[#F5E6CD]/10 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="aspect-video bg-primary/10 rounded-lg mb-3 overflow-hidden relative">
               {recipe.main_image_url ? (
                 <img 
                   src={recipe.main_image_url} 
                   alt={recipe.recipe_metadata?.title || 'Receta'} 
                   loading="lazy"
                   className="w-full h-full object-cover transition-opacity duration-500 opacity-0 animate-in fade-in"
                   onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[#241B10]/20 dark:text-[#8C7C63] bg-[#FCF6EC] dark:bg-[#221B12]">🍲</div>
               )}
            </div>
            <h4 className="font-semibold text-[#241B10] dark:text-[#F0E4CE] text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.recipe_metadata?.title || 'Receta sin título'}
            </h4>
            <div className="flex items-center justify-between mt-2 text-xs text-[#8C7C63] dark:text-[#7C715E]">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.recipe_metadata?.cooking_time || 'N/A'}
              </div>
              <ChevronRight className="w-4 h-4 text-[#241B10]/20 dark:text-[#5C4E3A] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;