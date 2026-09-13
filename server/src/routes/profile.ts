import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateBody } from '../lib/validate.js';
import { preferencesSchema } from '../lib/schemas.js';
import { getActivePlan } from '../lib/subscription.js';

const router = Router();
router.use(requireAuth, requireVerifiedEmail);

const DEFAULT_PREFERENCES = {
  allergies: '',
  disliked_ingredients: '',
  cooking_skill: 'intermediate' as const,
  use_allergies: false,
  use_utensils: false,
  available_utensils: '',
};

router.get('/preferences', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT allergies, disliked_ingredients, hability, available_utensils
       FROM user_profiles WHERE user_id = $1`,
      [req.userId]
    );

    const plan = await getActivePlan(pool, req.userId!);
    const isPro = plan === 'mamma' || plan === 'nonna';

    if (rows.length === 0) {
      return res.json({ ...DEFAULT_PREFERENCES, is_pro: isPro });
    }

    const row = rows[0];
    return res.json({
      allergies: row.allergies || '',
      disliked_ingredients: row.disliked_ingredients || '',
      cooking_skill: row.hability || 'intermediate',
      use_allergies: !!row.allergies,
      use_utensils: false,
      available_utensils: row.available_utensils || '',
      is_pro: isPro,
    });
  } catch (err) {
    console.error('Error cargando preferencias:', err);
    return res.status(500).json({ error: 'No se pudieron cargar las preferencias' });
  }
});

router.put('/preferences', validateBody(preferencesSchema), async (req, res) => {
  const { allergies, disliked_ingredients, cooking_skill } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_profiles (user_id, allergies, disliked_ingredients, hability, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET allergies = EXCLUDED.allergies,
             disliked_ingredients = EXCLUDED.disliked_ingredients,
             hability = EXCLUDED.hability,
             updated_at = NOW()`,
      [req.userId, allergies, disliked_ingredients, cooking_skill]
    );
    return res.status(204).send();
  } catch (err) {
    console.error('Error guardando preferencias:', err);
    return res.status(500).json({ error: 'No se pudieron guardar las preferencias' });
  }
});

export default router;
