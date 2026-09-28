/**
 * Lógica pura (sin React) de `SubscriptionContext`: reintentar una vez la
 * petición del plan antes de rendirse, y decidir qué hacer con el resultado
 * sin pisar un plan ya conocido si la petición sigue fallando.
 */

import type { SubscriptionData } from '../types';

// Antes, un solo fallo de red ponía el plan gratis en silencio — en Safari/iOS
// la cookie de sesión a veces se pierde en una petición suelta (cross-site,
// ver README → "Implementaciones futuras"), así que una cuenta de pago podía
// verse como Il Nipote sin haber cambiado de plan. Un reintento corto absorbe
// ese tropiezo puntual sin esperar tanto como para notarse.
export const SUBSCRIPTION_FETCH_RETRIES = 1;
export const SUBSCRIPTION_RETRY_DELAY_MS = 800;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// `fetchOnce` se inyecta para poder probar esto sin red real ni temporizadores
// de verdad. Devuelve `null` si todos los intentos fallan (nunca lanza).
export const fetchSubscriptionWithRetry = async (
  fetchOnce: () => Promise<SubscriptionData>,
  retries: number = SUBSCRIPTION_FETCH_RETRIES,
  delayMs: number = SUBSCRIPTION_RETRY_DELAY_MS
): Promise<SubscriptionData | null> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchOnce();
    } catch (err) {
      if (attempt >= retries) {
        console.error('Failed to load subscription:', err);
        return null;
      }
      await wait(delayMs);
    }
  }
};

// `fetched` es `null` cuando la petición (con reintento) ha fallado del todo:
// en ese caso se mantiene `current` tal cual en vez de sustituirlo por el plan
// gratis — un tropiezo de red no debe verse como una bajada de plan.
export const resolveSubscriptionUpdate = (
  current: SubscriptionData,
  fetched: SubscriptionData | null,
  defaultSubscription: SubscriptionData
): SubscriptionData => {
  if (fetched === null) return current;
  if (fetched.end_date && new Date(fetched.end_date) < new Date()) return defaultSubscription;
  return fetched;
};
