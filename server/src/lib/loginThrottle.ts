/**
 * Bloqueo temporal del login por cuenta (tabla `login_throttle`): cuenta los
 * fallos por email y bloquea 15 minutos tras 5 seguidos.
 */

import { pool } from '../db.js';

// El límite por IP (middleware/rateLimit.ts) no frena a quien reparte los
// intentos entre muchas IPs contra una misma cuenta, y vive en memoria (se
// pierde al reiniciar). Este bloqueo va por cuenta y en Postgres, así que
// cubre ambos huecos.
export const MAX_FAILED_LOGINS = 5;
const LOCK_SECONDS = 15 * 60;
// Los fallos antiguos dejan de contar: 4 fallos de hace una semana no
// deberían dejar a alguien a un intento del bloqueo.
const FAILURE_WINDOW_SECONDS = 15 * 60;
const STALE_ROW_SECONDS = 24 * 60 * 60;

export const getLockRemainingSeconds = async (email: string): Promise<number> => {
  const { rows } = await pool.query(
    `SELECT GREATEST(0, CEIL(EXTRACT(EPOCH FROM (locked_until - NOW()))))::int AS remaining
     FROM login_throttle WHERE email = $1 AND locked_until > NOW()`,
    [email]
  );
  return rows[0]?.remaining ?? 0;
};

export const recordFailedLogin = async (email: string): Promise<void> => {
  const { rows } = await pool.query(
    `INSERT INTO login_throttle AS t (email, failed_attempts, updated_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (email) DO UPDATE SET
       failed_attempts = CASE
         WHEN t.updated_at < NOW() - make_interval(secs => $2) OR t.locked_until < NOW() THEN 1
         ELSE t.failed_attempts + 1
       END,
       locked_until = CASE
         WHEN t.updated_at < NOW() - make_interval(secs => $2) OR t.locked_until < NOW() THEN NULL
         ELSE t.locked_until
       END,
       updated_at = NOW()
     RETURNING failed_attempts`,
    [email, FAILURE_WINDOW_SECONDS]
  );

  if (rows[0].failed_attempts >= MAX_FAILED_LOGINS) {
    await pool.query(`UPDATE login_throttle SET locked_until = NOW() + make_interval(secs => $2) WHERE email = $1`, [
      email,
      LOCK_SECONDS,
    ]);
  }

  // Un atacante puede sembrar filas con emails inventados; se limpian las
  // viejas aquí mismo (con índice en updated_at es barato) en vez de montar
  // un cron solo para esto.
  await pool.query(`DELETE FROM login_throttle WHERE updated_at < NOW() - make_interval(secs => $1)`, [
    STALE_ROW_SECONDS,
  ]);
};

export const clearFailedLogins = async (email: string): Promise<void> => {
  await pool.query('DELETE FROM login_throttle WHERE email = $1', [email]);
};

// Quien restablece la contraseña por email demuestra que controla la cuenta:
// sin esto tendría que esperar al final del bloqueo aun con la clave nueva.
export const clearFailedLoginsForUser = async (userId: string): Promise<void> => {
  await pool.query('DELETE FROM login_throttle WHERE email = (SELECT email FROM users WHERE id = $1)', [userId]);
};
