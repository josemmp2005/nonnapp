
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RecipeForm from './RecipeForm';
import RecipeDisplay from './RecipeDisplay';
import LoadingOverlay from './LoadingOverlay';
import { generateRecipeAI, generateRecipeImage } from '../services/gemini-edge';
import { checkSmartCache, saveRecipeToDB } from '../services/supabase';
import type{ AIRecipeResponse, UserProfile, GenerationParams } from '../types';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Sparkles, Lock, Crown } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  session: any;
}

const GeneratorPage: React.FC<Props> = ({ userProfile, session }) => {
  const { showToast } = useToast();
  const { subscription, limits, checkRecipeLimit, incrementRecipeCount } = useSubscription();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<AIRecipeResponse | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Safety check: if userProfile is not available, show error
  if (!userProfile) {
    return (
      <div className="max-w-5xl mx-auto pb-20 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  // Auto-trigger if navigated with state
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
      // Clear state to prevent loop if user navigates back (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location.state, userProfile]);

  const handleGenerate = async (params: GenerationParams) => {
    // Validate userProfile before proceeding
    if (!userProfile) {
      showToast('Error: Perfil de usuario no disponible', 'error');
      return;
    }

    // Check recipe limit for free users
      const { canGenerate } = checkRecipeLimit();
    if (!canGenerate) {
      showToast('Has alcanzado el límite de 2 recetas diarias. Actualiza a La Mamma para recetas ilimitadas.', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentRecipe(null);
    setCurrentImage(null);

    try {
      // 1. Check Cache (Skip for "Chef Styles" which are usually unique requests)
      if (!params.prompt.includes('Estilo de cocina')) {
        const cachedRecipe = await checkSmartCache(params.prompt);
        if (cachedRecipe) {
          console.log("Smart Cache HIT");
          setCurrentRecipe(cachedRecipe);
          setCurrentImage(cachedRecipe.main_image_url || null);
          showToast('¡Receta encontrada en caché!', 'success');
          setIsLoading(false);
          return;
        }
      }

      // 2. Generate Recipe Text
      const generatedRecipe = await generateRecipeAI(
        params.prompt, 
        params.mode, 
        userProfile, 
        params.timeLimit,
        params.ingredients,
        params.servings,
        params.utensils
      );
      generatedRecipe.recipe_metadata.servings = params.servings; 
      
      setCurrentRecipe(generatedRecipe);

      // 3. Generate Image (only for paid plans)
      let generatedImage: string | null = null;
      if (limits.hasImageGeneration) {
        const imagePrompt = `
          Professional high-end food photography of the final dish: ${generatedRecipe.recipe_metadata.title}.
          Visual context: ${generatedRecipe.recipe_metadata.description.substring(0, 150)}.
          Style: Michelin star plating, 8k resolution, hyper-realistic, soft studio lighting, shallow depth of field (bokeh).
          CRITICAL: Real food only. No people, no text.
        `.trim();

        generatedImage = await generateRecipeImage(imagePrompt);
        setCurrentImage(generatedImage);
      }

      // 4. Save to DB and increment counter
      const userId = session?.user?.id;
      if (userId) {
        try {
          await saveRecipeToDB(userId, generatedRecipe, params.prompt, generatedImage);
          incrementRecipeCount(); // Increment after successful generation
          
          const { remaining } = checkRecipeLimit();
          if (remaining === 1) {
            showToast('Receta guardada. Te queda 1 receta hoy.', 'success');
          } else if (remaining === 0) {
            showToast('Receta guardada. Has usado tus 2 recetas diarias.', 'success');
          } else {
            showToast('Receta generada y guardada.', 'success');
          }
        } catch (saveError: any) {
          // Detectar error de límite diario desde el backend
          if (saveError.name === 'DailyLimitError' || saveError.message === 'DAILY_LIMIT_EXCEEDED') {
            showToast('❌ Límite diario alcanzado. Has generado el máximo de 2 recetas hoy. Actualiza a La Mamma para recetas ilimitadas.', 'error');
            // No mostrar la receta si no se pudo guardar por límite
            setCurrentRecipe(null);
            setCurrentImage(null);
            return;
          }
          // Otro tipo de error al guardar
          console.error('Error saving recipe:', saveError);
          showToast('Receta generada pero no se pudo guardar. Por favor, intenta de nuevo.', 'error');
        }
      }

    } catch (err: any) {
      showToast("Lo siento, hubo un error generando tu receta. Intenta de nuevo.", 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetView = () => {
    setCurrentRecipe(null);
    setCurrentImage(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <LoadingOverlay isVisible={isLoading} />

      {!currentRecipe ? (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8 pt-4">
             <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl mb-2 shadow-inner">
                <Sparkles className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
               El Laboratorio del Chef
             </h1>
             <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
               Describe tu antojo o dime qué ingredientes tienes. La IA creará la receta perfecta.
             </p>
          </div>

          {/* Recipe Limit Banner for Free Users */}
          {subscription.plan_type === 'Nipote' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Plan Nipote (Gratis)
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {(() => {
                      const { remaining } = checkRecipeLimit();
                      if (remaining === 0) {
                        return '❌ Has usado tus 2 recetas diarias. Vuelve mañana o actualiza tu plan.';
                      }
                      return `🍝 Te quedan ${remaining} receta${remaining > 1 ? 's' : ''} hoy.`;
                    })()}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg">
                  <Crown className="w-4 h-4" />
                  Actualizar
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
        <RecipeDisplay 
          recipe={currentRecipe} 
          imageUrl={currentImage} 
          onGenerateAgain={resetView}
          isPro={limits.hasImageGeneration}
        />
      )}
    </div>
  );
};

export default GeneratorPage;
