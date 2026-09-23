import { afterEach, describe, expect, it, vi } from 'vitest';

// env.ts lee process.env al importarse, así que cada caso vuelve a importarlo.
const loadEnv = async () => {
  vi.resetModules();
  return (await import('../src/env.js')).env;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env.googleRedirectUri', () => {
  it('usa GOOGLE_REDIRECT_URI si está definida', async () => {
    vi.stubEnv('GOOGLE_REDIRECT_URI', 'https://api.ejemplo.com/api/auth/google/callback');
    vi.stubEnv('RENDER_EXTERNAL_URL', 'https://otra.onrender.com');
    const env = await loadEnv();
    // La explícita gana incluso si Render inyecta su propia URL
    expect(env.googleRedirectUri).toBe('https://api.ejemplo.com/api/auth/google/callback');
  });

  it('en Render se deriva de RENDER_EXTERNAL_URL, sin barra final duplicada', async () => {
    vi.stubEnv('GOOGLE_REDIRECT_URI', '');
    vi.stubEnv('RENDER_EXTERNAL_URL', 'https://sabora-api.onrender.com/');
    const env = await loadEnv();
    expect(env.googleRedirectUri).toBe('https://sabora-api.onrender.com/api/auth/google/callback');
  });

  it('en local cae a localhost con el puerto configurado', async () => {
    vi.stubEnv('GOOGLE_REDIRECT_URI', '');
    vi.stubEnv('RENDER_EXTERNAL_URL', '');
    vi.stubEnv('PORT', '3001');
    const env = await loadEnv();
    expect(env.googleRedirectUri).toBe('http://localhost:3001/api/auth/google/callback');
  });
});
