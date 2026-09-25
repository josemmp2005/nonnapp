/**
 * Rellena la foto de las recetas guardadas sin ella (las anteriores al banco de
 * fotos, cuando la imagen se generaba con IA y a menudo fallaba). Se ejecuta en
 * cada arranque y solo toca las que siguen con `main_image_url` nulo, así que es
 * idempotente y nunca cambia una foto ya asignada.
 */

import { pool } from '../db.js';
import { pickRecipeImage } from './recipeImages.js';

interface RecipeWithoutImage {
  id: number;
  title: string;
  description: string | null;
  ingredients: string[];
}

// Devuelve cuántas recetas se han rellenado.
export const backfillRecipeImages = async (): Promise<number> => {
  // Los ingredientes van en el orden en que se guardaron (el de la IA: primero
  // el principal), que es el que usa `pickRecipeImage` para darles peso.
  const { rows } = await pool.query<RecipeWithoutImage>(
    `SELECT r.id, r.title, r.description,
            COALESCE(array_agg(i.name ORDER BY ri.ctid) FILTER (WHERE i.name IS NOT NULL), '{}') AS ingredients
       FROM recipes r
       LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
       LEFT JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE r.main_image_url IS NULL
      GROUP BY r.id`
  );

  for (const recipe of rows) {
    await pool.query(`UPDATE recipes SET main_image_url = $1 WHERE id = $2 AND main_image_url IS NULL`, [
      pickRecipeImage(recipe.title, recipe.description ?? '', recipe.ingredients),
      recipe.id,
    ]);
  }
  return rows.length;
};
