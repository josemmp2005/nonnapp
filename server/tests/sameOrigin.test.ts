import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/env.js';

describe('requireSameOrigin (defensa CSRF)', () => {
  it('rechaza con 403 un POST sin body que viene de otro origen (p. ej. un <form> externo a /logout)', async () => {
    const res = await request(app).post('/api/auth/logout').set('Origin', 'https://evil.example');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Origen no permitido.' });
  });

  it('rechaza también Origin: null (iframes sandbox, redirects cross-site)', async () => {
    const res = await request(app).post('/api/auth/logout').set('Origin', 'null');

    expect(res.status).toBe(403);
  });

  it('deja pasar el Origin del frontend (llega a requireAuth y responde 401, no 403)', async () => {
    const res = await request(app).post('/api/auth/logout').set('Origin', env.corsOrigin);

    expect(res.status).toBe(401);
  });

  it('deja pasar peticiones sin Origin (curl, servidor a servidor)', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
  });

  it('no afecta a métodos seguros: un GET con Origin ajeno sigue llegando a la ruta', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');

    expect(res.status).toBe(200);
  });
});
