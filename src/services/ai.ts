/**
 * Cliente de IA: genera recetas (`/api/ai/generate-recipe`) y consulta al chef
 * (`/api/ai/chat`), con límite de frecuencia y caché en cliente, receta de
 * prueba en desarrollo y errores tipados (email sin verificar, plan requerido,
 * receta fuera de tema).
 */

import type { AIRecipeResponse } from '../types';
import { aiRateLimiter } from '../utils/rateLimiter';
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

// El generador rechaza prompts que no piden una receta de cocina (o que
// intentan hacer ignorar sus instrucciones) — ver el guardarraíl en
// server/src/routes/ai.ts.
export class RecipeOffTopicError extends Error {
  constructor() {
    super('RECIPE_OFF_TOPIC');
    this.name = 'RecipeOffTopicError';
  }
}

const isRecipeOffTopicError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 422 && error.message === 'RECIPE_OFF_TOPIC';

// Groq tiene un límite de tokens/minuto que se agota con uso normal — cuando
// pasa, el servidor responde 429 en vez del 502 genérico. Se avisa aparte
// (en vez de "algo salió mal") porque aquí sí tiene sentido decirle al
// usuario que espere un momento y reintente.
export class AiRateLimitedError extends Error {
  constructor() {
    super('AI_RATE_LIMITED');
    this.name = 'AiRateLimitedError';
  }
}

const isAiRateLimitedError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 429 && error.message === 'AI_RATE_LIMITED';

// 20s de margen: el límite de Groq es por minuto (TPM), así que un solo
// intervalo de 5s (el normal entre llamadas) no basta para que se libere.
const AI_RATE_LIMIT_COOLDOWN_MS = 20000;

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

  // Sin caché de resultados a propósito: la IA genera con temperature > 0
  // porque cada llamada debe poder dar una receta distinta aunque el prompt
  // sea idéntico (p. ej. pulsar "Sorpréndeme" dos veces seguidas) — cachear
  // por inputs devolvía la misma receta hasta recargar la página.
  return aiRateLimiter.execute(async () => {
    try {
      const result = await apiFetch<{ success: boolean; data: AIRecipeResponse; imageUrl: string }>(
        '/api/ai/generate-recipe',
        {
          method: 'POST',
          body: { prompt, mode, ingredients, servings, timeLimit, utensils, hasKitchenRobot },
        }
      );

      return { recipe: result.data, imageUrl: result.imageUrl };
    } catch (error) {
      console.error('Error generando receta:', error);
      if (error instanceof ApiError && error.status === 403 && error.message === 'EMAIL_NOT_VERIFIED') {
        throw new EmailNotVerifiedError();
      }
      if (isPlanRequiredError(error)) {
        throw new PlanRequiredError();
      }
      if (isRecipeOffTopicError(error)) {
        throw new RecipeOffTopicError();
      }
      if (isAiRateLimitedError(error)) {
        // Alarga la espera de la SIGUIENTE llamada (esta ya ha fallado): sin
        // esto, un reintento inmediato del usuario volvería a chocar con el
        // mismo límite de Groq.
        aiRateLimiter.penalize(AI_RATE_LIMIT_COOLDOWN_MS);
        throw new AiRateLimitedError();
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
    if (isAiRateLimitedError(error)) {
      // El chat no pasa por aiRateLimiter (no hay cola que espaciar, una
      // pregunta escrita a mano ya viene espaciada de por sí) — pero comparte
      // cuota con la generación de recetas, así que un 429 aquí también
      // frena la siguiente llamada a esa cola.
      aiRateLimiter.penalize(AI_RATE_LIMIT_COOLDOWN_MS);
      return 'La IA está saturada ahora mismo. Espera un momento y prueba otra vez.';
    }
    return 'Hubo un error al procesar tu pregunta.';
  }
};
