import { apiFetch } from './api';
import type { IngredientItem } from '../types';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface PlanItemRecipe {
  id: number;
  title: string;
  main_image_url: string | null;
  cooking_time: string;
  difficulty: string;
}

export interface PlanItem {
  day: number; // 0 (lunes) .. 6 (domingo)
  slot: MealSlot;
  recipe: PlanItemRecipe;
}

export const fetchWeekPlan = (): Promise<PlanItem[]> => apiFetch<PlanItem[]>('/api/planner');

export const setPlanSlot = (day: number, slot: MealSlot, recipeId: number | null): Promise<void> =>
  apiFetch<void>('/api/planner/slot', {
    method: 'PUT',
    body: { day, slot, recipeId },
  });

export const fetchWeeklyShoppingList = (): Promise<IngredientItem[]> =>
  apiFetch<IngredientItem[]>('/api/planner/shopping-list');
