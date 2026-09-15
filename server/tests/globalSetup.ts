import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Corre UNA vez antes de toda la suite, en su propio proceso (no comparte
// módulos con los test files) — su único trabajo es asegurar que la base de
// datos de test existe y tiene el esquema aplicado, antes de que
// `tests/setup/env.ts` (que sí corre dentro de cada worker) importe la app.
export default async function globalSetup() {
  config({ path: path.resolve(__dirname, '../.env.test') });

  const testUrl = new URL(process.env.DATABASE_URL!);
  const dbName = testUrl.pathname.slice(1);

  // Para poder crear/comprobar la BBDD de test hace falta conectar a OTRA
  // base de datos de la misma instancia (no se puede hacer CREATE DATABASE
  // estando conectado a ella) — se usa la de mantenimiento estándar de Postgres.
  const adminUrl = new URL(testUrl);
  adminUrl.pathname = '/postgres';

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rows.length === 0) {
      // No se puede parametrizar el nombre en CREATE DATABASE — dbName sale
      // de nuestro propio .env.test, no de input externo.
      await admin.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await admin.end();
  }

  const schemaSql = readFileSync(path.resolve(__dirname, '../src/schema.sql'), 'utf-8');
  const testDb = new Client({ connectionString: testUrl.toString() });
  await testDb.connect();
  try {
    await testDb.query(schemaSql);
  } finally {
    await testDb.end();
  }
}
