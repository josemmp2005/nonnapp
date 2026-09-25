/**
 * Guardar una receta generada: comprueba el límite diario del plan gratis y
 * escribe la receta con sus pasos, ingredientes y utensilios en una sola
 * transacción. Vive aparte de `routes/recipes.ts` para que la ruta HTTP solo
 * traduzca petición/respuesta, sin mezclar eso con la lógica de guardado.
 */

import type { PoolClient } from 'pg';
import type { z } from 'zod';
import { withTransaction } from '../db.js';
import { getActivePlan } from './subscription.js';
import type { saveRecipeSchema } from './schemas.js';

const FREE_DAILY_LIMIT = 2;

export type SaveRecipeInput = z.infer<typeof saveRecipeSchema>;

export class DailyLimitExceededError extends Error {
  constructor() {
    super('DAILY_LIMIT_EXCEEDED');
    this.name = 'DailyLimitExceededError';
  }
}

// `ingredients` y `utensils` son catálogos compartidos entre todas las
// recetas (no por usuario) — se da de alta el nombre si no existía ya y se
// devuelve su id, tanto si es nuevo como si ya estaba.
const upsertCatalogEntry = async (client: PoolClient, table: 'ingredients' | 'utensils', name: string): Promise<number> => {
  const { rows } = await client.query(
    `INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [name]
  );
  return rows[0].id;
};

export const saveRecipe = async (
  userId: string,
  { recipe, prompt, imageUrl }: SaveRecipeInput
): Promise<{ id: number; created_at: string }> => {
  return withTransaction(async (client) => {
    const plan = await getActivePlan(client, userId);

    if (plan === 'nipote') {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS count FROM recipes
         WHERE user_id = $1 AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
        [userId]
      );
      if (rows[0].count >= FREE_DAILY_LIMIT) {
        throw new DailyLimitExceededError();
      }
    }

    const meta = recipe.recipe_metadata;
    const { rows: recipeRows } = await client.query(
      `INSERT INTO recipes
         (user_id, title, description, difficulty, cooking_time, servings, calories, macros,
          main_image_url, generation_prompt, is_ai_generated, source_origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,'IA')
       RETURNING id, created_at`,
      [
        userId,
        meta.title,
        meta.description,
        meta.difficulty,
        meta.cooking_time,
        meta.servings,
        meta.calories,
        meta.macros ? JSON.stringify(meta.macros) : null,
        imageUrl ?? null,
        prompt ?? null,
      ]
    );
    const recipeId = recipeRows[0].id;

    for (const step of recipe.steps ?? []) {
      await client.query(
        `INSERT INTO recipe_steps (recipe_id, step_number, instruction, visual_tag, visual_prompt)
         VALUES ($1,$2,$3,$4,$5)`,
        [recipeId, step.step_number, step.instruction, step.visual_tag, step.visual_prompt]
      );
    }

    for (const ing of recipe.ingredients ?? []) {
      const name = (ing.item || '').trim();
      if (!name) continue;
      const ingredientId = await upsertCatalogEntry(client, 'ingredients', name);
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
         VALUES ($1,$2,$3) ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
        [recipeId, ingredientId, ing.quantity || '']
      );
    }

    for (const utensilName of recipe.utensils ?? []) {
      const name = (utensilName || '').trim();
      if (!name) continue;
      const utensilId = await upsertCatalogEntry(client, 'utensils', name);
      await client.query(
        `INSERT INTO recipe_utensils (recipe_id, utensil_id)
         VALUES ($1,$2) ON CONFLICT (recipe_id, utensil_id) DO NOTHING`,
        [recipeId, utensilId]
      );
    }

    return { id: recipeId, created_at: recipeRows[0].created_at };
  });
};
