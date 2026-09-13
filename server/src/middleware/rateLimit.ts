import rateLimit from 'express-rate-limit';

// Cada ruta necesita SU PROPIA instancia (su propio store): reutilizar el
// mismo objeto middleware en /signup, /login y /forgot-password compartiría
// el contador entre las tres, y agotar los intentos de login bloquearía
// también el registro para la misma IP.
const authLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true as const,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
};

// Login/signup/forgot-password: el objetivo típico de fuerza bruta y de
// registro masivo con emails falsos. 8 intentos / 15 min por IP, cada ruta
// con su propio contador.
export const createStrictAuthRateLimiter = () => rateLimit(authLimiterConfig);

// reset-password / verify-email / resend: ya exigen un token de un solo uso,
// pero se limita igual para no dejar la ruta abierta a fuerza bruta del token.
export const createTokenRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
  });
