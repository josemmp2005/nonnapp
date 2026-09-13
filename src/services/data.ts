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
export const toggleSubscription = async (currentStatus: boolean): Promise<{ error: Error | null }> => {
  try {
    await apiFetch('/api/subscription/toggle', { method: 'POST', body: { currentStatus } });
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};
