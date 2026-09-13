import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(sql);
  console.log('✅ Esquema aplicado correctamente.');
  await pool.end();
};

run().catch((err) => {
  console.error('❌ Error aplicando el esquema:', err);
  process.exit(1);
});
