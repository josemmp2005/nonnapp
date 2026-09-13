import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { pool, withTransaction } from '../db.js';
import { requireAuth, createSession, revokeSession, revokeAllUserSessions, SESSION_COOKIE } from '../middleware/auth.js';
import { isProd, env } from '../env.js';
import { sendMail } from '../lib/mailer.js';
import { getGoogleAuthUrl, exchangeGoogleCode, getGoogleUserInfo } from '../lib/google.js';
import { createStrictAuthRateLimiter, createTokenRateLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../lib/validate.js';
import {
  signupSchema,
  loginSchema,
  updateUsernameSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../lib/schemas.js';

const router = Router();

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 min
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000; // 1 min entre reenvíos por usuario

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toPublicUser = (row: {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  email_verified: boolean;
}) => ({
  id: row.id,
  email: row.email,
  username: row.username,
  avatar_url: row.avatar_url,
  email_verified: row.email_verified,
});

const sendVerificationEmail = async (userId: string, email: string, username: string) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

  await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  const verifyLink = `${env.appUrl}/verify-email?token=${rawToken}`;
  await sendMail(
    email,
    'Confirma tu email en Sabora',
    `<p>Hola <strong>${username}</strong>, confirma tu email para verificar tu cuenta de Sabora.</p>
     <p><a href="${verifyLink}">${verifyLink}</a></p>
     <p>El enlace caduca en 24 horas.</p>`,
    `Confirma tu email aquí: ${verifyLink} (caduca en 24 horas)`
  );
};

router.post('/signup', createStrictAuthRateLimiter(), validateBody(signupSchema), async (req, res) => {
  const { email, password, username } = req.body;
  const normalizedEmail = normalizeEmail(email);

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, username)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, avatar_url, email_verified`,
        [normalizedEmail, passwordHash, username.trim()]
      );
      const newUser = rows[0];

      await client.query(
        `INSERT INTO subscriptions (user_id, plan_type, is_active, start_date)
         VALUES ($1, 'nipote', true, NOW())`,
        [newUser.id]
      );
      await client.query(`INSERT INTO user_profiles (user_id) VALUES ($1)`, [newUser.id]);

      return newUser;
    });

    const { token } = await createSession(user.id);
    res.cookie(SESSION_COOKIE, token, cookieOptions);

    // Best-effort: un fallo de email no debe tumbar el registro.
    sendVerificationEmail(user.id, user.email, user.username).catch((err) =>
      console.warn('No se pudo enviar el email de verificación:', err)
    );
    sendMail(
      user.email,
      '¡Bienvenido a Sabora! 🍳',
      `<p>Hola <strong>${user.username}</strong>, gracias por unirte a Sabora.</p>`,
      `Hola ${user.username}, gracias por unirte a Sabora.`
    ).catch((err) => console.warn('No se pudo enviar el email de bienvenida:', err));

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('Error en signup:', err);
    return res.status(500).json({ error: 'No se pudo crear la cuenta' });
  }
});

router.post('/login', createStrictAuthRateLimiter(), validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const GENERIC_ERROR = { error: 'Credenciales inválidas' };
  const normalizedEmail = normalizeEmail(email);

  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, avatar_url, email_verified, password_hash FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json(GENERIC_ERROR);
    }

    const user = rows[0];
    // Cuentas creadas solo con Google no tienen password_hash — bcrypt.compare
    // lanzaría con un hash nulo, así que se corta aquí con el mismo error genérico.
    if (!user.password_hash) {
      return res.status(401).json(GENERIC_ERROR);
    }
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(GENERIC_ERROR);
    }

    const { token } = await createSession(user.id);
    res.cookie(SESSION_COOKIE, token, cookieOptions);
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

router.post('/logout', requireAuth, async (req, res) => {
  try {
    await revokeSession(req.sessionId!);
  } catch (err) {
    console.warn('Error revocando sesión en logout:', err);
  }
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions, maxAge: undefined });
  return res.status(204).send();
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, avatar_url, email_verified FROM users WHERE id = $1',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    return res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    console.error('Error en /me:', err);
    return res.status(500).json({ error: 'Error al obtener la sesión' });
  }
});

router.patch('/me', requireAuth, validateBody(updateUsernameSchema), async (req, res) => {
  const { username } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, email, username, avatar_url, email_verified`,
      [username.trim(), req.userId]
    );
    return res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

router.post('/update-password', requireAuth, validateBody(updatePasswordSchema), async (req, res) => {
  const { password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      passwordHash,
      req.userId,
    ]);
    // Un JWT robado de una sesión antigua no debe seguir sirviendo tras
    // cambiar la contraseña. La sesión actual (la que hizo el cambio) se
    // conserva para no desloguear a quien lo acaba de pedir.
    await revokeAllUserSessions(req.userId!, req.sessionId);
    return res.status(204).send();
  } catch (err) {
    console.error('Error actualizando contraseña:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  }
});

// Respuesta siempre genérica (evita confirmar/descartar si un email existe).
const GENERIC_FORGOT_RESPONSE = {
  message: 'Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.',
};

router.post('/forgot-password', createStrictAuthRateLimiter(), validateBody(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  try {
    const { rows } = await pool.query('SELECT id, email FROM users WHERE email = $1', [normalizedEmail]);

    if (rows.length > 0) {
      const user = rows[0];
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      const resetLink = `${env.appUrl}/reset-password?token=${rawToken}`;
      await sendMail(
        user.email,
        'Restablece tu contraseña de Sabora',
        `<p>Haz clic en el siguiente enlace para restablecer tu contraseña. Caduca en 30 minutos.</p>
         <p><a href="${resetLink}">${resetLink}</a></p>`,
        `Restablece tu contraseña aquí: ${resetLink}`
      );
    }

    return res.json(GENERIC_FORGOT_RESPONSE);
  } catch (err) {
    console.error('Error en forgot-password:', err);
    // No revelamos detalles del error tampoco: misma respuesta genérica.
    return res.json(GENERIC_FORGOT_RESPONSE);
  }
});

router.post('/reset-password', createTokenRateLimiter(), validateBody(resetPasswordSchema), async (req, res) => {
  const { token, password } = req.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const userId = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT id, user_id FROM password_reset_tokens
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
         FOR UPDATE`,
        [tokenHash]
      );

      if (rows.length === 0) {
        throw Object.assign(new Error('Token inválido o expirado'), { status: 400 });
      }

      const { id: tokenId, user_id: uid } = rows[0];
      const passwordHash = await bcrypt.hash(password, 12);

      await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
        passwordHash,
        uid,
      ]);
      await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [tokenId]);
      return uid as string;
    });

    // Quien pide un reset por email no tiene "sesión actual" que conservar:
    // se cierran todas, por si el token lo generó alguien con acceso a la
    // cuenta de correo pero no a las sesiones ya abiertas del dueño real.
    await revokeAllUserSessions(userId);

    return res.status(204).send();
  } catch (err: any) {
    if (err?.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error en reset-password:', err);
    return res.status(500).json({ error: 'No se pudo restablecer la contraseña' });
  }
});

router.post('/verify-email', createTokenRateLimiter(), validateBody(verifyEmailSchema), async (req, res) => {
  const { token } = req.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT id, user_id FROM email_verification_tokens
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
         FOR UPDATE`,
        [tokenHash]
      );

      if (rows.length === 0) {
        throw Object.assign(new Error('Enlace de verificación inválido o expirado'), { status: 400 });
      }

      const { id: tokenId, user_id: userId } = rows[0];
      await client.query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [userId]);
      await client.query('UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1', [tokenId]);
    });

    return res.status(204).send();
  } catch (err: any) {
    if (err?.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error en verify-email:', err);
    return res.status(500).json({ error: 'No se pudo verificar el email' });
  }
});

router.post('/resend-verification', requireAuth, createTokenRateLimiter(), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, email_verified FROM users WHERE id = $1',
      [req.userId]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'No autenticado' });
    if (user.email_verified) {
      return res.status(400).json({ error: 'El email ya está verificado' });
    }

    // Cooldown por usuario (además del rate limit por IP): evita que un
    // click repetido dispare de golpe muchos envíos SMTP y tumbe/limite la
    // cuenta de correo, o el proveedor la marque como spam.
    const { rows: lastTokenRows } = await pool.query(
      `SELECT created_at FROM email_verification_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const lastSentAt = lastTokenRows[0]?.created_at ? new Date(lastTokenRows[0].created_at) : null;
    if (lastSentAt) {
      const remainingMs = RESEND_VERIFICATION_COOLDOWN_MS - (Date.now() - lastSentAt.getTime());
      if (remainingMs > 0) {
        return res.status(429).json({
          error: 'Espera antes de volver a pedir el email de verificación.',
          retryAfterSeconds: Math.ceil(remainingMs / 1000),
        });
      }
    }

    await sendVerificationEmail(user.id, user.email, user.username);
    return res.status(204).send();
  } catch (err) {
    console.error('Error reenviando verificación:', err);
    return res.status(500).json({ error: 'No se pudo reenviar el email de verificación' });
  }
});

const GOOGLE_STATE_COOKIE = 'sabora_google_state';
const GOOGLE_STATE_TTL_MS = 10 * 60 * 1000; // 10 min, tiempo de sobra para completar el consentimiento

// Sin rate limiter aquí a propósito: es una navegación de página completa
// (<a href>), no un fetch — un límite alcanzado devolvería JSON en blanco en
// vez de una página real, y a diferencia de login/signup no hay credenciales
// que probar por fuerza bruta (el "state" lo genera el propio servidor).
router.get('/google', (_req, res) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.redirect(`${env.appUrl}/auth?error=google_not_configured`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: GOOGLE_STATE_TTL_MS,
    path: '/api/auth/google',
  });
  res.redirect(getGoogleAuthUrl(state));
});

router.get('/google/callback', async (req, res) => {
  const savedState = req.cookies?.[GOOGLE_STATE_COOKIE];
  res.clearCookie(GOOGLE_STATE_COOKIE, { path: '/api/auth/google' });

  const { code, state } = req.query;

  if (!env.googleClientId || !env.googleClientSecret) {
    return res.redirect(`${env.appUrl}/auth?error=google_not_configured`);
  }
  // El state va y vuelve en una cookie httpOnly propia (no en el body/query
  // que controla el cliente) — así un CSRF no puede colar su propio "code".
  if (typeof code !== 'string' || typeof state !== 'string' || !savedState || state !== savedState) {
    return res.redirect(`${env.appUrl}/auth?error=google_failed`);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const profile = await getGoogleUserInfo(tokens.access_token);

    if (!profile.email) {
      return res.redirect(`${env.appUrl}/auth?error=google_failed`);
    }
    const normalizedEmail = normalizeEmail(profile.email);

    const user = await withTransaction(async (client) => {
      const byGoogleId = await client.query(
        'SELECT id, email, username, avatar_url, email_verified FROM users WHERE google_id = $1',
        [profile.sub]
      );
      if (byGoogleId.rows.length > 0) return byGoogleId.rows[0];

      const byEmail = await client.query(
        'SELECT id, email, username, avatar_url, email_verified FROM users WHERE email = $1',
        [normalizedEmail]
      );
      if (byEmail.rows.length > 0) {
        // Ya existía una cuenta con ese email (creada con contraseña): se
        // enlaza la cuenta de Google y se marca el email verificado (Google
        // ya lo verificó — no hace falta nuestro propio email de verificación).
        const { rows } = await client.query(
          `UPDATE users SET google_id = $1, email_verified = true,
             avatar_url = COALESCE(avatar_url, $2), updated_at = NOW()
           WHERE id = $3
           RETURNING id, email, username, avatar_url, email_verified`,
          [profile.sub, profile.picture || null, byEmail.rows[0].id]
        );
        return rows[0];
      }

      const username = profile.name?.trim() || normalizedEmail.split('@')[0];
      const { rows: newUserRows } = await client.query(
        `INSERT INTO users (email, password_hash, username, avatar_url, google_id, email_verified)
         VALUES ($1, NULL, $2, $3, $4, true)
         RETURNING id, email, username, avatar_url, email_verified`,
        [normalizedEmail, username, profile.picture || null, profile.sub]
      );
      const newUser = newUserRows[0];

      await client.query(
        `INSERT INTO subscriptions (user_id, plan_type, is_active, start_date)
         VALUES ($1, 'nipote', true, NOW())`,
        [newUser.id]
      );
      await client.query(`INSERT INTO user_profiles (user_id) VALUES ($1)`, [newUser.id]);

      return newUser;
    });

    const { token } = await createSession(user.id);
    res.cookie(SESSION_COOKIE, token, cookieOptions);
    return res.redirect(`${env.appUrl}/app`);
  } catch (err) {
    console.error('Error en Google OAuth callback:', err);
    return res.redirect(`${env.appUrl}/auth?error=google_failed`);
  }
});

export default router;
