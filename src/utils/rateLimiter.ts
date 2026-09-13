/**
 * Rate limiter para controlar llamadas a la API
 */

interface QueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private queue: QueueItem[] = [];
  private processing = false;
  private lastCallTime = 0;
  private minInterval = 5000; // 5 segundos para evitar rate limits de Gemini

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
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
}

// Instancia global
export const geminiRateLimiter = new RateLimiter();

/**
 * Cache simple para evitar llamadas duplicadas
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const recipeCache = new SimpleCache(5); // Cache por 5 minutos
