import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateBody } from '../lib/validate.js';
import { saveRecipeSchema } from '../lib/schemas.js';
import { getActivePlan } from '../lib/subscription.js';

const router = Router();
router.use(requireAuth, requireVerifiedEmail);

const FREE_DAILY_LIMIT = 2;

interface RecipeRow {
  id: number;
  main_image_url: string | null;
  created_at: string;
  is_ai_generated: boolean;
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

router.get('/recent', async (req, res) => {
  try {
    const { rows } = await pool.query<RecipeRow>(
      `SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3`,
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
      `SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    return res.json(rows.map(mapRecipeRow));
  } catch (err) {
    console.error('Error en /recipes/history:', err);
    return res.status(500).json({ error: 'No se pudo cargar el historial' });
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

    return res.json(recipe);
  } catch (err) {
    console.error('Error en /recipes/:id:', err);
    return res.status(500).json({ error: 'No se pudo cargar la receta' });
  }
});

router.post('/', validateBody(saveRecipeSchema), async (req, res) => {
  const { recipe, prompt, imageUrl } = req.body;

  try {
    const created = await withTransaction(async (client) => {
      const plan = await getActivePlan(client, req.userId!);

      if (plan === 'nipote') {
        const { rows } = await client.query(
          `SELECT COUNT(*)::int AS count FROM recipes
           WHERE user_id = $1 AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
          [req.userId]
        );
        if (rows[0].count >= FREE_DAILY_LIMIT) {
          throw Object.assign(new Error('DAILY_LIMIT_EXCEEDED'), { status: 429 });
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
          req.userId,
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

      for (const step of recipe.steps || []) {
        await client.query(
          `INSERT INTO recipe_steps (recipe_id, step_number, instruction, visual_tag, visual_prompt)
           VALUES ($1,$2,$3,$4,$5)`,
          [recipeId, step.step_number, step.instruction, step.visual_tag, step.visual_prompt]
        );
      }

      for (const ing of recipe.ingredients || []) {
        const name = (ing.item || '').trim();
        if (!name) continue;
        const { rows: ingRows } = await client.query(
          `INSERT INTO ingredients (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [name]
        );
        await client.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
           VALUES ($1,$2,$3) ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
          [recipeId, ingRows[0].id, ing.quantity || '']
        );
      }

      for (const utensilName of recipe.utensils || []) {
        const name = (utensilName || '').trim();
        if (!name) continue;
        const { rows: utensilRows } = await client.query(
          `INSERT INTO utensils (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [name]
        );
        await client.query(
          `INSERT INTO recipe_utensils (recipe_id, utensil_id)
           VALUES ($1,$2) ON CONFLICT (recipe_id, utensil_id) DO NOTHING`,
          [recipeId, utensilRows[0].id]
        );
      }

      return { id: recipeId, created_at: recipeRows[0].created_at };
    });

    return res.status(201).json({
      ...recipe,
      id: created.id,
      created_at: created.created_at,
      main_image_url: imageUrl ?? null,
    });
  } catch (err: any) {
    if (err?.status === 429) {
      return res.status(429).json({ error: 'DAILY_LIMIT_EXCEEDED' });
    }
    console.error('Error guardando receta:', err);
    return res.status(500).json({ error: 'No se pudo guardar la receta' });
  }
});

export default router;
