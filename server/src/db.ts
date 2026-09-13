import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está configurada (server/.env)');
}

// `pg` no activa TLS solo porque la connection string lleve `sslmode=require`
// (eso solo lo interpreta libpq/pg-native, no el driver JS puro que usamos) —
// hay que pasarlo explícito. Neon/Render Postgres lo exigen; el Postgres local
// de docker-compose no lo soporta, de ahí que sea opt-in con DB_SSL=true
// (ver server/.env.example) en vez de derivarlo de NODE_ENV.
const useSsl = process.env.DB_SSL === 'true';

export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export const withTransaction = async <T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
