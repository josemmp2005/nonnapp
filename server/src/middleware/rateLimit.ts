import rateLimit from 'express-rate-limit';

// Los tests de integración disparan muchos más intentos de login/signup en
// segundos de los que un usuario real haría en 15 minutos — sin esto,
// cualquier suite con más de 8 requests a /login (incluidos los intentos con
// password incorrecta a propósito) empezaría a fallar por 429, no por el
// comportamiento que se quiere probar. Solo se salta en NODE_ENV=test, nunca
// en producción.
const skipInTests = () => process.env.NODE_ENV === 'test';

// Cada ruta necesita SU PROPIA instancia (su propio store): reutilizar el
// mismo objeto middleware en /signup, /login y /forgot-password compartiría
// el contador entre las tres, y agotar los intentos de login bloquearía
// también el registro para la misma IP.
const authLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true as const,
  legacyHeaders: false,
  skip: skipInTests,
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
    skip: skipInTests,
    message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
  });

// Backstop montado sobre toda /api: límite generoso por IP para frenar abuso
// genérico (scraping, bots) sin molestar a un usuario normal navegando la app.
export const createApiRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTests,
    message: { error: 'Demasiadas peticiones. Inténtalo de nuevo en unos minutos.' },
  });

// /api/ai/*: cada llamada cuesta dinero real (API de Groq). Antes no tenía
// ningún límite propio — el único freno era el máximo de 2 recetas/día de
// Il Nipote, y ese límite se comprueba al GUARDAR la receta (routes/recipes.ts),
// no al generarla, así que cualquier cuenta (de cualquier plan) podía llamar a
// /generate-recipe en bucle sin guardar nada y quemar cuota sin límite. Se
// limita por usuario (no por IP) porque el coste lo genera la cuenta, no la IP.
export const createAiRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTests,
    keyGenerator: (req) => req.userId || req.ip || 'anonymous',
    message: { error: 'Demasiadas generaciones seguidas. Espera unos minutos antes de volver a intentarlo.' },
  });
