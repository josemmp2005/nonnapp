/**
 * Tests de la lógica de reintento del plan de suscripción: un fallo puntual
 * (p. ej. la cookie perdida en Safari/iOS) no debe verse como una bajada de
 * plan al gratis.
 */

import { describe, it, expect, vi } from 'vitest';
import { fetchSubscriptionWithRetry, resolveSubscriptionUpdate } from './subscriptionRetry';
import type { SubscriptionData } from '../types';

const nonna: SubscriptionData = { plan_type: 'Nonna', is_active: true, start_date: '2026-01-01', end_date: null };
const nipote: SubscriptionData = { plan_type: 'Nipote', is_active: true, start_date: null, end_date: null };

describe('fetchSubscriptionWithRetry', () => {
  it('devuelve el resultado si la primera llamada funciona, sin reintentar', async () => {
    const fetchOnce = vi.fn().mockResolvedValue(nonna);
    const result = await fetchSubscriptionWithRetry(fetchOnce, 1, 0);
    expect(result).toBe(nonna);
    expect(fetchOnce).toHaveBeenCalledTimes(1);
  });

  it('reintenta una vez si la primera falla, y devuelve el resultado del reintento', async () => {
    const fetchOnce = vi.fn().mockRejectedValueOnce(new Error('cookie perdida')).mockResolvedValueOnce(nonna);
    const result = await fetchSubscriptionWithRetry(fetchOnce, 1, 0);
    expect(result).toBe(nonna);
    expect(fetchOnce).toHaveBeenCalledTimes(2);
  });

  it('devuelve null (nunca lanza) si fallan todos los intentos', async () => {
    const fetchOnce = vi.fn().mockRejectedValue(new Error('caído del todo'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await fetchSubscriptionWithRetry(fetchOnce, 1, 0);
    expect(result).toBeNull();
    expect(fetchOnce).toHaveBeenCalledTimes(2); // intento inicial + 1 reintento
    errorSpy.mockRestore();
  });

  it('respeta el número de reintentos configurado', async () => {
    const fetchOnce = vi.fn().mockRejectedValue(new Error('x'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await fetchSubscriptionWithRetry(fetchOnce, 3, 0);
    expect(fetchOnce).toHaveBeenCalledTimes(4); // intento inicial + 3 reintentos
    errorSpy.mockRestore();
  });

  it('espera el retraso indicado entre intentos', async () => {
    vi.useFakeTimers();
    const fetchOnce = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(nonna);
    const promise = fetchSubscriptionWithRetry(fetchOnce, 1, 5000);
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchOnce).toHaveBeenCalledTimes(1); // aún no ha llegado el reintento
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe(nonna);
    expect(fetchOnce).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('resolveSubscriptionUpdate', () => {
  it('usa el resultado nuevo si la petición funcionó', () => {
    expect(resolveSubscriptionUpdate(nipote, nonna, nipote)).toBe(nonna);
  });

  it('mantiene el plan actual si la petición falló (fetched=null), en vez del gratis', () => {
    expect(resolveSubscriptionUpdate(nonna, null, nipote)).toBe(nonna);
  });

  it('cae al plan por defecto si la suscripción devuelta ya caducó', () => {
    const caducada: SubscriptionData = { plan_type: 'Nonna', is_active: true, start_date: '2020-01-01', end_date: '2020-06-01' };
    expect(resolveSubscriptionUpdate(nipote, caducada, nipote)).toBe(nipote);
  });
});
