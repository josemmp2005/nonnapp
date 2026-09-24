/**
 * Setup de Vitest: carga `server/.env.test` antes de que ningún test importe
 * la app.
 */

import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// dotenv no sobreescribe variables ya presentes en process.env, así que esto
// tiene que ejecutarse (y por tanto fijar DATABASE_URL/JWT_SECRET de test)
// ANTES de que cualquier test importe `../../src/app.js` — de ahí que vaya
// como `setupFiles` en vitest.config.ts, no como un import normal de un test.
config({ path: path.resolve(__dirname, '../../.env.test') });
