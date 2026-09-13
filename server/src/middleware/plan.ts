import type { NextFunction, Request, Response } from 'express';
import { pool } from '../db.js';
import { getActivePlan } from '../lib/subscription.js';
import type { PlanType } from '../lib/subscription.js';

// Se monta DESPUÉS de requireAuth (necesita req.userId). Bloquea la ruta si
// el plan activo del usuario no está en la lista permitida — la contrapartida
// server-side de los `limits.hasX` del frontend (SubscriptionContext.tsx),
// que por sí solos no impiden llamar a la API directamente saltándose la UI.
export const requirePlan =
  (...allowedPlans: PlanType[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const plan = await getActivePlan(pool, req.userId!);
    if (!allowedPlans.includes(plan)) {
      return res.status(403).json({ error: 'PLAN_REQUIRED', plan, requiredPlans: allowedPlans });
    }
    next();
  };
