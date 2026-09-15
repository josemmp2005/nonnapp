import { beforeEach, afterAll } from 'vitest';
import { pool } from '../../src/db.js';

// TRUNCATE ... CASCADE en `users` se lleva por delante sessions, subscriptions,
// user_profiles, recipes (y de ahí recipe_steps/recipe_ingredients/recipe_utensils
// en cascada), password_reset_tokens y email_verification_tokens — todo lo que
// depende de un usuario. `ingredients`/`utensils` son catálogos compartidos sin
// FK a usuarios: no hace falta limpiarlos entre tests (ON CONFLICT los deduplica).
beforeEach(async () => {
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
