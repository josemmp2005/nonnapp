import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Nunca se llama a la API real de Groq en tests — se mockea el módulo entero.
vi.mock('../src/lib/groq.js', () => ({
  groqChat: vi.fn().mockResolvedValue(
    JSON.stringify({
      recipe_metadata: {
        title: 'Receta de prueba',
        description: 'Una receta de prueba',
        difficulty: 'Fácil',
        cooking_time: '10 min',
        servings: 2,
        calories: 100,
        macros: { protein: '1g', carbs: '1g', fat: '1g' },
      },
      ingredients: [],
      utensils: [],
      steps: [],
    })
  ),
}));

import { app } from '../src/app.js';
import { groqChat } from '../src/lib/groq.js';
import { createUser, loginCookie } from './helpers/factories.js';

describe('POST /api/ai/generate-recipe', () => {
  it('bloquea el modo despensa para un usuario Nipote (403 PLAN_REQUIRED) sin llamar a Groq', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/generate-recipe')
      .set('Cookie', cookie)
      .send({ prompt: 'pollo, arroz', mode: 'pantry' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('PLAN_REQUIRED');
    expect(groqChat).not.toHaveBeenCalled();
  });

  it('permite el modo texto a un Nipote', async () => {
    const user = await createUser({ plan: 'nipote' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/generate-recipe')
      .set('Cookie', cookie)
      .send({ prompt: 'algo rápido', mode: 'text' });

    expect(res.status).toBe(200);
    expect(res.body.data.recipe_metadata.title).toBe('Receta de prueba');
  });

  // Regresión de seguridad (el hallazgo central de la migración a auth
  // propia): el body nunca puede colar alergias/perfil — zod descarta
  // cualquier campo no declarado en generateRecipeSchema (userProfile
  // incluido) antes de que la ruta vea req.body.
  it('descarta cualquier "userProfile" que mande el cliente en el body', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/generate-recipe')
      .set('Cookie', cookie)
      .send({ prompt: 'algo', mode: 'text', userProfile: { allergies: 'valor-inyectado-por-el-cliente' } });

    expect(res.status).toBe(200);
    const lastCall = vi.mocked(groqChat).mock.calls.at(-1)!;
    const systemMessage = lastCall[0].find((m) => m.role === 'system')!.content;
    expect(systemMessage).not.toContain('valor-inyectado-por-el-cliente');
  });
});

describe('POST /api/ai/chat', () => {
  const validRecipeContext = {
    recipe_metadata: { title: 'Tortilla de patatas' },
    ingredients: [{ item: 'Huevo', quantity: '3' }],
    steps: [{ step_number: 1, instruction: 'Batir los huevos.' }],
  };

  it('bloquea el chat para planes que no son Nonna (403 PLAN_REQUIRED)', async () => {
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Cookie', cookie)
      .send({ question: '¿Puedo sustituir el huevo?', recipeContext: validRecipeContext });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('PLAN_REQUIRED');
  });

  it('responde con la receta como contexto para un usuario Nonna', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Cookie', cookie)
      .send({ question: '¿Puedo sustituir el huevo?', recipeContext: validRecipeContext });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
  });

  // Regresión de seguridad: antes `recipeContext.ingredients`/`.steps` no se
  // validaban (chatSchema los dejaba pasar con `.passthrough()`) y la ruta
  // les hacía `.map()` directamente, fuera del try/catch, para construir el
  // prompt. Un valor no-array ahí (ej. un string) lanzaba una excepción sin
  // capturar que — sin el error handler global que tampoco existía — podía
  // tumbar el proceso de Node entero para todos los usuarios, no solo dar un
  // error al que la mandó. Ahora chatSchema exige que sean arrays con la
  // forma correcta, así que esto debe dar 400, nunca un 500 ni tumbar nada.
  it('rechaza con 400 un recipeContext.ingredients que no es un array, en vez de crashear', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Cookie', cookie)
      .send({
        question: '¿Puedo sustituir el huevo?',
        recipeContext: { recipe_metadata: { title: 'x' }, ingredients: 'no soy un array', steps: [] },
      });

    expect(res.status).toBe(400);
  });

  it('rechaza con 400 un recipeContext.steps que no es un array, en vez de crashear', async () => {
    const user = await createUser({ plan: 'nonna' });
    const cookie = await loginCookie(user.email);

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Cookie', cookie)
      .send({
        question: '¿Cuánto tarda esto?',
        recipeContext: { recipe_metadata: { title: 'x' }, ingredients: [], steps: { not: 'an array' } },
      });

    expect(res.status).toBe(400);
  });
});
