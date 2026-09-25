/**
 * Lee y valida las variables de entorno del servidor (`server/.env`) y las
 * expone ya normalizadas, con avisos de configuración para el log de arranque.
 */

import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (server/.env)`);
  }
  return value;
};

const trimSlash = (url?: string): string | undefined => url?.trim().replace(/\/+$/, '') || undefined;
const isLocalUrl = (url?: string): boolean => !!url && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(url);

const nodeEnv = process.env.NODE_ENV || 'development';
const inProd = nodeEnv === 'production';
const port = Number(process.env.PORT) || 3001;

// Avisos de configuración que index.ts escribe en el log al arrancar. Se
// recogen aquí porque es donde se detectan (env.ts se importa en muchos sitios
// y en los tests, y no debe escribir en consola por su cuenta).
export const envWarnings: string[] = [];

// Render inyecta RENDER_EXTERNAL_URL (la URL pública del propio servicio, p.ej.
// https://nonnapp-api.onrender.com) en todos los Web Services. Se usa como base
// por defecto del callback de Google para que en producción no caiga en
// silencio a localhost — que Google rechaza con `redirect_uri_mismatch`.
const publicApiUrl = trimSlash(process.env.RENDER_EXTERNAL_URL);

// CORS_ORIGIN es la URL del frontend y sin ella bien puesta la app ni siquiera
// funciona en producción (el navegador bloquea las peticiones), así que es la
// referencia fiable para todo lo demás que necesite esa URL.
const corsOrigin = trimSlash(process.env.CORS_ORIGIN) || 'http://localhost:5173';

// APP_URL = base del frontend para lo que el servidor manda al usuario: los
// redirects tras el login con Google y los links de los emails (verificar,
// reset de contraseña, bienvenida). Si no se define, se usa CORS_ORIGIN: así,
// con solo esa variable bien puesta, nada apunta a localhost en producción.
let appUrl = trimSlash(process.env.APP_URL) || corsOrigin;
if (inProd && isLocalUrl(appUrl) && !isLocalUrl(corsOrigin)) {
  // Un APP_URL de localhost en producción solo puede ser el valor del .env
  // local copiado al PaaS: los redirects y los emails llevarían al usuario a
  // su propio localhost.
  envWarnings.push(`APP_URL (${appUrl}) apunta a localhost en producción; se usa CORS_ORIGIN (${corsOrigin}) en su lugar.`);
  appUrl = corsOrigin;
}

// Debe coincidir CARÁCTER A CARÁCTER con una de las "URI de redireccionamiento
// autorizados" del cliente OAuth en Google Cloud Console. Prioridad: la
// variable explícita > la URL pública de Render > localhost (solo desarrollo).
const derivedGoogleRedirect = publicApiUrl
  ? `${publicApiUrl}/api/auth/google/callback`
  : `http://localhost:${port}/api/auth/google/callback`;
let googleRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || derivedGoogleRedirect;
if (inProd && publicApiUrl && isLocalUrl(googleRedirectUri)) {
  // Mismo caso: con localhost Google devolvería al usuario a su propio
  // localhost:3001 en vez de al backend desplegado.
  envWarnings.push(`GOOGLE_REDIRECT_URI (${googleRedirectUri}) apunta a localhost en producción; se usa ${derivedGoogleRedirect} en su lugar.`);
  googleRedirectUri = derivedGoogleRedirect;
}

export const env = {
  port,
  nodeEnv,
  jwtSecret: required('JWT_SECRET'),
  corsOrigin,
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  // Brevo (API HTTP, no SMTP) — SMTP saliente está bloqueado en el plan
  // gratuito de Render (y de otros PaaS similares), ver server/src/lib/mailer.ts.
  // El remitente debe ser un email verificado en Brevo (Senders, Domains &
  // Dedicated IPs → Senders) — no hace falta un dominio propio.
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoFrom: process.env.BREVO_FROM || 'Nonnapp <no-reply@example.com>',
  appUrl,
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri,
};

export const isProd = env.nodeEnv === 'production';
