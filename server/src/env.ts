import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (server/.env)`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: required('JWT_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  // Brevo (API HTTP, no SMTP) — SMTP saliente está bloqueado en el plan
  // gratuito de Render (y de otros PaaS similares), ver server/src/lib/mailer.ts.
  // El remitente debe ser un email verificado en Brevo (Senders, Domains &
  // Dedicated IPs → Senders) — no hace falta un dominio propio.
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoFrom: process.env.BREVO_FROM || 'Nonnapp <no-reply@example.com>',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI || `http://localhost:${Number(process.env.PORT) || 3001}/api/auth/google/callback`,
};

export const isProd = env.nodeEnv === 'production';
