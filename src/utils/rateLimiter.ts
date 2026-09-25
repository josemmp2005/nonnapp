/**
 * Espaciador de llamadas a la IA: encola y las separa un mínimo de tiempo
 * entre sí para no saturar la cuota de Groq.
 */

interface QueueItem {
  fn: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

class RateLimiter {
  private queue: QueueItem[] = [];
  private processing = false;
  private lastCallTime = 0;
  private minInterval = 5000; // 5 segundos entre llamadas a la IA (Groq)

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // La cola es heterogénea (una única lista sirve llamadas con distintos
      // T) — de ahí el cast puntual aquí en vez de un `any` genérico en toda
      // la interfaz; en tiempo de ejecución cada `resolve` sigue siendo el
      // de su propia promesa, con su T real.
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      // Esperar si no ha pasado suficiente tiempo
      if (timeSinceLastCall < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastCall;
        console.log(`⏳ Rate limiter: esperando ${waitTime}ms antes de la siguiente llamada`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const item = this.queue.shift();
      if (!item) break;

      try {
        this.lastCallTime = Date.now();
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        console.error('❌ Error en rate limiter:', error);
        item.reject(error);
      }
    }

    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  // Tras un 429 real de Groq (límite de tokens/minuto), la siguiente llamada
  // debe esperar más que el intervalo normal de 5s — si no, el primer
  // reintento (manual o el siguiente de la cola) vuelve a chocar con el mismo
  // límite. `Math.max` evita acortar una espera ya en curso más larga.
  penalize(extraMs: number): void {
    this.lastCallTime = Math.max(this.lastCallTime, Date.now() + extraMs - this.minInterval);
  }
}

// Instancia global
export const aiRateLimiter = new RateLimiter();
