/**
 * Aplica `schema.sql` a la BBDD. Es idempotente, así que se ejecuta en cada
 * arranque del servidor.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// schema.sql es puro CREATE TABLE IF NOT EXISTS / ALTER ... ADD COLUMN IF NOT
// EXISTS — aplicarlo de más no rompe nada, así que es seguro llamarlo en cada
// arranque del servidor (necesario en un PaaS gratuito tipo Render, donde no
// hay forma cómoda de correr un paso de "migración" aparte antes del deploy).
export const applySchema = async (): Promise<void> => {
  const sql = readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');
  await pool.query(sql);
};
