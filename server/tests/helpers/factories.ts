import bcrypt from 'bcrypt';
import request from 'supertest';
import { pool } from '../../src/db.js';
import { app } from '../../src/app.js';

export const TEST_PASSWORD = 'test-password-123';

interface CreateUserOptions {
  email?: string;
  username?: string;
  password?: string;
  emailVerified?: boolean;
  plan?: 'nipote' | 'mamma' | 'nonna';
}

let counter = 0;

// Inserta el usuario directamente en BBDD (coste de bcrypt bajo — es un
// fixture de test, no hace falta el coste 12 de producción) en vez de pasar
// por POST /signup en cada test: más rápido y no depende de si el flujo de
// signup en sí está bien, que ya se prueba aparte.
export const createUser = async (opts: CreateUserOptions = {}) => {
  counter += 1;
  const email = opts.email ?? `user${counter}-${Date.now()}@example.com`;
  const username = opts.username ?? `Usuario ${counter}`;
  const password = opts.password ?? TEST_PASSWORD;
  const emailVerified = opts.emailVerified ?? true;
  const plan = opts.plan ?? 'nipote';

  const passwordHash = await bcrypt.hash(password, 4);

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, username, email_verified) VALUES ($1,$2,$3,$4) RETURNING id, email`,
    [email, passwordHash, username, emailVerified]
  );
  const user = rows[0];

  await pool.query(
    `INSERT INTO subscriptions (user_id, plan_type, is_active, start_date) VALUES ($1,$2,true,NOW())`,
    [user.id, plan]
  );
  await pool.query(`INSERT INTO user_profiles (user_id) VALUES ($1)`, [user.id]);

  return { id: user.id as string, email: user.email as string, username, password, plan };
};

// Login real vía HTTP (no se fabrica el JWT a mano) para que la cookie que
// devuelve sea idéntica a la que usaría un usuario real, firmada con la
// misma ruta que se está probando en otros tests.
export const loginCookie = async (email: string, password: string = TEST_PASSWORD): Promise<string> => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error(`Login falló al obtener la cookie de sesión (status ${res.status}): ${JSON.stringify(res.body)}`);
  }
  return Array.isArray(setCookie) ? setCookie[0] : setCookie;
};
