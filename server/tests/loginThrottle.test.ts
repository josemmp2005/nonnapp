import { describe, it, expect } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';
import { createUser, TEST_PASSWORD } from './helpers/factories.js';
import { MAX_FAILED_LOGINS } from '../src/lib/loginThrottle.js';

const login = (email: string, password: string) => request(app).post('/api/auth/login').send({ email, password });

const failLogins = async (email: string, times: number) => {
  for (let i = 0; i < times; i++) {
    const res = await login(email, 'contraseña-incorrecta');
    expect(res.status).toBe(401);
  }
};

describe('bloqueo de login por cuenta', () => {
  it(`bloquea con 429 tras ${MAX_FAILED_LOGINS} fallos, incluso con la contraseña correcta`, async () => {
    const user = await createUser({ email: 'bloqueada@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS);

    const res = await login(user.email, TEST_PASSWORD);

    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
    expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('trata igual un email que no existe: no delata qué cuentas están registradas', async () => {
    const email = 'fantasma@example.com';
    await failLogins(email, MAX_FAILED_LOGINS);

    const res = await login(email, 'lo-que-sea');

    expect(res.status).toBe(429);
  });

  it('un login correcto pone el contador a cero', async () => {
    const user = await createUser({ email: 'reintento@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS - 1);

    expect((await login(user.email, TEST_PASSWORD)).status).toBe(200);
    await failLogins(user.email, MAX_FAILED_LOGINS - 1);

    expect((await login(user.email, TEST_PASSWORD)).status).toBe(200);
  });

  it('el bloqueo caduca: pasado el tiempo se puede volver a entrar', async () => {
    const user = await createUser({ email: 'caduca@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS);
    await pool.query(
      `UPDATE login_throttle SET locked_until = NOW() - INTERVAL '1 second', updated_at = NOW() - INTERVAL '16 minutes' WHERE email = $1`,
      [user.email]
    );

    const res = await login(user.email, TEST_PASSWORD);

    expect(res.status).toBe(200);
  });

  it('los fallos antiguos dejan de contar (ventana de 15 min)', async () => {
    const user = await createUser({ email: 'ventana@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS - 1);
    await pool.query(`UPDATE login_throttle SET updated_at = NOW() - INTERVAL '16 minutes' WHERE email = $1`, [
      user.email,
    ]);

    await failLogins(user.email, 1);

    const { rows } = await pool.query('SELECT failed_attempts FROM login_throttle WHERE email = $1', [user.email]);
    expect(rows[0].failed_attempts).toBe(1);
  });

  it('normaliza el email: no se esquiva cambiando mayúsculas o espacios', async () => {
    const user = await createUser({ email: 'mayus@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS);

    const res = await login('  MAYUS@Example.com ', TEST_PASSWORD);

    expect(res.status).toBe(429);
  });

  it('restablecer la contraseña por email desbloquea la cuenta', async () => {
    const user = await createUser({ email: 'reset@example.com' });
    await failLogins(user.email, MAX_FAILED_LOGINS);
    expect((await login(user.email, TEST_PASSWORD)).status).toBe(429);

    const rawToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
      [user.id, crypto.createHash('sha256').update(rawToken).digest('hex')]
    );
    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'nueva-contraseña-123' });
    expect(reset.status).toBe(204);

    expect((await login(user.email, 'nueva-contraseña-123')).status).toBe(200);
  });
});

describe('POST /api/auth/forgot-password (tope por cuenta)', () => {
  it('no genera más de 3 tokens por hora para la misma cuenta y responde igual siempre', async () => {
    const user = await createUser({ email: 'spam@example.com' });

    const responses = [];
    for (let i = 0; i < 5; i++) {
      responses.push(await request(app).post('/api/auth/forgot-password').send({ email: user.email }));
    }

    expect(new Set(responses.map((r) => r.status))).toEqual(new Set([200]));
    expect(new Set(responses.map((r) => JSON.stringify(r.body))).size).toBe(1);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM password_reset_tokens WHERE user_id = $1', [
      user.id,
    ]);
    expect(rows[0].n).toBe(3);
  });
});
