import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateBody } from '../lib/validate.js';
import { toggleSubscriptionSchema } from '../lib/schemas.js';
import { getActiveSubscription } from '../lib/subscription.js';

const router = Router();
router.use(requireAuth, requireVerifiedEmail);

// El frontend (SubscriptionContext.tsx) usa 'Nipote' | 'Mamma' | 'Nonna';
// la BBDD guarda un único enum canónico en minúsculas (ver schema.sql).
const toDisplayPlan = (planType: string | undefined) => {
  switch (planType) {
    case 'mamma':
      return 'Mamma';
    case 'nonna':
      return 'Nonna';
    default:
      return 'Nipote';
  }
};

router.get('/', async (req, res) => {
  try {
    const sub = await getActiveSubscription(pool, req.userId!);

    if (!sub) {
      return res.json({ plan_type: 'Nipote', is_active: true, start_date: null, end_date: null });
    }

    return res.json({
      plan_type: toDisplayPlan(sub.plan_type),
      is_active: true,
      start_date: sub.start_date,
      end_date: sub.end_date,
    });
  } catch (err) {
    console.error('Error cargando suscripción:', err);
    return res.status(500).json({ error: 'No se pudo cargar la suscripción' });
  }
});

// Endpoint de DEMO (sin pasarela de pago real): permite al propio usuario
// activar/desactivar el plan "Mamma" para probar las funciones premium.
// Sigue exigiendo sesión y solo puede afectar a req.userId, nunca a otro usuario.
router.post('/toggle', validateBody(toggleSubscriptionSchema), async (req, res) => {
  const { currentStatus } = req.body;

  try {
    await withTransaction(async (client) => {
      if (currentStatus) {
        await client.query(
          `UPDATE subscriptions SET is_active = false
           WHERE user_id = $1 AND plan_type IN ('mamma', 'nonna') AND is_active = true`,
          [req.userId]
        );
      } else {
        await client.query(
          `INSERT INTO subscriptions (user_id, plan_type, is_active, start_date)
           VALUES ($1, 'mamma', true, NOW())`,
          [req.userId]
        );
      }
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Error actualizando suscripción (demo):', err);
    return res.status(500).json({ error: 'No se pudo actualizar la suscripción' });
  }
});

export default router;
