/**
 * Página `/app/history`: todas las recetas generadas por el usuario, con vista
 * previa.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Flame, ChevronRight, Calendar, Filter, ArrowDownUp, Lock, Crown } from 'lucide-react';
import type { RecipeDB } from '../types';
import { fetchUserHistory } from '../services/data';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import RecipePreviewModal from './RecipePreviewModal';
import { Reveal } from './ui/Reveal';
import type { AuthSession } from '../services/auth';
import RecipeImage from './ui/RecipeImage';

interface Props {
  session: AuthSession | null;
}

const HistoryPage: React.FC<Props> = ({ session }) => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<RecipeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const { limits } = useSubscription();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchUserHistory();
        setRecipes(data);
      } catch {
        showToast(t('app.historyPage.loadError'), 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const filteredRecipes = (recipes || [])
    .filter(r => {
      const matchesSearch = 
        r.recipe_metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.recipe_metadata?.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesDifficulty = 
        difficulty === 'all' || 
        r.recipe_metadata?.difficulty?.toLowerCase() === difficulty.toLowerCase();

      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Limit history for free users (Nipote)
  const FREE_HISTORY_LIMIT = 3;
  const displayRecipes = limits.hasFullHistory 
    ? filteredRecipes 
    : filteredRecipes.slice(0, FREE_HISTORY_LIMIT);
  const hasMoreRecipes = !limits.hasFullHistory && filteredRecipes.length > FREE_HISTORY_LIMIT;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink dark:text-[#F8F2E6]">{t('app.historyPage.title')}</h1>
        <p className="text-muted dark:text-muted-dark mt-1">{t('app.historyPage.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <div className="relative flex-grow">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark w-5 h-5" />
          <input
            type="text"
            aria-label={t('app.historyPage.searchAria')}
            placeholder={t('app.historyPage.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-ink/15 dark:border-ink-light/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition text-ink dark:text-[#F8F2E6]"
          />
        </div>

        <div className="w-full md:w-48 relative">
           <select
             value={difficulty}
             onChange={(e) => setDifficulty(e.target.value)}
             aria-label={t('app.historyPage.difficultyFilterAria')}
             className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white dark:bg-surface-dark border border-ink/15 dark:border-ink-light/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-body dark:text-body-dark cursor-pointer"
           >
             <option value="all">{t('app.historyPage.difficultyAll')}</option>
             <option value="Fácil">{t('app.historyPage.difficultyEasy')}</option>
             <option value="Media">{t('app.historyPage.difficultyMedium')}</option>
             <option value="Difícil">{t('app.historyPage.difficultyHard')}</option>
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted dark:text-muted-dark">
             <Filter aria-hidden="true" className="w-4 h-4" />
           </div>
        </div>

        <div className="w-full md:w-48 relative">
           <select
             value={sortOrder}
             onChange={(e) => setSortOrder(e.target.value)}
             aria-label={t('app.historyPage.sortAria')}
             className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white dark:bg-surface-dark border border-ink/15 dark:border-ink-light/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-body dark:text-body-dark cursor-pointer"
           >
             <option value="newest">{t('app.historyPage.sortNewest')}</option>
             <option value="oldest">{t('app.historyPage.sortOldest')}</option>
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted dark:text-muted-dark">
             <ArrowDownUp aria-hidden="true" className="w-4 h-4" />
           </div>
        </div>

      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm overflow-hidden">
              <div className="aspect-video bg-ink/10 dark:bg-[#221B12]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-ink/10 dark:bg-[#221B12] rounded w-3/4" />
                <div className="h-3 bg-ink/10 dark:bg-[#221B12] rounded w-1/2" />
                <div className="h-3 bg-ink/10 dark:bg-[#221B12] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-ink/15 dark:border-ink-light/15">
           <div aria-hidden="true" className="text-6xl mb-4">🍲</div>
           <h3 className="text-xl font-bold text-ink dark:text-[#F8F2E6]">{t('app.historyPage.emptyTitle')}</h3>
           <p className="text-muted dark:text-muted-dark mt-2 mb-6">{t('app.historyPage.emptySubtitle')}</p>
           <button
             onClick={() => navigate('/app')}
             className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-colors"
           >
             {t('app.historyPage.createNew')}
           </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRecipes.map((recipe, i) => (
            <Reveal key={recipe.id} delayMs={Math.min(i, 5) * 60}>
            <button
              type="button"
              onClick={() => recipe.id != null && setPreviewId(recipe.id)}
              className="w-full text-left bg-white dark:bg-surface-dark rounded-2xl border border-ink/10 dark:border-ink-light/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-video bg-primary/10 relative overflow-hidden">
                {recipe.main_image_url ? (
                  <RecipeImage 
                    src={recipe.main_image_url} 
                    alt={recipe.recipe_metadata?.title || t('app.common.untitledRecipe')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                   <div aria-hidden="true" className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10 text-orange-200 dark:text-orange-900/50">
                      <span className="text-4xl">🍳</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-xs font-medium">
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Clock aria-hidden="true" className="w-3 h-3" /> {recipe.recipe_metadata?.cooking_time || t('app.common.na')}
                  </span>
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Flame aria-hidden="true" className="w-3 h-3 text-orange-400" /> {recipe.recipe_metadata?.calories || 0} kcal
                  </span>
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-3">
                   <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6] leading-tight group-hover:text-primary transition-colors line-clamp-2">
                     {recipe.recipe_metadata?.title || t('app.common.untitledRecipe')}
                   </h3>
                   <div className="flex items-center gap-2 mt-2 text-xs text-muted dark:text-muted-dark">
                     <Calendar aria-hidden="true" className="w-3 h-3" />
                     {new Date(recipe.created_at || '').toLocaleDateString()}
                     <span className="w-1 h-1 bg-ink/20 dark:bg-[#2A2114] rounded-full"></span>
                     <span className={`capitalize font-medium ${
                       recipe.recipe_metadata?.difficulty === 'Fácil' ? 'text-green-600 dark:text-green-400' :
                       recipe.recipe_metadata?.difficulty === 'Difícil' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                     }`}>
                       {recipe.recipe_metadata?.difficulty || t('app.historyPage.difficultyMedium')}
                     </span>
                   </div>
                </div>

                <p className="text-muted dark:text-muted-dark text-sm line-clamp-3 mb-4 flex-grow">
                  {recipe.recipe_metadata?.description || t('app.recipePreview.noDescription')}
                </p>

                <div className="pt-4 border-t border-ink/5 dark:border-ink-light/10 flex items-center justify-between text-sm font-medium text-primary">
                  <span>{t('app.historyPage.previewLabel')}</span>
                  <ChevronRight aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
            </Reveal>
          ))}
        </div>

        {/* Upgrade Banner for Free Users */}
        {hasMoreRecipes && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                <Lock aria-hidden="true" className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink dark:text-[#F8F2E6] mb-2 flex items-center justify-center gap-2">
              <Crown aria-hidden="true" className="w-6 h-6 text-amber-500" />
              {t('app.historyPage.upgradeTitle')}
            </h3>
            <p className="text-[#5C4E3A] dark:text-[#A89C86] mb-4 max-w-2xl mx-auto">
              {t('app.historyPage.upgradeDesc', { count: filteredRecipes.length - FREE_HISTORY_LIMIT })}
            </p>
            <button
              onClick={() => navigate('/app/profile')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition hover:scale-105 active:scale-95 shadow-lg"
            >
              {t('app.historyPage.viewPlans')}
            </button>
          </div>
        )}
      </>
      )}

      {previewId != null && (
        <RecipePreviewModal recipeId={previewId} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
};

export default HistoryPage;