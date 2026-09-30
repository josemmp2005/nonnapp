/**
 * Etiquetas del recetario: listar las de un usuario y sustituir de golpe (todo
 * o nada, en una transacción) el conjunto de etiquetas de una receta suya.
 */

import type { Pool } from 'pg';
import { withTransaction } from '../db.js';

export class RecipeNotFoundError extends Error {
  constructor() {
    super('RECIPE_NOT_FOUND');
    this.name = 'RecipeNotFoundError';
  }
}

export const listUserTags = async (pool: Pool, userId: string): Promise<string[]> => {
  const { rows } = await pool.query<{ name: string }>(`SELECT name FROM tags WHERE user_id = $1 ORDER BY name`, [userId]);
  return rows.map((r) => r.name);
};

// Sustituye TODAS las etiquetas de la receta por `tagNames` (duplicados y
// vacíos ya filtrados por el esquema/aquí mismo). Las etiquetas son propias de
// cada usuario (tabla `tags`, UNIQUE por user_id+name) — se da de alta la que
// no exista y se reutiliza la que ya tenía. Comprueba primero que la receta es
// del usuario, para no poder etiquetar (ni tirar del 404) la de otra persona.
export const setRecipeTags = async (userId: string, recipeId: number, tagNames: string[]): Promise<string[]> => {
  const uniqueNames = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];

  return withTransaction(async (client) => {
    const owns = await client.query(`SELECT 1 FROM recipes WHERE id = $1 AND user_id = $2`, [recipeId, userId]);
    if (owns.rowCount === 0) throw new RecipeNotFoundError();

    const tagIds: number[] = [];
    for (const name of uniqueNames) {
      const { rows } = await client.query(
        `INSERT INTO tags (user_id, name) VALUES ($1, $2)
         ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [userId, name]
      );
      tagIds.push(rows[0].id);
    }

    await client.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [recipeId]);
    for (const tagId of tagIds) {
      await client.query(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [recipeId, tagId]);
    }

    return uniqueNames;
  });
};
