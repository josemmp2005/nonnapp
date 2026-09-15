import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { createUser, loginCookie } from './helpers/factories.js';

describe('PUT /api/profile/preferences', () => {
  it('bloquea alergias no vacías para un usuario Nipote (403 PLAN_REQUIRED)', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .put('/api/profile/preferences')
      .set('Cookie', cookie)
      .send({ allergies: 'gluten', disliked_ingredients: '', cooking_skill: 'beginner' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('PLAN_REQUIRED');
  });

  it('permite guardar el nivel de habilidad a un Nipote aunque no tenga alergias', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .put('/api/profile/preferences')
      .set('Cookie', cookie)
      .send({ allergies: '', disliked_ingredients: '', cooking_skill: 'advanced' });

    expect(res.status).toBe(204);
  });

  it('permite alergias a un usuario de pago (Mamma)', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .put('/api/profile/preferences')
      .set('Cookie', cookie)
      .send({ allergies: 'gluten, lactosa', disliked_ingredients: 'cilantro', cooking_skill: 'intermediate' });

    expect(res.status).toBe(204);
  });
});

describe('GET /api/profile/preferences', () => {
  // Regresión: si un Mamma/Nonna guarda alergias y luego baja a Nipote (o
  // hace downgrade), esos datos guardados NO deben seguir aplicándose ni
  // devolviéndose mientras el plan activo sea gratis.
  it('esconde las alergias guardadas si el usuario ya no es de pago', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    await request(app)
      .put('/api/profile/preferences')
      .set('Cookie', cookie)
      .send({ allergies: 'marisco', disliked_ingredients: '', cooking_skill: 'intermediate' });

    // Downgrade manual a nipote directamente en BBDD, simulando lo que haría
    // un cambio de plan real.
    const { pool } = await import('../src/db.js');
    await pool.query(
      `UPDATE subscriptions SET plan_type = 'nipote' WHERE user_id = $1 AND is_active = true`,
      [user.id]
    );

    const res = await request(app).get('/api/profile/preferences').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.allergies).toBe('');
    expect(res.body.is_pro).toBe(false);
  });
});
