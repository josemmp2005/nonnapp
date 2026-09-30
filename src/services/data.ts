/**
 * Servicio de datos: recetas (recientes, historial, detalle, guardar),
 * preferencias del chef y suscripción, contra `/api/recipes`, `/api/profile` y
 * `/api/subscription`.
 */

import { apiFetch, ApiError } from './api';
import type { AIRecipeResponse, RecipeDB, SubscriptionData, UserProfile } from '../types';
import { DEFAULT_USER_PROFILE } from '../constants';

/* --- RECETAS --- */

export const fetchRecentRecipes = (): Promise<RecipeDB[]> => apiFetch<RecipeDB[]>('/api/recipes/recent');

export const fetchUserHistory = (): Promise<RecipeDB[]> => apiFetch<RecipeDB[]>('/api/recipes/history');

export const getFullRecipeById = async (recipeId: string | number): Promise<RecipeDB | null> => {
  try {
    return await apiFetch<RecipeDB>(`/api/recipes/${recipeId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    console.error('Error cargando la receta:', err);
    return null;
  }
};

export class DailyLimitError extends Error {
  constructor() {
    super('DAILY_LIMIT_EXCEEDED');
    this.name = 'DailyLimitError';
  }
}

export const saveRecipeToDB = async (
  recipe: AIRecipeResponse,
  originalPrompt: string,
  imageUrl: string | null
): Promise<RecipeDB> => {
  try {
    return await apiFetch<RecipeDB>('/api/recipes', {
      method: 'POST',
      body: { recipe, prompt: originalPrompt, imageUrl },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new DailyLimitError();
    }
    throw err;
  }
};

// Recetario propio: Il Nipote no puede usarlo en absoluto; La Mamma tiene un
// tope total (no diario); La Nonna no tiene límite (ver `server/src/lib/recipes.ts`).
export class OwnRecipesPlanRequiredError extends Error {
  constructor() {
    super('PLAN_REQUIRED');
    this.name = 'OwnRecipesPlanRequiredError';
  }
}

export class OwnRecipeLimitError extends Error {
  readonly limit: number;
  constructor(limit: number) {
    super('OWN_RECIPE_LIMIT_EXCEEDED');
    this.name = 'OwnRecipeLimitError';
    this.limit = limit;
  }
}

export const saveManualRecipeToDB = async (recipe: AIRecipeResponse, imageUrl: string | null): Promise<RecipeDB> => {
  try {
    return await apiFetch<RecipeDB>('/api/recipes/manual', {
      method: 'POST',
      body: { recipe, imageUrl },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 403 && err.message === 'PLAN_REQUIRED') {
      throw new OwnRecipesPlanRequiredError();
    }
    if (err instanceof ApiError && err.status === 403 && err.message === 'OWN_RECIPE_LIMIT_EXCEEDED') {
      throw new OwnRecipeLimitError((err.data as { limit: number })?.limit ?? 5);
    }
    throw err;
  }
};

export const setRecipeFavorite = (recipeId: number, isFavorite: boolean): Promise<{ is_favorite: boolean }> =>
  apiFetch(`/api/recipes/${recipeId}/favorite`, { method: 'PATCH', body: { is_favorite: isFavorite } });

// Sustituye TODAS las etiquetas de la receta por `tags` (no añade a las que
// ya tenía) — coincide con lo que hace el servidor (`PUT`, no `PATCH`).
export const setRecipeTags = (recipeId: number, tags: string[]): Promise<{ tags: string[] }> =>
  apiFetch(`/api/recipes/${recipeId}/tags`, { method: 'PUT', body: { tags } });

// Las etiquetas ya existentes del usuario, para sugerirlas al añadir una nueva
// en vez de que tenga que escribirlas siempre desde cero.
export const fetchUserTags = (): Promise<string[]> => apiFetch<string[]>('/api/recipes/tags');

/* --- PREFERENCIAS --- */

export const getUserPreferences = async (): Promise<UserProfile> => {
  try {
    return await apiFetch<UserProfile>('/api/profile/preferences');
  } catch (err) {
    console.warn('No se pudieron cargar las preferencias, usando valores por defecto:', err);
    return DEFAULT_USER_PROFILE;
  }
};

export const saveChefPreferences = async (profile: UserProfile): Promise<{ error: Error | null }> => {
  try {
    await apiFetch('/api/profile/preferences', {
      method: 'PUT',
      body: {
        allergies: profile.allergies,
        disliked_ingredients: profile.disliked_ingredients,
        cooking_skill: profile.cooking_skill,
      },
    });
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

/* --- SUSCRIPCIÓN --- */

export const fetchSubscription = (): Promise<SubscriptionData> => apiFetch<SubscriptionData>('/api/subscription');

// Endpoint de demo (sin pago real) — ver server/src/routes/subscription.ts
export type PlanTypeLower = 'nipote' | 'mamma' | 'nonna';

export const changeSubscription = async (plan: PlanTypeLower): Promise<{ error: Error | null }> => {
  try {
    await apiFetch('/api/subscription/change', { method: 'POST', body: { plan } });
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};
