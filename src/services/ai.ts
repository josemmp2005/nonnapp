import type { AIRecipeResponse } from '../types';
import { aiRateLimiter, recipeCache } from '../utils/rateLimiter';
import { getMockRecipe } from './mock-recipe';
import { apiFetch, ApiError } from './api';

// Datos de prueba para desarrollo local sin gastar cuota de la IA. Nunca se
// activa en build de producción (import.meta.env.DEV es `false` ahí, y Vite
// lo sustituye en build time — esbuild elimina esta rama entera del bundle).
const USE_MOCK_RECIPE = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_RECIPE === 'true';

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('EMAIL_NOT_VERIFIED');
    this.name = 'EmailNotVerifiedError';
  }
}

// La UI ya oculta el modo despensa / el chat para el plan gratis
// (SubscriptionContext.tsx), así que esto no debería dispararse en uso normal
// — es la red de seguridad si algo llama a estas funciones sin pasar por esa
// comprobación, para no enseñar "PLAN_REQUIRED" en crudo en un toast.
export class PlanRequiredError extends Error {
  constructor() {
    super('PLAN_REQUIRED');
    this.name = 'PlanRequiredError';
  }
}

const isPlanRequiredError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 403 && error.message === 'PLAN_REQUIRED';

// Foto genérica solo para el modo mock de desarrollo — en producción la
// imagen real la elige el backend (server/src/lib/recipeImages.ts).
const MOCK_IMAGE_URL = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';

export interface GeneratedRecipe {
  recipe: AIRecipeResponse;
  imageUrl: string;
}

/**
 * Genera una receta llamando a la API propia (server/src/routes/ai.ts), que
 * es quien tiene la clave de Groq — nunca el navegador. Alergias/ingredientes
 * no deseados/nivel de habilidad los añade el propio backend a partir de lo
 * que el usuario tiene guardado (no se mandan aquí): así el plan gratis no
 * puede colárselos sin pasar por el guardado bloqueado de Preferencias.
 */
export const generateRecipeAI = async (
  prompt: string,
  mode: 'text' | 'pantry',
  timeLimit?: string,
  ingredients?: string,
  servings?: number,
  utensils?: string,
  hasKitchenRobot?: boolean
): Promise<GeneratedRecipe> => {
  if (USE_MOCK_RECIPE) {
    console.warn('⚠️ USANDO DATOS MOCK - la IA está en rate limit');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { recipe: getMockRecipe(prompt), imageUrl: MOCK_IMAGE_URL };
  }

  const cacheKey = JSON.stringify({ prompt, mode, ingredients, servings, timeLimit, utensils, hasKitchenRobot });
  const cached = recipeCache.get(cacheKey);
  if (cached) {
    console.log('✅ Receta obtenida del caché');
    return cached as GeneratedRecipe;
  }

  return aiRateLimiter.execute(async () => {
    try {
      const result = await apiFetch<{ success: boolean; data: AIRecipeResponse; imageUrl: string }>(
        '/api/ai/generate-recipe',
        {
          method: 'POST',
          body: { prompt, mode, ingredients, servings, timeLimit, utensils, hasKitchenRobot },
        }
      );

      const generated: GeneratedRecipe = { recipe: result.data, imageUrl: result.imageUrl };
      recipeCache.set(cacheKey, generated);
      return generated;
    } catch (error) {
      console.error('Error generando receta:', error);
      if (error instanceof ApiError && error.status === 403 && error.message === 'EMAIL_NOT_VERIFIED') {
        throw new EmailNotVerifiedError();
      }
      if (isPlanRequiredError(error)) {
        throw new PlanRequiredError();
      }
      throw new Error(error instanceof Error ? error.message : 'No se pudo generar la receta. Intenta de nuevo.');
    }
  });
};

export const askChefAboutRecipe = async (
  question: string,
  recipe: AIRecipeResponse,
  chatHistory: Array<{ role: string; text: string }>
): Promise<string> => {
  try {
    const result = await apiFetch<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: { question, recipeContext: recipe, history: chatHistory },
    });
    return result.reply;
  } catch (error) {
    console.error('Error en el chat:', error);
    if (isPlanRequiredError(error)) {
      return 'El chat con el chef está disponible en el plan La Nonna.';
    }
    return 'Hubo un error al procesar tu pregunta.';
  }
};
