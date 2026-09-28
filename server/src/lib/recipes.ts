/**
 * Guardar una receta (generada por IA o escrita a mano): comprueba el límite
 * diario del plan gratis (solo para las de IA) y escribe la receta con sus
 * pasos, ingredientes y utensilios en una sola transacción. Vive aparte de
 * `routes/recipes.ts` para que la ruta HTTP solo traduzca petición/respuesta,
 * sin mezclar eso con la lógica de guardado.
 */

import type { PoolClient } from 'pg';
import type { z } from 'zod';
import { withTransaction } from '../db.js';
import { getActivePlan } from './subscription.js';
import { pickRecipeImage } from './recipeImages.js';
import type { saveRecipeSchema } from './schemas.js';

const FREE_DAILY_LIMIT = 2;
// El recetario propio no cuesta nada de generar (no hay IA de por medio), así
// que no comparte el límite diario de arriba: es un tope total por cuenta,
// pensado como escalón de planes — Il Nipote no tiene (bloqueado antes de
// llegar aquí, ver `requirePlan` en routes/recipes.ts), La Mamma hasta este
// número, La Nonna sin límite.
const MAMMA_OWN_RECIPE_LIMIT = 5;

export type SaveRecipeInput = z.infer<typeof saveRecipeSchema>;

export class DailyLimitExceededError extends Error {
  constructor() {
    super('DAILY_LIMIT_EXCEEDED');
    this.name = 'DailyLimitExceededError';
  }
}

export class OwnRecipeLimitExceededError extends Error {
  constructor(public readonly limit: number) {
    super('OWN_RECIPE_LIMIT_EXCEEDED');
    this.name = 'OwnRecipeLimitExceededError';
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

// 'ai': la genera Groq, cuenta contra el límite diario de Il Nipote (cada
// llamada cuesta dinero). 'manual': el usuario la escribe entera él mismo (el
// recetario propio) — no hay coste de IA de por medio, así que no tiene
// sentido que compita por el mismo cupo.
export type RecipeSource = 'ai' | 'manual';

export const saveRecipe = async (
  userId: string,
  { recipe, prompt, imageUrl }: SaveRecipeInput,
  source: RecipeSource = 'ai'
): Promise<{ id: number; created_at: string; main_image_url: string }> => {
  return withTransaction(async (client) => {
    if (source === 'ai') {
      const plan = await getActivePlan(client, userId);

      if (plan === 'nipote') {
        // `is_ai_generated = true`: sin este filtro, las recetas propias del
        // mismo día contaban aquí y agotaban el cupo de IA sin haber llamado
        // a Groq ni una vez.
        const { rows } = await client.query(
          `SELECT COUNT(*)::int AS count FROM recipes
           WHERE user_id = $1 AND is_ai_generated = true AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
          [userId]
        );
        if (rows[0].count >= FREE_DAILY_LIMIT) {
          throw new DailyLimitExceededError();
        }
      }
    } else {
      // Il Nipote ya está bloqueado antes de llegar aquí (`requirePlan` en la
      // ruta); La Nonna no tiene tope. Solo La Mamma cuenta.
      const plan = await getActivePlan(client, userId);
      if (plan === 'mamma') {
        const { rows } = await client.query(
          `SELECT COUNT(*)::int AS count FROM recipes WHERE user_id = $1 AND is_ai_generated = false`,
          [userId]
        );
        if (rows[0].count >= MAMMA_OWN_RECIPE_LIMIT) {
          throw new OwnRecipeLimitExceededError(MAMMA_OWN_RECIPE_LIMIT);
        }
      }
    }

    const meta = recipe.recipe_metadata;
    // Normalmente llega la foto que se le enseñó al usuario al generar; si no
    // llega (cliente antiguo, guardado desde otro sitio) se elige aquí, para que
    // ninguna receta se quede sin foto.
    const mainImageUrl =
      imageUrl ||
      pickRecipeImage(meta.title, meta.description ?? '', (recipe.ingredients ?? []).map((ing) => ing.item || ''));
    const { rows: recipeRows } = await client.query(
      `INSERT INTO recipes
         (user_id, title, description, difficulty, cooking_time, servings, calories, macros,
          main_image_url, generation_prompt, is_ai_generated, source_origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
        mainImageUrl,
        prompt ?? null,
        source === 'ai',
        source === 'ai' ? 'IA' : 'manual',
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

    return { id: recipeId, created_at: recipeRows[0].created_at, main_image_url: mainImageUrl };
  });
};
