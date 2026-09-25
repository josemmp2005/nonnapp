/**
 * Tokens de un solo uso (recuperación de contraseña, verificación de email):
 * generarlos y consumirlos es exactamente el mismo patrón en las dos tablas
 * (`password_reset_tokens`, `email_verification_tokens`), antes repetido en
 * cada ruta de auth.ts.
 */

import crypto from 'node:crypto';
import type { PoolClient } from 'pg';

export type OneTimeTokenTable = 'password_reset_tokens' | 'email_verification_tokens';

export const hashToken = (raw: string): string => crypto.createHash('sha256').update(raw).digest('hex');

// El valor crudo va en el link del email; solo su hash se guarda en BBDD (un
// volcado de la tabla no basta para suplantar el link de nadie).
export const generateToken = (): { raw: string; hash: string } => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
};

// Busca y bloquea (FOR UPDATE) un token válido y sin usar, dentro de una
// transacción ya abierta, y lo marca usado en el mismo paso. Lanza con
// `status: 400` si no existe, expiró o ya se usó — cada ruta decide qué
// actualizar en `users` a partir del `userId` que devuelve.
export const consumeToken = async (
  client: PoolClient,
  table: OneTimeTokenTable,
  rawToken: string,
  invalidMessage: string
): Promise<{ userId: string }> => {
  const { rows } = await client.query(
    `SELECT id, user_id FROM ${table} WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE`,
    [hashToken(rawToken)]
  );

  if (rows.length === 0) {
    throw Object.assign(new Error(invalidMessage), { status: 400 });
  }

  await client.query(`UPDATE ${table} SET used_at = NOW() WHERE id = $1`, [rows[0].id]);
  return { userId: rows[0].user_id };
};
