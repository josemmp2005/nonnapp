/**
 * Tests de `env.ts`: cómo se derivan `googleRedirectUri` y `appUrl` según las
 * variables de entorno.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

// env.ts lee process.env al importarse, así que cada caso vuelve a importarlo.
// dotenv/config no pisa variables ya definidas (aunque estén vacías), por eso
// los casos ponen '' en lo que no quieren que salga de server/.env.
const loadEnv = async () => {
  vi.resetModules();
  return import('../src/env.js');
};

const stub = (vars: Record<string, string>) => {
  for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env.googleRedirectUri', () => {
  it('usa GOOGLE_REDIRECT_URI si está definida', async () => {
    stub({
      GOOGLE_REDIRECT_URI: 'https://api.ejemplo.com/api/auth/google/callback',
      RENDER_EXTERNAL_URL: 'https://otra.onrender.com',
    });
    const { env } = await loadEnv();
    // La explícita gana incluso si Render inyecta su propia URL
    expect(env.googleRedirectUri).toBe('https://api.ejemplo.com/api/auth/google/callback');
  });

  it('en Render se deriva de RENDER_EXTERNAL_URL, sin barra final duplicada', async () => {
    stub({ GOOGLE_REDIRECT_URI: '', RENDER_EXTERNAL_URL: 'https://nonnapp-api.onrender.com/' });
    const { env } = await loadEnv();
    expect(env.googleRedirectUri).toBe('https://nonnapp-api.onrender.com/api/auth/google/callback');
  });

  it('en local cae a localhost con el puerto configurado', async () => {
    stub({ GOOGLE_REDIRECT_URI: '', RENDER_EXTERNAL_URL: '', PORT: '3001' });
    const { env } = await loadEnv();
    expect(env.googleRedirectUri).toBe('http://localhost:3001/api/auth/google/callback');
  });

  it('en producción, un GOOGLE_REDIRECT_URI de localhost (copiado del .env local) se sustituye por la URL pública de Render', async () => {
    stub({
      NODE_ENV: 'production',
      GOOGLE_REDIRECT_URI: 'http://localhost:3001/api/auth/google/callback',
      RENDER_EXTERNAL_URL: 'https://nonnapp-api.onrender.com',
    });
    const { env, envWarnings } = await loadEnv();
    expect(env.googleRedirectUri).toBe('https://nonnapp-api.onrender.com/api/auth/google/callback');
    expect(envWarnings.some((w) => w.includes('GOOGLE_REDIRECT_URI'))).toBe(true);
  });

  it('en desarrollo un GOOGLE_REDIRECT_URI de localhost se respeta tal cual', async () => {
    stub({
      NODE_ENV: 'development',
      GOOGLE_REDIRECT_URI: 'http://localhost:3001/api/auth/google/callback',
      RENDER_EXTERNAL_URL: '',
    });
    const { env, envWarnings } = await loadEnv();
    expect(env.googleRedirectUri).toBe('http://localhost:3001/api/auth/google/callback');
    expect(envWarnings).toEqual([]);
  });
});

describe('env.appUrl (redirects tras Google y links de los emails)', () => {
  it('usa APP_URL si está definida', async () => {
    stub({ APP_URL: 'https://app.ejemplo.com', CORS_ORIGIN: 'https://otra.ejemplo.com' });
    const { env } = await loadEnv();
    expect(env.appUrl).toBe('https://app.ejemplo.com');
  });

  it('sin APP_URL usa CORS_ORIGIN (quitando la barra final)', async () => {
    stub({ APP_URL: '', CORS_ORIGIN: 'https://nonnapp.vercel.app/' });
    const { env } = await loadEnv();
    expect(env.appUrl).toBe('https://nonnapp.vercel.app');
    expect(env.corsOrigin).toBe('https://nonnapp.vercel.app');
  });

  it('sin ninguna de las dos usa el frontend de desarrollo', async () => {
    stub({ APP_URL: '', CORS_ORIGIN: '' });
    const { env } = await loadEnv();
    expect(env.appUrl).toBe('http://localhost:5173');
  });

  it('en producción, un APP_URL de localhost con un CORS_ORIGIN real usa CORS_ORIGIN y avisa', async () => {
    stub({ NODE_ENV: 'production', APP_URL: 'http://localhost:5173', CORS_ORIGIN: 'https://nonnapp.vercel.app' });
    const { env, envWarnings } = await loadEnv();
    expect(env.appUrl).toBe('https://nonnapp.vercel.app');
    expect(envWarnings.some((w) => w.includes('APP_URL'))).toBe(true);
  });

  it('en producción con todo en localhost (docker-compose local) no se toca', async () => {
    stub({ NODE_ENV: 'production', APP_URL: 'http://localhost:8082', CORS_ORIGIN: 'http://localhost:8082' });
    const { env, envWarnings } = await loadEnv();
    expect(env.appUrl).toBe('http://localhost:8082');
    expect(envWarnings).toEqual([]);
  });
});
