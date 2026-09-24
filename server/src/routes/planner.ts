/**
 * Rutas `/api/planner` (plan La Nonna): plan semanal, asignar una receta a un
 * hueco y lista de la compra de la semana. Apagadas con `PLANNER_ENABLED`.
 */

import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { requirePlan } from '../middleware/plan.js';
import { validateBody } from '../lib/validate.js';
import { plannerSlotSchema } from '../lib/schemas.js';

const router = Router();

// Función terminada pero todavía en pulido visual — bloqueada a propósito
// hasta que se anuncie (mismo patrón que PLAN_CHANGES_ENABLED en
// PreferencesPage.tsx). Cambiar a true aquí para reactivarla; el frontend
// tiene su propio PLANNER_ENABLED en PlannerPage.tsx, hay que cambiar los dos.
const PLANNER_ENABLED = false;

router.use((_req, res, next) => {
  if (!PLANNER_ENABLED) {
    return res.status(503).json({ error: 'PLANNER_NOT_AVAILABLE' });
  }
  next();
});

// El planificador semanal es exclusivo del plan La Nonna (mismo copy que
// PlanCheckoutModal.tsx y el flag hasWeeklyPlanner de SubscriptionContext.tsx).
router.use(requireAuth, requireVerifiedEmail, requirePlan('nonna'));

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT wpi.day_of_week, wpi.meal_slot, r.id, r.title, r.main_image_url, r.cooking_time, r.difficulty
       FROM weekly_plan_items wpi
       JOIN recipes r ON r.id = wpi.recipe_id
       WHERE wpi.user_id = $1`,
      [req.userId]
    );

    const items = rows.map((row) => ({
      day: row.day_of_week,
      slot: row.meal_slot,
      recipe: {
        id: row.id,
        title: row.title || 'Receta sin título',
        main_image_url: row.main_image_url,
        cooking_time: row.cooking_time || 'N/A',
        difficulty: row.difficulty || 'Media',
      },
    }));

    return res.json(items);
  } catch (err) {
    console.error('Error cargando el planificador:', err);
    return res.status(500).json({ error: 'No se pudo cargar el planificador' });
  }
});

router.put('/slot', validateBody(plannerSlotSchema), async (req, res) => {
  const { day, slot, recipeId } = req.body;

  try {
    if (recipeId === null) {
      await pool.query(
        `DELETE FROM weekly_plan_items WHERE user_id = $1 AND day_of_week = $2 AND meal_slot = $3`,
        [req.userId, day, slot]
      );
      return res.status(204).send();
    }

    // La receta tiene que ser del propio usuario — igual que GET /api/recipes/:id,
    // no distinguimos "no existe" de "no es tuya" en el error.
    const { rows: ownedRows } = await pool.query(`SELECT 1 FROM recipes WHERE id = $1 AND user_id = $2`, [
      recipeId,
      req.userId,
    ]);
    if (ownedRows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    await pool.query(
      `INSERT INTO weekly_plan_items (user_id, recipe_id, day_of_week, meal_slot)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, day_of_week, meal_slot)
       DO UPDATE SET recipe_id = EXCLUDED.recipe_id`,
      [req.userId, recipeId, day, slot]
    );
    return res.status(204).send();
  } catch (err) {
    console.error('Error guardando el hueco del planificador:', err);
    return res.status(500).json({ error: 'No se pudo guardar el cambio' });
  }
});

router.get('/shopping-list', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.name AS item, array_agg(DISTINCT NULLIF(ri.quantity, '')) FILTER (WHERE ri.quantity IS NOT NULL AND ri.quantity != '') AS quantities
       FROM weekly_plan_items wpi
       JOIN recipe_ingredients ri ON ri.recipe_id = wpi.recipe_id
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE wpi.user_id = $1
       GROUP BY i.name
       ORDER BY i.name ASC`,
      [req.userId]
    );

    // `quantity` es texto libre sin unidad (p. ej. "200g" vs "1 unidad") — no
    // se puede sumar numéricamente entre recetas, así que se listan juntas.
    const ingredients = rows.map((row) => ({
      item: row.item,
      quantity: (row.quantities || []).join(' + '),
    }));

    return res.json(ingredients);
  } catch (err) {
    console.error('Error generando la lista de la compra semanal:', err);
    return res.status(500).json({ error: 'No se pudo generar la lista de la compra' });
  }
});

export default router;
