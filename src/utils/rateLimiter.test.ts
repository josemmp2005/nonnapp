/**
 * Tests unitarios de `rateLimiter.ts`: el limitador de llamadas a la IA
 * (`aiRateLimiter`).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiRateLimiter } from './rateLimiter';

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

  it('penalize() alarga la espera de la siguiente llamada más allá del intervalo normal de 5s', async () => {
    const calls: number[] = [];
    const ok = async () => {
      calls.push(Date.now());
    };

    const first = aiRateLimiter.execute(ok);
    await vi.runAllTimersAsync();
    await first;

    aiRateLimiter.penalize(20000);
    const second = aiRateLimiter.execute(ok);
    await vi.runAllTimersAsync();
    await second;

    expect(calls[1] - calls[0]).toBeGreaterThanOrEqual(20000);
  });
});
