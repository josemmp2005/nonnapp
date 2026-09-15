import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
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
