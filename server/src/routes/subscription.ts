/**
 * Rutas `/api/subscription`: consultar el plan activo y cambiarlo (desactivado
 * mientras no haya pasarela de pago).
 */

import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';
import { validateBody } from '../lib/validate.js';
import { changeSubscriptionSchema } from '../lib/schemas.js';
import { getActivePlan, getActiveSubscription } from '../lib/subscription.js';

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

// Pasarela de pago real aún no implementada — bloqueado temporalmente para
// el primer despliegue público (nadie debe poder autoconcederse un plan de
// pago llamando a esta ruta directamente, sin pasar por la UI). Cambiar a
// true (y el mismo flag en src/components/PreferencesPage.tsx) para
// reactivar el cambio de plan.
const PLAN_CHANGES_ENABLED = false;

// Endpoint de DEMO (sin pasarela de pago real, sin cargo alguno): cambia el
// plan activo del propio usuario a cualquiera de los 3 — el frontend simula
// una pantalla de pago antes de llamar aquí para los planes de pago, pero la
// simulación es puramente de cara al usuario, este endpoint no la valida ni
// la necesita. Sigue exigiendo sesión y solo puede afectar a req.userId.
router.post('/change', validateBody(changeSubscriptionSchema), async (req, res) => {
  if (!PLAN_CHANGES_ENABLED) {
    return res.status(503).json({
      error: 'SUBSCRIPTION_CHANGES_DISABLED',
      message:
        'La pasarela de pago está deshabilitada temporalmente. Si quieres mejorar tu plan, contacta con info.nonnap@gmail.com. Disculpa las molestias.',
    });
  }

  const { plan } = req.body;

  try {
    const currentPlan = await getActivePlan(pool, req.userId!);
    if (currentPlan === plan) {
      return res.status(204).send();
    }

    await withTransaction(async (client) => {
      // Cierra CUALQUIER suscripción activa (la de signup ya inserta una fila
      // 'nipote' is_active=true que antes nunca se desactivaba al cambiar de
      // plan, dejando dos filas "activas" a la vez — el ORDER BY de
      // getActiveSubscription acertaba por casualidad, no por diseño).
      await client.query(
        `UPDATE subscriptions SET is_active = false, end_date = NOW()
         WHERE user_id = $1 AND is_active = true`,
        [req.userId]
      );

      await client.query(
        `INSERT INTO subscriptions (user_id, plan_type, is_active, start_date)
         VALUES ($1, $2, true, NOW())`,
        [req.userId, plan]
      );
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Error cambiando de plan (demo):', err);
    return res.status(500).json({ error: 'No se pudo cambiar de plan' });
  }
});

export default router;
