/**
 * Widget de La Mesa de la Nonna: tarjetas con los estilos de cocina
 * predefinidos. Se usa en el Dashboard y en `/app/chef`, y se bloquea si el
 * plan no lo incluye.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, BookOpen, ArrowRight, Heart, Flower2, Lock, Crown } from 'lucide-react';
import type { RecipeDB } from '../types';
import { useToast } from '../context/ToastContext';
import { CHEF_STYLES, FEATURED_RECIPES } from '../data/chefTableContent';
import RecipeImage from './ui/RecipeImage';

interface Props {
  variant?: 'dashboard' | 'full';
  isLocked?: boolean;
}

const ChefTableWidget: React.FC<Props> = ({ variant = 'dashboard', isLocked = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [chefTab, setChefTab] = useState<'styles' | 'featured'>('styles');
  // En el Dashboard es solo un adelanto (3 nonnas) — la lista completa vive
  // en /app/chef (variant="full"), que es donde tiene sentido explorarlas todas.
  const visibleStyles = variant === 'full' ? CHEF_STYLES : CHEF_STYLES.slice(0, 3);

  const triggerChefSpecial = (preset: typeof CHEF_STYLES[0]) => {
    if (isLocked) {
      showToast(t('app.chefTable.lockedStyles'), 'info');
      return;
    }
    const prompt = `Actúa como ${preset.name} (${preset.subtitle}). Crea un plato espectacular y único (${preset.dish} o similar) siguiendo estrictamente este estilo: ${preset.style}. Sorpréndeme como si fuera tu nieto favorito.`;
    navigate('/app/generate', {
        state: {
            autoTrigger: true,
            prompt,
            mode: 'text',
            timeLimit: 'unlimited'
        }
    });
  };

  const openFeaturedRecipe = (recipe: RecipeDB) => {
    if (isLocked) {
      showToast(t('app.chefTable.lockedFeatured'), 'info');
      return;
    }
    navigate(`/app/recipe/featured-${recipe.id}`, {
        state: { recipeData: recipe }
    });
  };

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-1 gap-4">
            <div className="flex items-center gap-2">
                <Heart className={`text-primary ${variant === 'full' ? 'w-8 h-8' : 'w-6 h-6'}`} />
                <h2 className={`${variant === 'full' ? 'text-3xl' : 'text-2xl'} font-bold text-[#241B10] dark:text-[#F8F2E6]`}>
                    La Mesa de la Nonna
                </h2>
            </div>

            <div className="flex p-1 bg-primary/10 rounded-xl">
                <button
                onClick={() => setChefTab('styles')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${chefTab === 'styles' ? 'bg-white dark:bg-[#221B12] shadow-sm text-primary' : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'}`}
                >
                {t('app.chefTable.tabStyles')}
                </button>
                <button
                onClick={() => setChefTab('featured')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${chefTab === 'featured' ? 'bg-white dark:bg-[#221B12] shadow-sm text-primary' : 'text-[#6B5D48] dark:text-[#9A8D74] hover:text-[#3A2E1D] dark:hover:text-[#D4D4D8]'}`}
                >
                {t('app.chefTable.tabFeatured')}
                </button>
            </div>
        </div>

        {chefTab === 'styles' ? (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {visibleStyles.map((preset) => (
                <button
                    key={preset.id}
                    onClick={() => triggerChefSpecial(preset)}
                    className={`group relative h-72 rounded-2xl overflow-hidden text-left shadow-md hover:shadow-xl transition ${isLocked ? 'cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    disabled={isLocked}
                >
                    <img
                    src={preset.image}
                    alt={preset.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'filter grayscale opacity-60' : 'group-hover:scale-110'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-xl">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-bold text-sm flex items-center gap-1 justify-center">
                            <Crown className="w-4 h-4 text-amber-300" />
                            {t('app.chefTable.premium')}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br ${preset.color} text-white shadow-lg`}>
                        <Flower2 className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">{preset.name}</h3>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1 block">{preset.subtitle}</span>
                        <p className="text-[#E7DCC5] text-xs line-clamp-2 mb-2 leading-relaxed">{preset.description}</p>
                        <div className="flex items-center gap-1 text-white/80 text-xs font-medium border-t border-white/20 pt-2 mt-2">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span>{t('app.chefTable.cookingStyle', { name: preset.name.split(' ')[1] })}</span>
                        </div>
                    </div>
                </button>
                ))}
            </div>
        ) : (
            <div className={`grid gap-6 animate-in fade-in slide-in-from-right-2 ${variant === 'full' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                {FEATURED_RECIPES.map((recipe) => (
                <button
                    type="button"
                    key={recipe.id}
                    onClick={() => openFeaturedRecipe(recipe)}
                    className={`w-full text-left bg-white dark:bg-[#18130D] rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm hover:shadow-xl transition group overflow-hidden flex flex-col relative ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="h-48 relative overflow-hidden">
                        <RecipeImage
                            src={recipe.main_image_url}
                            alt={recipe.recipe_metadata.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'filter grayscale opacity-60' : 'group-hover:scale-105'}`}
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#241B10] dark:text-[#F8F2E6] shadow-sm flex items-center gap-1">
                            <BookOpen aria-hidden="true" className="w-3 h-3 text-primary" /> {t('app.chefTable.recipeBadge')}
                        </div>

                        {/* Lock Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                              <Lock aria-hidden="true" className="w-7 h-7 text-white" />
                            </div>
                          </div>
                        )}
                    </div>
                    <div className={`p-5 flex-grow flex flex-col ${isLocked ? 'opacity-60' : ''}`}>
                        <div className="mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md mb-2 inline-block">
                                {recipe.recipe_metadata.difficulty} • {recipe.recipe_metadata.cooking_time}
                            </span>
                            <h3 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] leading-tight group-hover:text-primary transition-colors">
                                {recipe.recipe_metadata.title}
                            </h3>
                        </div>
                        <p className="text-[#6B5D48] dark:text-[#9A8D74] text-sm line-clamp-2 mb-4">
                            {recipe.recipe_metadata.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 flex items-center justify-between text-sm font-medium">
                            <span className="text-[#6B5D48] text-xs">
                                {t('app.chefTable.ingredientsCount', { count: recipe.ingredients.length })}
                            </span>
                            <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-[gap]">
                                {t('app.common.viewRecipe')} <ArrowRight aria-hidden="true" className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default ChefTableWidget;
