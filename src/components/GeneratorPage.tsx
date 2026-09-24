/**
 * Página `/app/generate`: formulario para pedir una receta a la IA, pantalla
 * de carga, resultado y guardado en el historial, respetando el límite diario
 * del plan.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecipeForm from './RecipeForm';
import RecipeDisplay from './RecipeDisplay';
import LoadingOverlay from './LoadingOverlay';
import { generateRecipeAI, EmailNotVerifiedError, PlanRequiredError, RecipeOffTopicError } from '../services/ai';
import { saveRecipeToDB, DailyLimitError } from '../services/data';
import type{ AIRecipeResponse, UserProfile, GenerationParams } from '../types';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import type { AuthSession } from '../services/auth';
import { Sparkles, Lock, Crown, Loader2 } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  session: AuthSession | null;
}

const GeneratorPage: React.FC<Props> = ({ userProfile, session }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { subscription, limits, checkRecipeLimit, incrementRecipeCount, markDailyLimitReached } = useSubscription();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<AIRecipeResponse | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const handleGenerate = async (params: GenerationParams) => {
    // Validate userProfile before proceeding
    if (!userProfile) {
      showToast(t('app.generator.toastNoProfile'), 'error');
      return;
    }

    // Check recipe limit for free users
    const { canGenerate, remaining: remainingBeforeGenerate } = checkRecipeLimit();
    if (!canGenerate) {
      showToast(t('app.generator.toastDailyLimit'), 'error');
      return;
    }

    setIsLoading(true);
    setCurrentRecipe(null);

    try {
      // 1. Generate Recipe Text
      const { recipe: generatedRecipe, imageUrl } = await generateRecipeAI(
        params.prompt,
        params.mode,
        params.timeLimit,
        params.ingredients,
        params.servings,
        params.utensils,
        params.hasKitchenRobot
      );
      generatedRecipe.recipe_metadata.servings = params.servings;

      setCurrentRecipe(generatedRecipe);
      setCurrentImageUrl(imageUrl);

      // 3. Save to DB and increment counter
      const userId = session?.user?.id;
      if (userId) {
        try {
          await saveRecipeToDB(generatedRecipe, params.prompt, imageUrl);
          incrementRecipeCount(); // Increment after successful generation

          // Se calcula a partir del valor ya leído arriba en vez de releer
          // localStorage otra vez: canGenerate=true garantiza remainingBeforeGenerate >= 1.
          const remaining = remainingBeforeGenerate === Infinity ? Infinity : remainingBeforeGenerate - 1;
          if (remaining === 1) {
            showToast(t('app.generator.toastSavedOneLeft'), 'success');
          } else if (remaining === 0) {
            showToast(t('app.generator.toastSavedNoneLeft'), 'success');
          } else {
            showToast(t('app.generator.toastSavedGeneric'), 'success');
          }
        } catch (saveError) {
          // Detectar error de límite diario desde el backend
          if (saveError instanceof DailyLimitError) {
            // El servidor manda: si dice que ya no quedan, el contador local
            // (que pudo desincronizarse) se corrige para que no siga mintiendo.
            markDailyLimitReached();
            showToast(t('app.generator.toastDailyLimitBackend'), 'error');
            // No mostrar la receta si no se pudo guardar por límite
            setCurrentRecipe(null);
            setCurrentImageUrl(null);
            return;
          }
          // Otro tipo de error al guardar
          console.error('Error saving recipe:', saveError);
          showToast(t('app.generator.toastSaveFailed'), 'error');
        }
      }

    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        showToast(t('app.generator.toastEmailNotVerified'), 'error');
      } else if (err instanceof PlanRequiredError) {
        showToast(t('app.generator.toastPlanRequired'), 'error');
      } else if (err instanceof RecipeOffTopicError) {
        showToast(t('app.generator.toastOffTopic'), 'error');
      } else {
        showToast(t('app.generator.toastGenericError'), 'error');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger si se navega con state (Dashboard/ChefTableWidget pasan
  // location.state.autoTrigger). Este efecto DEBE llamarse siempre en el
  // mismo orden en cada render — por eso vive antes del `if (!userProfile)`
  // de abajo, que solo decide qué se pinta, no si el hook se ejecuta.
  useEffect(() => {
    if (location.state && location.state.autoTrigger && userProfile) {
      const { prompt, mode, servings, timeLimit } = location.state;
      handleGenerate({
        prompt,
        mode: mode || 'text',
        servings: servings || 2,
        timeLimit: timeLimit || 'unlimited',
        ingredients: mode === 'pantry' ? prompt : undefined
      });
      // Limpia el state para que no se repita si el usuario navega hacia atrás.
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, userProfile]);

  // Safety check: si userProfile no está listo, se muestra un loader en vez
  // de la pantalla real — va DESPUÉS de todos los hooks, nunca antes.
  if (!userProfile) {
    return (
      <div className="max-w-5xl mx-auto pb-20 flex items-center justify-center min-h-[50vh]">
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 aria-hidden="true" className="w-8 h-8 text-primary animate-spin" />
          <p className="text-[#6B5D48] dark:text-[#9A8D74]">{t('app.generator.profileLoading')}</p>
        </div>
      </div>
    );
  }

  const resetView = () => {
    setCurrentRecipe(null);
    setCurrentImageUrl(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <LoadingOverlay isVisible={isLoading} />

      {!currentRecipe ? (
        <div key="form" className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-4 mb-8 pt-4">
             <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl mb-2 shadow-inner">
                <Sparkles aria-hidden="true" className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-3xl md:text-4xl font-extrabold text-[#241B10] dark:text-[#F8F2E6]">
               {t('app.generator.title')}
             </h1>
             <p className="text-[#6B5D48] dark:text-[#9A8D74] max-w-xl mx-auto text-lg">
               {t('app.generator.subtitle')}
             </p>
          </div>

          {/* Recipe Limit Banner for Free Users */}
          {subscription.plan_type === 'Nipote' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Lock aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    {t('app.generator.freeBannerTitle')}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {(() => {
                      const { remaining } = checkRecipeLimit();
                      if (remaining === 0) {
                        return t('app.generator.freeBannerNoneLeft');
                      }
                      return t('app.generator.freeBannerRemaining', { count: remaining });
                    })()}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition active:scale-95 shadow-md hover:shadow-lg">
                  <Crown aria-hidden="true" className="w-4 h-4" />
                  {t('app.generator.upgradeButton')}
                </button>
              </div>
            </div>
          )}

          <RecipeForm
            isLoading={isLoading}
            onSubmit={handleGenerate}
            hasAdvancedPantry={limits.hasAdvancedPantry}
          />
        </div>
      ) : (
        <div key="result" className="animate-in fade-in duration-300">
          <RecipeDisplay
            recipe={currentRecipe}
            imageUrl={currentImageUrl}
            onGenerateAgain={resetView}
          />
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;
