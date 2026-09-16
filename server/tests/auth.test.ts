import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { createUser, loginCookie, TEST_PASSWORD } from './helpers/factories.js';

describe('POST /api/auth/signup', () => {
  it('crea la cuenta con plan Nipote y deja la cookie de sesión puesta', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'nueva@example.com',
      password: 'password123',
      username: 'Nueva',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'nueva@example.com',
      username: 'Nueva',
      email_verified: false,
    });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rechaza un email ya registrado con 409', async () => {
    await createUser({ email: 'dup@example.com' });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'dup@example.com',
      password: 'password123',
      username: 'Otro',
    });

    expect(res.status).toBe(409);
  });

  it('rechaza una contraseña demasiado corta (validación de esquema)', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'corta@example.com',
      password: '123',
      username: 'Corta',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('inicia sesión con credenciales correctas', async () => {
    const user = await createUser({ email: 'login@example.com' });

    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // Regresión: email inexistente y password incorrecta deben ser
  // indistinguibles para el cliente (evita enumerar cuentas registradas).
  it('devuelve el mismo error genérico para email inexistente y para password incorrecta', async () => {
    const user = await createUser({ email: 'login2@example.com' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'incorrecta-de-verdad' });
    const noSuchEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-existe-nunca@example.com', password: 'lo-que-sea' });

    expect(wrongPassword.status).toBe(401);
    expect(noSuchEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(noSuchEmail.body);
  });
});

describe('GET /api/auth/me', () => {
  it('exige sesión (401 sin cookie)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('devuelve el usuario autenticado con la cookie de sesión', async () => {
    const user = await createUser({ email: 'me@example.com' });
    const cookie = await loginCookie(user.email);

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });
});

describe('POST /api/auth/logout', () => {
  it('revoca la sesión: la cookie ya no sirve después', async () => {
    const user = await createUser({ email: 'logout@example.com' });
    const cookie = await loginCookie(user.email);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logoutRes.status).toBe(204);

    const meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(meRes.status).toBe(401);
  });
});
