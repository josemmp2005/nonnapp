/**
 * Setup de Vitest por archivo: vacía las tablas antes de cada test para
 * aislarlos y cierra el pool al terminar.
 */

import { beforeEach, afterAll } from 'vitest';
import { pool } from '../../src/db.js';

// TRUNCATE ... CASCADE en `users` se lleva por delante sessions, subscriptions,
// user_profiles, recipes (y de ahí recipe_steps/recipe_ingredients/recipe_utensils
// en cascada), password_reset_tokens y email_verification_tokens — todo lo que
// depende de un usuario. `ingredients`/`utensils` son catálogos compartidos sin
// FK a usuarios: no hace falta limpiarlos entre tests (ON CONFLICT los deduplica).
// `login_throttle` va por email (sin FK a users), así que el CASCADE no la
// alcanza: hay que nombrarla o el bloqueo de un test se filtraría al siguiente.
beforeEach(async () => {
  await pool.query('TRUNCATE TABLE users, login_throttle RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
