import { pool } from './db.js';
import { applySchema } from './lib/migrate.js';

const run = async () => {
  await applySchema();
  console.log('✅ Esquema aplicado correctamente.');
  await pool.end();
};

run().catch((err) => {
  console.error('❌ Error aplicando el esquema:', err);
  process.exit(1);
});
