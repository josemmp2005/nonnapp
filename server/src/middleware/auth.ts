import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { pool } from '../db.js';

export const SESSION_COOKIE = 'sabora_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

interface AccessTokenPayload {
  sub: string; // user id
  sid: string; // session id (fila en `sessions`, permite revocar)
}

// Crea la fila de sesión en BBDD y firma el JWT que la referencia. Se usa en
// signup y login. Devolver también sessionId permite a la propia ruta que
// llama guardarlo si necesita revocar "todas las sesiones menos esta".
export const createSession = async (userId: string): Promise<{ token: string; sessionId: string }> => {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
    [userId, expiresAt]
  );
  const sessionId = rows[0].id;
  const token = jwt.sign({ sub: userId, sid: sessionId } satisfies AccessTokenPayload, env.jwtSecret, {
    expiresIn: '7d',
  });
  return { token, sessionId };
};

export const revokeSession = async (sessionId: string): Promise<void> => {
  await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = $1`, [sessionId]);
};

// Cambio de contraseña / reset: invalida sesiones robadas sin desloguear
// necesariamente la que está haciendo el cambio (si se pasa exceptSessionId).
export const revokeAllUserSessions = async (userId: string, exceptSessionId?: string): Promise<void> => {
  if (exceptSessionId) {
    await pool.query(
      `UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND id != $2 AND revoked_at IS NULL`,
      [userId, exceptSessionId]
    );
  } else {
    await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
  }
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      emailVerified?: boolean;
    }
  }
}

// Une la verificación del JWT con la comprobación en BBDD de que la sesión
// sigue viva (no revocada, no expirada) en una sola query. También trae
// email_verified para que requireVerifiedEmail no necesite otra consulta.
const loadSession = async (token: string) => {
  const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;

  const { rows } = await pool.query<{ user_id: string; revoked_at: string | null; expires_at: string; email_verified: boolean }>(
    `SELECT s.user_id, s.revoked_at, s.expires_at, u.email_verified
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1`,
    [payload.sid]
  );

  const row = rows[0];
  if (!row || row.user_id !== payload.sub) return null;
  if (row.revoked_at) return null;
  if (new Date(row.expires_at) <= new Date()) return null;

  return { userId: row.user_id, sessionId: payload.sid, emailVerified: row.email_verified };
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const session = await loadSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
    req.userId = session.userId;
    req.sessionId = session.sessionId;
    req.emailVerified = session.emailVerified;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
};

// Requiere email verificado. Se monta DESPUÉS de requireAuth (usa lo que este
// ya cargó, sin otra consulta). Bloquea todas las rutas de "usar la app"
// (recipes/profile/subscription/ai) hasta que el usuario verifica su email;
// las rutas de gestión de la cuenta (me, logout, update-password,
// resend-verification) siguen abiertas para que pueda salir del bloqueo.
export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.emailVerified) {
    return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED' });
  }
  next();
};

// Para rutas que quieren saber quién llama sin exigirlo (ninguna de momento,
// pero evita repetir el try/catch si hace falta en el futuro).
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    try {
      const session = await loadSession(token);
      if (session) {
        req.userId = session.userId;
        req.sessionId = session.sessionId;
        req.emailVerified = session.emailVerified;
      }
    } catch {
      // token inválido: se ignora, sigue como anónimo
    }
  }
  next();
};
