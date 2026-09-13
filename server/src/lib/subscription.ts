import type { Pool, PoolClient } from 'pg';

export type PlanType = 'nipote' | 'mamma' | 'nonna';

// Acepta tanto el pool como un client de una transacción en curso — ambos
// exponen `.query()` con la misma forma, así una sola función sirve para las
// rutas sueltas (pool) y para las que ya están dentro de withTransaction (client).
type Queryable = Pick<Pool | PoolClient, 'query'>;

interface ActiveSubscriptionRow {
  plan_type: PlanType;
  start_date: string;
  end_date: string | null;
}

// Única fuente de verdad para "¿qué plan tiene activo este usuario ahora
// mismo?" — antes esta misma query (con pequeñas variaciones que ya habían
// empezado a divergir) vivía duplicada en recipes.ts, profile.ts y subscription.ts.
export const getActiveSubscription = async (
  db: Queryable,
  userId: string
): Promise<ActiveSubscriptionRow | null> => {
  const { rows } = await db.query<ActiveSubscriptionRow>(
    `SELECT plan_type, start_date, end_date FROM subscriptions
     WHERE user_id = $1 AND is_active = true AND (end_date IS NULL OR end_date > NOW())
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

export const getActivePlan = async (db: Queryable, userId: string): Promise<PlanType> => {
  const sub = await getActiveSubscription(db, userId);
  return sub?.plan_type || 'nipote';
};
