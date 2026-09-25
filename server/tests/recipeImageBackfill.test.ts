/**
 * Tests de integración de la foto de las recetas guardadas: `POST /api/recipes`
 * elige una si el cliente no la manda, y el relleno de arranque asigna foto a
 * las recetas antiguas que no la tienen sin tocar las que ya la tienen.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';
import { IMAGE_BANK, DEFAULT_IMAGES } from '../src/lib/recipeImages.js';
import { backfillRecipeImages } from '../src/lib/recipeImageBackfill.js';
import { createUser, loginCookie } from './helpers/factories.js';

const allBankUrls = new Set([...IMAGE_BANK.flatMap((e) => e.urls), ...DEFAULT_IMAGES]);

const recipeBody = (title: string, imageUrl?: string | null) => ({
  recipe: {
    recipe_metadata: { title, description: 'Una receta sencilla.' },
    ingredients: [{ item: 'Avena', quantity: '60 g' }],
    utensils: [],
    steps: [{ step_number: 1, instruction: 'Mezclar.' }],
  },
  prompt: 'test',
  ...(imageUrl !== undefined ? { imageUrl } : {}),
});

describe('POST /api/recipes: foto de la receta', () => {
  it('conserva la foto que manda el cliente (la que vio el usuario al generar)', async () => {
    const user = await createUser();
    const cookie = await loginCookie(user.email);
    const seen = IMAGE_BANK[0].urls[0];

    const res = await request(app).post('/api/recipes').set('Cookie', cookie).send(recipeBody('Paella', seen));

    expect(res.status).toBe(201);
    expect(res.body.main_image_url).toBe(seen);
    const { rows } = await pool.query('SELECT main_image_url FROM recipes WHERE id = $1', [res.body.id]);
    expect(rows[0].main_image_url).toBe(seen);
  });

  it('elige una foto del banco si el cliente no manda ninguna, y la devuelve igual que la guarda', async () => {
    // plan de pago: el gratis solo deja guardar 2 recetas al día y aquí van 3
    const user = await createUser({ plan: 'mamma' });
    const cookie = await loginCookie(user.email);

    for (const body of [recipeBody('Bowl de avena'), recipeBody('Bowl de avena', null), recipeBody('Bowl de avena', '')]) {
      const res = await request(app).post('/api/recipes').set('Cookie', cookie).send(body);
      expect(res.status).toBe(201);
      expect(allBankUrls.has(res.body.main_image_url)).toBe(true);
      const { rows } = await pool.query('SELECT main_image_url FROM recipes WHERE id = $1', [res.body.id]);
      expect(rows[0].main_image_url).toBe(res.body.main_image_url);
      // "Bowl de avena" es avena, no un bowl de verduras
      expect(IMAGE_BANK.find((e) => e.keywords.includes('avena'))!.urls).toContain(res.body.main_image_url);
    }
  });
});

describe('backfillRecipeImages', () => {
  const insertRecipe = async (userId: string, title: string, imageUrl: string | null, ingredient?: string) => {
    const { rows } = await pool.query(
      `INSERT INTO recipes (user_id, title, description, main_image_url, is_ai_generated, source_origin)
       VALUES ($1,$2,'Una receta.',$3,true,'IA') RETURNING id`,
      [userId, title, imageUrl]
    );
    if (ingredient) {
      const ing = await pool.query(
        `INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [ingredient]
      );
      await pool.query(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES ($1,$2,'1')`, [rows[0].id, ing.rows[0].id]);
    }
    return rows[0].id as number;
  };
  const imageOf = async (id: number) => (await pool.query('SELECT main_image_url FROM recipes WHERE id = $1', [id])).rows[0].main_image_url;

  it('da foto a las recetas que no la tienen y no toca las que ya la tienen', async () => {
    const user = await createUser();
    const kept = 'https://images.unsplash.com/photo-1000000000000-aaaaaaaa?auto=format&fit=crop&w=1200&q=80';
    const withoutImage = await insertRecipe(user.id, 'Paella valenciana', null);
    const withImage = await insertRecipe(user.id, 'Tortilla de patata', kept);

    const filled = await backfillRecipeImages();

    expect(filled).toBe(1);
    expect(IMAGE_BANK.find((e) => e.keywords.includes('paella'))!.urls).toContain(await imageOf(withoutImage));
    expect(await imageOf(withImage)).toBe(kept);
  });

  it('usa los ingredientes cuando el título no dice nada', async () => {
    const user = await createUser();
    const id = await insertRecipe(user.id, 'Plato del chef', null, 'Cordero (paleta o pierna)');

    await backfillRecipeImages();

    expect(IMAGE_BANK.find((e) => e.keywords.includes('cordero'))!.urls).toContain(await imageOf(id));
  });

  it('es idempotente: una segunda pasada no cambia nada', async () => {
    const user = await createUser();
    const id = await insertRecipe(user.id, 'Paella valenciana', null);

    expect(await backfillRecipeImages()).toBe(1);
    const first = await imageOf(id);
    expect(await backfillRecipeImages()).toBe(0);
    expect(await imageOf(id)).toBe(first);
  });
});
