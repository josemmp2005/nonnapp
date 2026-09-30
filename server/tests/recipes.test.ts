/**
 * Tests de integración de `/api/recipes`: guardado con límite diario,
 * recetario propio (bloqueado/limitado según el plan) y aislamiento entre
 * usuarios (una receta ajena da 404).
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';
import { createUser, loginCookie } from './helpers/factories.js';

const minimalRecipe = (title: string) => ({
  recipe: {
    recipe_metadata: { title },
    ingredients: [{ item: 'Huevo', quantity: '2' }],
    utensils: ['Sartén'],
    steps: [{ step_number: 1, instruction: 'Batir los huevos.' }],
  },
  prompt: 'una tortilla',
});

describe('POST /api/recipes', () => {
  it('guarda una receta y la devuelve con id', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);

    const res = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Tortilla'));

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.recipe_metadata.title).toBe('Tortilla');
  });

  // Regresión: el límite diario de Il Nipote se comprueba en el servidor
  // (dentro de la misma transacción del insert), no solo escondiendo el
  // botón en el frontend — así se prueba directamente contra la API.
  it('bloquea la 3ª receta del día para un usuario Nipote (límite: 2/día)', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const first = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Receta 1'));
    const second = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Receta 2'));
    const third = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Receta 3'));

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(third.status).toBe(429);
    expect(third.body.error).toBe('DAILY_LIMIT_EXCEEDED');
  });

  it('no aplica el límite diario a un usuario de pago (Mamma)', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    for (const title of ['R1', 'R2', 'R3']) {
      const res = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe(title));
      expect(res.status).toBe(201);
    }
  });
});

const minimalManualRecipe = (title: string) => ({
  recipe: {
    recipe_metadata: { title },
    ingredients: [{ item: 'Harina', quantity: '200 g' }],
    utensils: ['Bol'],
    steps: [{ step_number: 1, instruction: 'Mezclar todo.' }],
  },
});

describe('POST /api/recipes/manual', () => {
  it('guarda una receta propia marcada como no generada por IA', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe('Bizcocho de la abuela'));

    expect(res.status).toBe(201);
    expect(res.body.recipe_metadata.title).toBe('Bizcocho de la abuela');
    expect(res.body.is_ai_generated).toBe(false);

    const full = await request(app).get(`/api/recipes/${res.body.id}`).set('Cookie', cookie);
    expect(full.body.is_ai_generated).toBe(false);
  });

  it('exige al menos un ingrediente y un paso', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const sinIngredientes = await request(app)
      .post('/api/recipes/manual')
      .set('Cookie', cookie)
      .send({ recipe: { recipe_metadata: { title: 'Vacía' }, ingredients: [], steps: [{ step_number: 1, instruction: 'Paso' }] } });
    const sinPasos = await request(app)
      .post('/api/recipes/manual')
      .set('Cookie', cookie)
      .send({ recipe: { recipe_metadata: { title: 'Vacía' }, ingredients: [{ item: 'Sal', quantity: '1' }], steps: [] } });

    expect(sinIngredientes.status).toBe(400);
    expect(sinPasos.status).toBe(400);
  });

  it('sin foto propia, le asigna una del banco por título/ingredientes', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe('Paella valenciana'));

    expect(res.status).toBe(201);
    expect(res.body.main_image_url).toMatch(/^https:\/\/images\.unsplash\.com\//);
  });

  // El recetario propio es un escalón de planes, no un tema de coste (no hay
  // IA de por medio): Il Nipote no puede usarlo en absoluto.
  it('bloquea a Il Nipote por completo (403 PLAN_REQUIRED)', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const res = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe('Intento'));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('PLAN_REQUIRED');
  });

  it('limita a La Mamma a 5 recetas propias en total (no por día)', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe(`Propia ${i}`));
      expect(res.status).toBe(201);
    }
    const sexta = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe('Propia 6'));
    expect(sexta.status).toBe(403);
    expect(sexta.body.error).toBe('OWN_RECIPE_LIMIT_EXCEEDED');
    expect(sexta.body.limit).toBe(5);

    // Las de IA (La Mamma no tiene límite diario) no cuentan para este tope.
    const ia = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('De la IA'));
    expect(ia.status).toBe(201);
    const propiaTrasIa = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe('Sigue bloqueada'));
    expect(propiaTrasIa.status).toBe(403);
  });

  it('no limita a La Nonna', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    for (let i = 1; i <= 6; i++) {
      const res = await request(app).post('/api/recipes/manual').set('Cookie', cookie).send(minimalManualRecipe(`Propia ${i}`));
      expect(res.status).toBe(201);
    }
  });

  // Regresión: el conteo del límite diario de IA solo debe mirar recetas de
  // IA. Se simula con un INSERT directo (en vez de por la API, ya bloqueada
  // para Il Nipote) el caso de una cuenta que tuvo recetas propias con un plan
  // de pago y luego bajó a Il Nipote — sus recetas propias antiguas no deben
  // contar para el cupo diario de 2 recetas de IA.
  it('el límite diario de IA de Il Nipote ignora recetas propias ya existentes', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);
    await pool.query(
      `INSERT INTO recipes (user_id, title, is_ai_generated, source_origin) VALUES ($1, 'Propia antigua', false, 'manual')`,
      [user.id]
    );

    const first = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('IA 1'));
    const second = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('IA 2'));
    const third = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('IA 3'));

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(third.status).toBe(429);
  });
});

describe('PATCH /api/recipes/:id/favorite', () => {
  it('marca y desmarca una receta como favorita', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Tortilla'));

    const marked = await request(app).patch(`/api/recipes/${created.body.id}/favorite`).set('Cookie', cookie).send({ is_favorite: true });
    expect(marked.status).toBe(200);
    expect(marked.body.is_favorite).toBe(true);

    const fetched = await request(app).get(`/api/recipes/${created.body.id}`).set('Cookie', cookie);
    expect(fetched.body.is_favorite).toBe(true);

    const unmarked = await request(app).patch(`/api/recipes/${created.body.id}/favorite`).set('Cookie', cookie).send({ is_favorite: false });
    expect(unmarked.status).toBe(200);
    expect(unmarked.body.is_favorite).toBe(false);
  });

  it('aparece marcada en /recent y /history sin tener que abrirla', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Favorita en lista'));
    await request(app).patch(`/api/recipes/${created.body.id}/favorite`).set('Cookie', cookie).send({ is_favorite: true });

    const recent = await request(app).get('/api/recipes/recent').set('Cookie', cookie);
    const history = await request(app).get('/api/recipes/history').set('Cookie', cookie);

    expect(recent.body.find((r: any) => r.id === created.body.id).is_favorite).toBe(true);
    expect(history.body.find((r: any) => r.id === created.body.id).is_favorite).toBe(true);
  });

  // Regresión IDOR: no se puede marcar como favorita la receta de otro.
  it('devuelve 404 al marcar la receta de otro usuario', async () => {
    const owner = await createUser({ email: 'fav-owner@example.com' });
    const ownerCookie = await loginCookie(owner.email);
    const created = await request(app).post('/api/recipes').set('Cookie', ownerCookie).send(minimalRecipe('Ajena'));

    const intruder = await createUser({ email: 'fav-intruder@example.com' });
    const intruderCookie = await loginCookie(intruder.email);
    const res = await request(app).patch(`/api/recipes/${created.body.id}/favorite`).set('Cookie', intruderCookie).send({ is_favorite: true });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/recipes/:id/tags y GET /api/recipes/tags', () => {
  it('guarda etiquetas y las devuelve en el detalle', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Con etiquetas'));

    const res = await request(app).put(`/api/recipes/${created.body.id}/tags`).set('Cookie', cookie).send({ tags: ['cena', 'rápida'] });
    expect(res.status).toBe(200);
    expect(res.body.tags.sort()).toEqual(['cena', 'rápida'].sort());

    const fetched = await request(app).get(`/api/recipes/${created.body.id}`).set('Cookie', cookie);
    expect(fetched.body.tags.sort()).toEqual(['cena', 'rápida'].sort());
  });

  it('sustituye el conjunto completo (quitar una etiqueta la deja fuera)', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Editar etiquetas'));

    await request(app).put(`/api/recipes/${created.body.id}/tags`).set('Cookie', cookie).send({ tags: ['cena', 'rápida'] });
    const res = await request(app).put(`/api/recipes/${created.body.id}/tags`).set('Cookie', cookie).send({ tags: ['postre'] });

    expect(res.body.tags).toEqual(['postre']);
    const fetched = await request(app).get(`/api/recipes/${created.body.id}`).set('Cookie', cookie);
    expect(fetched.body.tags).toEqual(['postre']);
  });

  it('no duplica una etiqueta ya existente del usuario (misma fila reutilizada) y aparece en /api/recipes/tags', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const r1 = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Receta 1'));
    const r2 = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Receta 2'));

    await request(app).put(`/api/recipes/${r1.body.id}/tags`).set('Cookie', cookie).send({ tags: ['cena'] });
    await request(app).put(`/api/recipes/${r2.body.id}/tags`).set('Cookie', cookie).send({ tags: ['cena', 'rápida'] });

    const tags = await request(app).get('/api/recipes/tags').set('Cookie', cookie);
    expect(tags.body.sort()).toEqual(['cena', 'rápida'].sort());
  });

  it('las etiquetas de un usuario no se filtran ni se mezclan con las de otro', async () => {
    const userA = await createUser({ email: 'tags-a@example.com' });
    const cookieA = await loginCookie(userA.email);
    const userB = await createUser({ email: 'tags-b@example.com' });
    const cookieB = await loginCookie(userB.email);

    const recipeA = await request(app).post('/api/recipes').set('Cookie', cookieA).send(minimalRecipe('De A'));
    await request(app).put(`/api/recipes/${recipeA.body.id}/tags`).set('Cookie', cookieA).send({ tags: ['secreta-de-a'] });

    const tagsB = await request(app).get('/api/recipes/tags').set('Cookie', cookieB);
    expect(tagsB.body).toEqual([]);
  });

  it('quita duplicados y espacios sobrantes dentro de la misma petición', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Duplicados'));

    const res = await request(app).put(`/api/recipes/${created.body.id}/tags`).set('Cookie', cookie).send({ tags: ['cena', ' cena ', 'Cena'] });

    // "cena" y " cena " colapsan al recortar espacios; "Cena" con mayúscula
    // inicial se trata como una etiqueta DISTINTA (sin normalizar mayúsculas
    // a propósito: el usuario puede querer "Postre" con mayúscula).
    expect(res.body.tags.sort()).toEqual(['Cena', 'cena']);
  });

  // Regresión IDOR: no se pueden poner etiquetas en la receta de otro.
  it('devuelve 404 al etiquetar la receta de otro usuario', async () => {
    const owner = await createUser({ email: 'tags-owner@example.com' });
    const ownerCookie = await loginCookie(owner.email);
    const created = await request(app).post('/api/recipes').set('Cookie', ownerCookie).send(minimalRecipe('Ajena para etiquetar'));

    const intruder = await createUser({ email: 'tags-intruder@example.com' });
    const intruderCookie = await loginCookie(intruder.email);
    const res = await request(app).put(`/api/recipes/${created.body.id}/tags`).set('Cookie', intruderCookie).send({ tags: ['intento'] });

    expect(res.status).toBe(404);
  });

  it('rechaza más de 10 etiquetas', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Muchas etiquetas'));

    const res = await request(app)
      .put(`/api/recipes/${created.body.id}/tags`)
      .set('Cookie', cookie)
      .send({ tags: Array.from({ length: 11 }, (_, i) => `etiqueta${i}`) });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/recipes/:id', () => {
  // Regresión IDOR: antes de la migración a auth propia, esta ruta no
  // comprobaba propiedad — cualquiera podía ver la receta de otro cambiando
  // el id en la URL.
  it('devuelve 404 al pedir la receta de otro usuario', async () => {
    const owner = await createUser({ email: 'owner@example.com' });
    const ownerCookie = await loginCookie(owner.email);
    const created = await request(app).post('/api/recipes').set('Cookie', ownerCookie).send(minimalRecipe('Secreta'));

    const intruder = await createUser({ email: 'intruder@example.com' });
    const intruderCookie = await loginCookie(intruder.email);

    const res = await request(app).get(`/api/recipes/${created.body.id}`).set('Cookie', intruderCookie);

    expect(res.status).toBe(404);
  });

  it('devuelve la receta completa (con ingredientes/pasos) a su dueño', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const created = await request(app).post('/api/recipes').set('Cookie', cookie).send(minimalRecipe('Mía'));

    const res = await request(app).get(`/api/recipes/${created.body.id}`).set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.recipe_metadata.title).toBe('Mía');
    expect(res.body.ingredients).toEqual([{ item: 'Huevo', quantity: '2' }]);
  });
});
