/**
 * Página `/app/history` (Recetario): las recetas del usuario en dos pestañas
 * — Generadas por IA y Propias (recetario propio, escritas a mano) — con
 * vista previa.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Flame, ChevronRight, Calendar, Filter, ArrowDownUp, Lock, Crown, Plus, Heart, Tag as TagIcon, X } from 'lucide-react';
import type { RecipeDB } from '../types';
import { fetchUserHistory, setRecipeFavorite, fetchUserTags } from '../services/data';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import RecipePreviewModal from './RecipePreviewModal';
import { Reveal } from './ui/Reveal';
import { Button } from './ui/Button';
import { FavoriteButton } from './ui/FavoriteButton';
import { Modal } from './ui/Modal';
import type { AuthSession } from '../services/auth';
import RecipeImage from './ui/RecipeImage';

interface Props {
  session: AuthSession | null;
}

type RecipeTab = 'generated' | 'own';

const HistoryPage: React.FC<Props> = ({ session }) => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<RecipeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const { limits } = useSubscription();
  const { showToast } = useToast();

  const [tab, setTab] = useState<RecipeTab>('generated');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // En escritorio los filtros van siempre visibles; en móvil se meten en una
  // hoja aparte para no empujar las recetas fuera de la pantalla — este botón
  // la abre. El número en la insignia cuenta los que no son el valor por
  // defecto (dificultad "todas" y orden "recientes" no cuentan).
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = (difficulty !== 'all' ? 1 : 0) + (onlyFavorites ? 1 : 0) + selectedTags.length;
  const clearFilters = () => {
    setDifficulty('all');
    setOnlyFavorites(false);
    setSelectedTags([]);
  };

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
    fetchUserTags().then(setAllTags).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleToggleFavorite = async (recipe: RecipeDB) => {
    if (recipe.id == null) return;
    const next = !recipe.is_favorite;
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: next } : r)));
    try {
      await setRecipeFavorite(recipe.id, next);
    } catch {
      setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: !next } : r)));
      showToast(t('app.recipeDetail.favoriteError'), 'error');
    }
  };

  const toggleTagFilter = (tag: string) =>
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  // `is_ai_generated` puede venir undefined en datos muy antiguos; se trata
  // como generada (es lo que valía por defecto en BBDD antes del recetario propio).
  const tabRecipes = (recipes || []).filter((r) => (tab === 'own' ? r.is_ai_generated === false : r.is_ai_generated !== false));

  const filteredRecipes = tabRecipes
    .filter(r => {
      const matchesSearch =
        r.recipe_metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.recipe_metadata?.description?.toLowerCase().includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === 'all' ||
        r.recipe_metadata?.difficulty?.toLowerCase() === difficulty.toLowerCase();

      const matchesFavorite = !onlyFavorites || r.is_favorite === true;

      // OR: basta con que tenga alguna de las etiquetas marcadas — un AND
      // estricto (tenerlas todas) se siente demasiado restrictivo con pocas
      // recetas etiquetadas.
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => r.tags?.includes(tag));

      return matchesSearch && matchesDifficulty && matchesFavorite && matchesTags;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // El límite de historial de Il Nipote es sobre las recetas de IA.
  const FREE_HISTORY_LIMIT = 3;
  const limitApplies = tab === 'generated' && !limits.hasFullHistory;
  const displayRecipes = limitApplies ? filteredRecipes.slice(0, FREE_HISTORY_LIMIT) : filteredRecipes;
  const hasMoreRecipes = limitApplies && filteredRecipes.length > FREE_HISTORY_LIMIT;

  // Recetario propio: escalón de planes (Il Nipote bloqueado del todo, La
  // Mamma hasta `ownLimit`, La Nonna sin límite) — el mismo tope que aplica el
  // servidor (`server/src/lib/recipes.ts`), aquí solo para pintar la interfaz.
  const ownCount = (recipes || []).filter((r) => r.is_ai_generated === false).length;
  const ownLimit = limits.maxOwnRecipes;
  const ownLocked = ownLimit === 0;
  const ownCapped = ownLimit !== Infinity && ownCount >= ownLimit;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-[#F8F2E6]">{t('app.historyPage.title')}</h1>
          <p className="text-muted dark:text-muted-dark mt-1">{t('app.historyPage.subtitle')}</p>
        </div>
        {tab === 'own' && !ownLocked && !ownCapped && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Button type="button" onClick={() => navigate('/app/recipes/new')}>
              <Plus className="w-4 h-4" /> {t('app.historyPage.addRecipe')}
            </Button>
            {ownLimit !== Infinity && (
              <span className="text-xs text-muted dark:text-muted-dark">{t('app.historyPage.ownCount', { count: ownCount, limit: ownLimit })}</span>
            )}
          </div>
        )}
      </div>

      <div role="tablist" className="flex gap-2 mb-6 border-b border-ink/10 dark:border-ink-light/10">
        {(['generated', 'own'] as const).map((value) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light'
            }`}
          >
            {t(value === 'generated' ? 'app.historyPage.tabGenerated' : 'app.historyPage.tabOwn')}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4 md:mb-8">

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

        {/* Escritorio: filtros siempre a la vista */}
        <div className="hidden md:flex gap-4">
          <div className="w-48 relative">
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

          <div className="w-48 relative">
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

          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            aria-pressed={onlyFavorites}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border shadow-sm transition-colors ${
              onlyFavorites
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-white dark:bg-surface-dark border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark hover:border-red-300 hover:text-red-500'
            }`}
          >
            <Heart aria-hidden="true" className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
            {t('app.historyPage.onlyFavorites')}
          </button>
        </div>

        {/* Móvil: un solo botón abre la hoja con el resto de filtros, para no
            empujar las recetas fuera de la pantalla con 4 controles apilados. */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="md:hidden relative flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-ink/15 dark:border-ink-light/15 bg-white dark:bg-surface-dark text-body dark:text-body-dark shadow-sm"
        >
          <Filter aria-hidden="true" className="w-4 h-4" />
          {t('app.historyPage.filtersButton')}
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-primary text-white text-[11px] font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Etiquetas: en escritorio van siempre a la vista; en móvil se han
          movido dentro de la hoja de filtros, de ahí el `hidden md:flex`. */}
      {allTags.length > 0 && (
        <div className="hidden md:flex flex-wrap items-center gap-2 mb-8 -mt-2">
          <TagIcon aria-hidden="true" className="w-4 h-4 text-muted dark:text-muted-dark flex-shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTagFilter(tag)}
              aria-pressed={selectedTags.includes(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-surface-dark border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark hover:border-primary hover:text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtersOpen && (
        <Modal
          onClose={() => setFiltersOpen(false)}
          label={t('app.historyPage.filtersButton')}
          panelClassName="md:hidden bg-white dark:bg-cream-dark rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-lg font-bold text-ink dark:text-ink-light">{t('app.historyPage.filtersButton')}</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              aria-label={t('app.common.close')}
              className="p-1.5 rounded-full text-muted dark:text-muted-dark hover:bg-ink/5 dark:hover:bg-ink-light/10"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label htmlFor="mobile-difficulty" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.historyPage.difficultyFilterAria')}
              </label>
              <select
                id="mobile-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-ink dark:text-ink-light"
              >
                <option value="all">{t('app.historyPage.difficultyAll')}</option>
                <option value="Fácil">{t('app.historyPage.difficultyEasy')}</option>
                <option value="Media">{t('app.historyPage.difficultyMedium')}</option>
                <option value="Difícil">{t('app.historyPage.difficultyHard')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="mobile-sort" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.historyPage.sortAria')}
              </label>
              <select
                id="mobile-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-ink dark:text-ink-light"
              >
                <option value="newest">{t('app.historyPage.sortNewest')}</option>
                <option value="oldest">{t('app.historyPage.sortOldest')}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              aria-pressed={onlyFavorites}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${
                onlyFavorites
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  : 'bg-cream dark:bg-[#221B12] border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark'
              }`}
            >
              <Heart aria-hidden="true" className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
              {t('app.historyPage.onlyFavorites')}
            </button>

            {allTags.length > 0 && (
              <div>
                <span className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">{t('app.recipeDisplay.tagsHeading')}</span>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTagFilter(tag)}
                      aria-pressed={selectedTags.includes(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-cream dark:bg-[#221B12] border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-5 pt-0 mt-auto">
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="flex-1 py-3 rounded-xl border border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark font-medium disabled:opacity-40 disabled:pointer-events-none"
            >
              {t('app.historyPage.clearFilters')}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold"
            >
              {t('app.historyPage.showResults', { count: filteredRecipes.length })}
            </button>
          </div>
        </Modal>
      )}

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
      ) : tab === 'own' && ownLocked ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border-2 border-amber-200 dark:border-amber-700">
           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
             <Lock aria-hidden="true" className="w-8 h-8 text-white" />
           </div>
           <h3 className="text-xl font-bold text-ink dark:text-[#F8F2E6] flex items-center justify-center gap-2">
             <Crown aria-hidden="true" className="w-5 h-5 text-amber-500" />
             {t('app.historyPage.ownLockedTitle')}
           </h3>
           <p className="text-muted dark:text-muted-dark mt-2 mb-6 max-w-md mx-auto">{t('app.historyPage.ownLockedSubtitle')}</p>
           <button
             onClick={() => navigate('/app/profile')}
             className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition active:scale-95"
           >
             {t('app.historyPage.viewPlans')}
           </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-ink/15 dark:border-ink-light/15">
           <div aria-hidden="true" className="text-6xl mb-4">🍲</div>
           <h3 className="text-xl font-bold text-ink dark:text-[#F8F2E6]">
             {t(tab === 'own' ? 'app.historyPage.emptyOwnTitle' : 'app.historyPage.emptyTitle')}
           </h3>
           <p className="text-muted dark:text-muted-dark mt-2 mb-6">
             {t(tab === 'own' ? 'app.historyPage.emptyOwnSubtitle' : 'app.historyPage.emptySubtitle')}
           </p>
           <button
             onClick={() => navigate(tab === 'own' ? '/app/recipes/new' : '/app')}
             className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-colors"
           >
             {t(tab === 'own' ? 'app.historyPage.addRecipe' : 'app.historyPage.createNew')}
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

                <FavoriteButton
                  isFavorite={!!recipe.is_favorite}
                  onToggle={() => handleToggleFavorite(recipe)}
                  label={t(recipe.is_favorite ? 'app.recipeDisplay.unfavoriteAria' : 'app.recipeDisplay.favoriteAria')}
                  className="absolute top-3 right-3 p-1.5 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition-colors"
                />

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

                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-[11px] font-medium text-muted dark:text-muted-dark">
                        +{recipe.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

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

        {/* Tope de recetas propias de La Mamma alcanzado */}
        {tab === 'own' && ownCapped && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                <Lock aria-hidden="true" className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink dark:text-[#F8F2E6] mb-2 flex items-center justify-center gap-2">
              <Crown aria-hidden="true" className="w-6 h-6 text-amber-500" />
              {t('app.historyPage.ownCapTitle')}
            </h3>
            <p className="text-[#5C4E3A] dark:text-[#A89C86] mb-4 max-w-2xl mx-auto">
              {t('app.historyPage.ownCapDesc', { limit: ownLimit })}
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