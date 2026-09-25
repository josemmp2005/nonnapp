/**
 * Página `/app` (Dashboard): saludo, recetas recientes y accesos rápidos para
 * generar.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HistoryList from './HistoryList';
import { fetchRecentRecipes } from '../services/data';
import type { UserProfile as UserProfileType, RecipeDB } from '../types';
import { Sparkles, Coffee, Zap, Utensils, ArrowRight } from 'lucide-react';
import { Reveal } from './ui/Reveal';
import { useSubscription } from '../context/SubscriptionContext';
import ChefTableWidget from './ChefTableWidget';
import RecipePreviewModal from './RecipePreviewModal';
import type { AuthSession } from '../services/auth';
import { useToast } from '../context/ToastContext';

interface Props {
  userProfile: UserProfileType;
  session: AuthSession | null;
}

const Dashboard: React.FC<Props> = ({ session }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { subscription, limits, checkRecipeLimit } = useSubscription();
  const [recentRecipes, setRecentRecipes] = useState<RecipeDB[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [quickInput, setQuickInput] = useState('');
  const [previewId, setPreviewId] = useState<number | null>(null);

  // Saludo basado en la hora — puro cálculo derivado, no necesita
  // estado+efecto (solo cambiaría si se recarga la página igualmente).
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('app.dashboard.greetingMorning') : hour < 20 ? t('app.dashboard.greetingAfternoon') : t('app.dashboard.greetingEvening');

  useEffect(() => {
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const history = await fetchRecentRecipes();
        setRecentRecipes(history);
      } catch {
        showToast(t('app.dashboard.loadHistoryError'), 'error');
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/app/generate', { 
        state: { 
            autoTrigger: true,
            prompt: quickInput,
            mode: 'text'
        } 
    });
  };

  const handleHistorySelect = (recipe: RecipeDB) => {
    if (recipe.id != null) setPreviewId(recipe.id);
  };

  const triggerQuickAction = (action: string) => {
    let prompt = "";
    let timeLimit = "unlimited";

    if (action === 'breakfast') {
        prompt = "Un desayuno energético, saludable y rápido para empezar el día.";
        timeLimit = "15 minutes";
    } else if (action === 'surprise') {
        prompt = "Sorpréndeme con una receta exótica de cualquier parte del mundo. Algo que probablemente no haya cocinado antes.";
    } else if (action === 'healthy') {
        prompt = "Una cena ligera, baja en carbohidratos, alta en proteínas y llena de sabor.";
    }

    navigate('/app/generate', { 
        state: { 
            autoTrigger: true,
            prompt,
            mode: 'text',
            timeLimit
        } 
    });
  };

  const username = session?.user?.user_metadata?.username || 'Chef';

  // Calcular recetas restantes hoy
  const { remaining } = checkRecipeLimit();
  const planNames: Record<string, string> = {
    'Nipote': 'Nipote',
    'Mamma': 'La Mamma',
    'Nonna': 'La Nonna'
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 animate-in fade-in duration-500 space-y-10">
      
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-[#F8F2E6] tracking-tight">
                    {greeting}, <span className="text-primary">{username}</span>
                </h1>
                <p className="text-muted dark:text-muted-dark mt-1 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    {t('app.dashboard.subtitle')}
                </p>
            </div>
            
            {/* Mini Stats */}
            <div className="flex gap-3">
                <div className="bg-white dark:bg-surface-dark p-3 rounded-xl border border-ink/10 dark:border-ink-light/10 shadow-sm flex flex-col items-center min-w-[80px]">
                    <span className="text-2xl font-bold text-ink dark:text-[#F8F2E6]">
                      {limits.maxRecipesPerDay === Infinity ? '∞' : remaining}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                      {limits.maxRecipesPerDay === Infinity ? t('app.dashboard.statsRecipesUnlimited') : t('app.dashboard.statsToday')}
                    </span>
                </div>
                <div className="bg-white dark:bg-surface-dark p-3 rounded-xl border border-ink/10 dark:border-ink-light/10 shadow-sm flex flex-col items-center min-w-[80px]">
                    <span className="text-2xl font-bold text-primary flex items-center gap-1">
                        {planNames[subscription.plan_type]}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider">{t('app.dashboard.statsPlan')}</span>
                </div>
            </div>
        </div>

        {/* Hero Search Input */}
        <div className="bg-gradient-to-r from-ink to-surface-dark dark:from-surface-dark dark:to-paper-dark rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">{t('app.dashboard.heroTitle')}</h2>
                <form onSubmit={handleQuickInputSubmit} className="relative">
                    <input
                        type="text"
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        placeholder={t('app.dashboard.heroPlaceholder')}
                        className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setQuickInput(t('app.dashboard.chipBreakfast'))} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">{t('app.dashboard.chipBreakfast')}</button>
                    <button onClick={() => setQuickInput(t('app.dashboard.chipDinner'))} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">{t('app.dashboard.chipDinner')}</button>
                    <button onClick={() => setQuickInput("Huevos, tomate, arroz")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">{t('app.dashboard.chipPantry')}</button>
                </div>
            </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
            <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6] mb-4 px-1">{t('app.dashboard.quickActionsTitle')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <Reveal delayMs={0}>
               <button
                 onClick={() => triggerQuickAction('surprise')}
                 className="w-full p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-transform text-left relative overflow-hidden group"
               >
                  <div className="relative z-10">
                      <Sparkles aria-hidden="true" className="w-6 h-6 mb-2 text-purple-100" />
                      <span className="font-bold block">{t('app.dashboard.surpriseTitle')}</span>
                      <span className="text-xs text-purple-100 opacity-80">{t('app.dashboard.surpriseSubtitle')}</span>
                  </div>
                  <Sparkles aria-hidden="true" className="absolute -right-4 -bottom-4 w-20 h-20 text-white opacity-10 group-hover:rotate-12 transition-transform" />
               </button>
               </Reveal>

               <Reveal delayMs={70}>
               <button
                 onClick={() => triggerQuickAction('breakfast')}
                 className="w-full p-4 bg-white dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-2xl text-body dark:text-[#F8F2E6] shadow-sm hover:border-orange-200 dark:hover:border-orange-900 hover:bg-orange-50 dark:hover:bg-[#221B12] active:scale-[0.98] transition text-left group"
               >
                  <Coffee aria-hidden="true" className="w-6 h-6 mb-2 text-orange-500" />
                  <span className="font-bold block">{t('app.dashboard.breakfastTitle')}</span>
                  <span className="text-xs text-muted dark:text-muted-dark">{t('app.dashboard.breakfastSubtitle')}</span>
               </button>
               </Reveal>

               <Reveal delayMs={140}>
               <button
                 onClick={() => triggerQuickAction('healthy')}
                 className="w-full p-4 bg-white dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 rounded-2xl text-body dark:text-[#F8F2E6] shadow-sm hover:border-green-200 dark:hover:border-green-900 hover:bg-green-50 dark:hover:bg-[#221B12] active:scale-[0.98] transition text-left group"
               >
                  <Zap aria-hidden="true" className="w-6 h-6 mb-2 text-green-500" />
                  <span className="font-bold block">{t('app.dashboard.healthyTitle')}</span>
                  <span className="text-xs text-muted dark:text-muted-dark">{t('app.dashboard.healthySubtitle')}</span>
               </button>
               </Reveal>

               <Reveal delayMs={210}>
               <button
                  onClick={() => navigate('/app/generate')}
                  className="w-full h-full p-4 bg-cream dark:bg-surface-dark/50 border border-dashed border-ink/15 dark:border-ink-light/15 rounded-2xl flex flex-col items-center justify-center text-center text-muted dark:text-muted-dark hover:border-primary hover:text-primary active:scale-[0.98] transition-colors"
               >
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-[#221B12] shadow-sm flex items-center justify-center mb-2">
                    <Utensils aria-hidden="true" className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">{t('app.dashboard.advancedGenerator')}</span>
               </button>
               </Reveal>
            </div>
        </div>

        {/* Chef Table Widget */}
        <ChefTableWidget isLocked={!limits.hasChefChat} />
        
        {/* Recent History */}
        <div className="border-t border-ink/10 dark:border-ink-light/10 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-ink dark:text-[#F8F2E6]">{t('app.dashboard.recentTitle')}</h3>
                <button onClick={() => navigate('/app/history')} className="text-sm text-primary hover:underline">{t('app.dashboard.viewAll')}</button>
            </div>
            <HistoryList
              recipes={recentRecipes}
              isLoading={isHistoryLoading}
              onSelect={handleHistorySelect}
            />
        </div>

        {previewId != null && (
          <RecipePreviewModal recipeId={previewId} onClose={() => setPreviewId(null)} />
        )}
    </div>
  );
};

export default Dashboard;
