/**
 * Rutas `/api/recipes`: recientes, historial, detalle y guardado de recetas
 * (generadas por IA, con el límite diario del plan gratuito, o escritas a mano
 * para el recetario propio — bloqueado para Il Nipote, hasta 5 para La Mamma,
 * sin límite para La Nonna), más favoritos y etiquetas propias.
 */

import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { requirePlan } from '../middleware/plan.js';
import { validateBody } from '../lib/validate.js';
import { saveRecipeSchema, saveManualRecipeSchema, setFavoriteSchema, setRecipeTagsSchema } from '../lib/schemas.js';
import { saveRecipe, DailyLimitExceededError, OwnRecipeLimitExceededError } from '../lib/recipes.js';
import { listUserTags, setRecipeTags, RecipeNotFoundError } from '../lib/tags.js';

const router = Router();
router.use(requireAuth, requireVerifiedEmail);

interface RecipeRow {
  id: number;
  main_image_url: string | null;
  created_at: string;
  is_ai_generated: boolean;
  is_favorite: boolean;
  tags?: string[];
  title: string;
  description: string | null;
  difficulty: string | null;
  cooking_time: string | null;
  servings: number | null;
  calories: number | null;
  macros: { protein: string; carbs: string; fat: string } | null;
}

const mapRecipeRow = (row: RecipeRow) => ({
  id: row.id,
  main_image_url: row.main_image_url,
  created_at: row.created_at,
  is_ai_generated: row.is_ai_generated,
  is_favorite: row.is_favorite,
  tags: row.tags ?? [],
  recipe_metadata: {
    title: row.title || 'Receta sin título',
    description: row.description || '',
    difficulty: row.difficulty || 'Media',
    cooking_time: row.cooking_time || 'N/A',
    servings: row.servings || 2,
    calories: row.calories || 0,
    macros: row.macros || { protein: '0g', carbs: '0g', fat: '0g' },
  },
  ingredients: [] as { item: string; quantity: string }[],
  utensils: [] as string[],
  steps: [] as { step_number: number; instruction: string; visual_tag: string; visual_prompt: string }[],
});

// Las listas (recientes/historial) traen las etiquetas ya agregadas en una
// sola consulta — agrupar por `r.id` (clave primaria) permite seleccionar el
// resto de columnas de `r` sin envolverlas en una función de agregación
// (Postgres lo permite: dependen funcionalmente de la clave primaria).
const SELECT_WITH_TAGS = `
  SELECT r.*, COALESCE(array_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
  FROM recipes r
  LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
  LEFT JOIN tags t ON t.id = rt.tag_id
`;

router.get('/recent', async (req, res) => {
  try {
    const { rows } = await pool.query<RecipeRow>(
      `${SELECT_WITH_TAGS} WHERE r.user_id = $1 GROUP BY r.id ORDER BY r.created_at DESC LIMIT 3`,
      [req.userId]
    );
    return res.json(rows.map(mapRecipeRow));
  } catch (err) {
    console.error('Error en /recipes/recent:', err);
    return res.status(500).json({ error: 'No se pudieron cargar las recetas recientes' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { rows } = await pool.query<RecipeRow>(
      `${SELECT_WITH_TAGS} WHERE r.user_id = $1 GROUP BY r.id ORDER BY r.created_at DESC`,
      [req.userId]
    );
    return res.json(rows.map(mapRecipeRow));
  } catch (err) {
    console.error('Error en /recipes/history:', err);
    return res.status(500).json({ error: 'No se pudo cargar el historial' });
  }
});

// Antes de `/:id`: si no, "tags" se interpretaría como un id de receta.
router.get('/tags', async (req, res) => {
  try {
    const tags = await listUserTags(pool, req.userId!);
    return res.json(tags);
  } catch (err) {
    console.error('Error en /recipes/tags:', err);
    return res.status(500).json({ error: 'No se pudieron cargar las etiquetas' });
  }
});

router.get('/:id', async (req, res) => {
  const recipeId = Number(req.params.id);
  if (!Number.isInteger(recipeId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const { rows } = await pool.query<RecipeRow>(
      `SELECT * FROM recipes WHERE id = $1 AND user_id = $2`,
      [recipeId, req.userId]
    );
    if (rows.length === 0) {
      // No distinguimos "no existe" de "no es tuya": evita filtrar qué ids existen.
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const recipe = mapRecipeRow(rows[0]);

    const steps = await pool.query(
      `SELECT step_number, instruction, visual_tag, visual_prompt
       FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_number ASC`,
      [recipeId]
    );
    recipe.steps = steps.rows;

    const ingredients = await pool.query(
      `SELECT i.name AS item, ri.quantity
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = $1`,
      [recipeId]
    );
    recipe.ingredients = ingredients.rows.map((r) => ({ item: r.item, quantity: r.quantity || '' }));

    const utensils = await pool.query(
      `SELECT u.name
       FROM recipe_utensils ru
       JOIN utensils u ON u.id = ru.utensil_id
       WHERE ru.recipe_id = $1`,
      [recipeId]
    );
    recipe.utensils = utensils.rows.map((r) => r.name);

    const tags = await pool.query(
      `SELECT t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.recipe_id = $1 ORDER BY t.name`,
      [recipeId]
    );
    recipe.tags = tags.rows.map((r) => r.name);

    return res.json(recipe);
  } catch (err) {
    console.error('Error en /recipes/:id:', err);
    return res.status(500).json({ error: 'No se pudo cargar la receta' });
  }
});

router.post('/', validateBody(saveRecipeSchema), async (req, res) => {
  const { recipe, prompt, imageUrl } = req.body;

  try {
    const created = await saveRecipe(req.userId!, { recipe, prompt, imageUrl }, 'ai');

    return res.status(201).json({
      ...recipe,
      id: created.id,
      created_at: created.created_at,
      main_image_url: created.main_image_url,
    });
  } catch (err) {
    if (err instanceof DailyLimitExceededError) {
      return res.status(429).json({ error: 'DAILY_LIMIT_EXCEEDED' });
    }
    console.error('Error guardando receta:', err);
    return res.status(500).json({ error: 'No se pudo guardar la receta' });
  }
});

// Recetario propio: el usuario escribe la receta entera, sin pasar por la IA
// ni por el límite diario de arriba. `requirePlan` deja fuera a Il Nipote antes
// de tocar nada más; el tope de La Mamma se comprueba dentro de `saveRecipe`.
router.post('/manual', requirePlan('mamma', 'nonna'), validateBody(saveManualRecipeSchema), async (req, res) => {
  const { recipe, imageUrl } = req.body;

  try {
    const created = await saveRecipe(req.userId!, { recipe, prompt: null, imageUrl }, 'manual');

    return res.status(201).json({
      ...recipe,
      id: created.id,
      created_at: created.created_at,
      main_image_url: created.main_image_url,
      is_ai_generated: false,
    });
  } catch (err) {
    if (err instanceof OwnRecipeLimitExceededError) {
      return res.status(403).json({ error: 'OWN_RECIPE_LIMIT_EXCEEDED', limit: err.limit });
    }
    console.error('Error guardando receta propia:', err);
    return res.status(500).json({ error: 'No se pudo guardar la receta' });
  }
});

router.patch('/:id/favorite', validateBody(setFavoriteSchema), async (req, res) => {
  const recipeId = Number(req.params.id);
  if (!Number.isInteger(recipeId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const { rows } = await pool.query<{ is_favorite: boolean }>(
      `UPDATE recipes SET is_favorite = $1 WHERE id = $2 AND user_id = $3 RETURNING is_favorite`,
      [req.body.is_favorite, recipeId, req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }
    return res.json({ is_favorite: rows[0].is_favorite });
  } catch (err) {
    console.error('Error en /recipes/:id/favorite:', err);
    return res.status(500).json({ error: 'No se pudo actualizar el favorito' });
  }
});

router.put('/:id/tags', validateBody(setRecipeTagsSchema), async (req, res) => {
  const recipeId = Number(req.params.id);
  if (!Number.isInteger(recipeId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const tags = await setRecipeTags(req.userId!, recipeId, req.body.tags);
    return res.json({ tags });
  } catch (err) {
    if (err instanceof RecipeNotFoundError) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }
    console.error('Error en /recipes/:id/tags:', err);
    return res.status(500).json({ error: 'No se pudieron guardar las etiquetas' });
  }
});

export default router;
