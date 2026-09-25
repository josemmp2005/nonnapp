/**
 * Tests de errores asíncronos: una consulta que falla fuera del try/catch de
 * una ruta debe acabar en un 500 JSON, nunca dejar la petición colgada, y el
 * middleware de errores conserva los 4xx (JSON mal formado, cuerpo enorme).
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import type { Request, Response } from 'express';

// Nunca se llama a la API real de Groq en tests.
vi.mock('../src/lib/groq.js', () => ({ groqChat: vi.fn() }));

import { app } from '../src/app.js';
import { pool } from '../src/db.js';
import { asyncHandler } from '../src/lib/asyncHandler.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { createUser, loginCookie } from './helpers/factories.js';

// Hace fallar solo las consultas cuyo SQL contiene `needle` (p. ej. la del plan
// activo) y deja pasar el resto (sesión, usuario...), como una BBDD que se cae
// justo en ese punto.
const failQueriesContaining = (needle: string) => {
  const original = pool.query.bind(pool) as (...args: unknown[]) => Promise<unknown>;
  return vi.spyOn(pool, 'query').mockImplementation(((text: unknown, ...rest: unknown[]) =>
    typeof text === 'string' && text.includes(needle)
      ? Promise.reject(new Error('BBDD caída (simulada)'))
      : original(text, ...rest)) as never);
};

const spies: Array<{ mockRestore: () => void }> = [];
afterEach(() => {
  while (spies.length) spies.pop()!.mockRestore();
});

describe('rutas con await fuera del try/catch', () => {
  it('POST /api/ai/generate-recipe responde 500 JSON si falla la consulta del plan', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);
    spies.push(failQueriesContaining('subscriptions'));

    const res = await request(app)
      .post('/api/ai/generate-recipe')
      .set('Cookie', cookie)
      .timeout({ response: 3000 })
      .send({ prompt: 'tortilla de patatas', mode: 'text' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno del servidor' });
  });

  it('PUT /api/profile/preferences (con alergias) responde 500 JSON si falla la consulta del plan', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);
    spies.push(failQueriesContaining('subscriptions'));

    const res = await request(app)
      .put('/api/profile/preferences')
      .set('Cookie', cookie)
      .timeout({ response: 3000 })
      .send({ allergies: 'gluten', disliked_ingredients: '', cooking_skill: 'beginner' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno del servidor' });
  });
});

describe('errorHandler', () => {
  const mockRes = () => {
    const res = { headersSent: false } as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };
  const req = { method: 'POST', path: '/x' } as Request;

  it('convierte un error desconocido en 500 con mensaje genérico (sin filtrar detalles)', () => {
    const res = mockRes();
    errorHandler(new Error('detalle interno secreto'), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });

  it('respeta los 4xx (p. ej. el 400 de un JSON mal formado)', () => {
    const res = mockRes();
    errorHandler(Object.assign(new Error('Unexpected token'), { status: 400 }), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Solicitud no válida' });
  });

  it('si la respuesta ya empezó, delega en el manejador por defecto de Express', () => {
    const res = mockRes();
    (res as { headersSent: boolean }).headersSent = true;
    const next = vi.fn();
    const err = new Error('tarde');
    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('asyncHandler', () => {
  it('reenvía el rechazo de la promesa a next() en vez de dejarlo sin capturar', async () => {
    const boom = new Error('fallo async');
    const next = vi.fn();

    asyncHandler(async () => {
      throw boom;
    })({} as Request, {} as Response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe('cuerpo de la petición inválido (manejado por el middleware de errores)', () => {
  it('JSON mal formado devuelve 400 JSON, no un 500', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Solicitud no válida' });
  });
});
