/**
 * Tests de integración de `/api/subscription`: consulta del plan activo y
 * cambio de plan.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { createUser, loginCookie } from './helpers/factories.js';

describe('GET /api/subscription', () => {
  it('exige sesión', async () => {
    const res = await request(app).get('/api/subscription');
    expect(res.status).toBe(401);
  });

  it('devuelve Nipote para un usuario recién creado', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);

    const res = await request(app).get('/api/subscription').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.plan_type).toBe('Nipote');
  });

  it('refleja el plan de pago activo', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app).get('/api/subscription').set('Cookie', cookie);

    expect(res.body.plan_type).toBe('Nonna');
  });
});

// La pasarela de pago real no está implementada — bloqueado a propósito
// (ver server/src/routes/subscription.ts, PLAN_CHANGES_ENABLED) para el
// primer despliegue público. Este test falla en cuanto alguien reactive el
// flag sin querer, en vez de descubrirlo en producción.
describe('POST /api/subscription/change', () => {
  it('devuelve 503 SUBSCRIPTION_CHANGES_DISABLED mientras la pasarela esté desactivada', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);

    const res = await request(app).post('/api/subscription/change').set('Cookie', cookie).send({ plan: 'mamma' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('SUBSCRIPTION_CHANGES_DISABLED');
  });
});
