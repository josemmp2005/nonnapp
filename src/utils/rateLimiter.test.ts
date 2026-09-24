/**
 * Tests unitarios de `rateLimiter.ts`: el limitador de llamadas a la IA
 * (`aiRateLimiter`) y la caché con caducidad (`recipeCache`).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiRateLimiter, recipeCache } from './rateLimiter';

describe('RateLimiter (aiRateLimiter)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // aiRateLimiter es un singleton compartido por todo el módulo (sin forma
  // de resetear lastCallTime entre tests) — todo en un único `it` para que
  // el estado de una aserción no contamine la siguiente con temporizadores
  // falsos de sesiones distintas.
  it('encola llamadas, las espacía al menos 5s entre sí, y un fallo no rompe la cola', async () => {
    const calls: number[] = [];
    const ok = async (label: string) => {
      calls.push(Date.now());
      return label;
    };

    const first = aiRateLimiter.execute(() => ok('primera'));
    const second = aiRateLimiter.execute(() => ok('segunda'));
    // El `.rejects` se encadena aquí mismo (no tras el runAllTimersAsync) para
    // que la promesa tenga un handler desde el principio — si no, Vitest la
    // marca como "unhandled rejection" en el instante en que se resuelve
    // durante el flush de temporizadores, aunque más abajo sí se comprueba.
    const failingAssertion = expect(
      aiRateLimiter.execute(async () => {
        throw new Error('fallo simulado');
      })
    ).rejects.toThrow('fallo simulado');
    const afterFailure = aiRateLimiter.execute(() => ok('tras el fallo'));

    await vi.runAllTimersAsync();

    await expect(first).resolves.toBe('primera');
    await expect(second).resolves.toBe('segunda');
    await failingAssertion;
    await expect(afterFailure).resolves.toBe('tras el fallo');

    expect(calls).toHaveLength(3);
    expect(calls[1] - calls[0]).toBeGreaterThanOrEqual(5000);
    expect(calls[2] - calls[1]).toBeGreaterThanOrEqual(5000);
  });
});

describe('SimpleCache (recipeCache)', () => {
  beforeEach(() => {
    recipeCache.clear();
  });

  it('guarda y devuelve un valor', () => {
    recipeCache.set('key1', { foo: 'bar' });
    expect(recipeCache.get('key1')).toEqual({ foo: 'bar' });
  });

  it('devuelve null para una clave que no existe', () => {
    expect(recipeCache.get('no-existe')).toBeNull();
  });

  it('expira una entrada pasado el TTL (5 min)', () => {
    vi.useFakeTimers();
    try {
      recipeCache.set('key1', 'valor');
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(recipeCache.get('key1')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clear() vacía la caché', () => {
    recipeCache.set('a', 1);
    recipeCache.set('b', 2);
    recipeCache.clear();
    expect(recipeCache.size()).toBe(0);
  });
});
