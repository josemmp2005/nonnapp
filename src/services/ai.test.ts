/**
 * Tests de `generateRecipeAI`: cada generación debe llamar de verdad a la
 * API, incluso con el mismo prompt que la llamada anterior — el resultado de
 * la IA es no determinista a propósito (temperature > 0), así que cachear por
 * inputs deja "Sorpréndeme"/"Desayuno rápido"/"Modo Fit" repitiendo la misma
 * receta hasta recargar la página.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./api', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status: number, data?: unknown) {
      super(message);
      this.status = status;
      this.data = data;
    }
  },
}));

import { apiFetch, ApiError } from './api';
import { generateRecipeAI, AiRateLimitedError } from './ai';

const recipeResponse = (title: string) => ({
  success: true,
  data: { recipe_metadata: { title, description: '', difficulty: 'Fácil', cooking_time: '10 min', servings: 2, calories: 100 }, ingredients: [], utensils: [], steps: [] },
  imageUrl: `${title}.jpg`,
});

describe('generateRecipeAI', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('llama a la API en cada generación aunque el prompt sea idéntico al de la anterior', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(recipeResponse('Primera')).mockResolvedValueOnce(recipeResponse('Segunda'));

    const p1 = generateRecipeAI('Sorpréndeme con algo exótico', 'text');
    await vi.runAllTimersAsync();
    const r1 = await p1;

    const p2 = generateRecipeAI('Sorpréndeme con algo exótico', 'text');
    await vi.runAllTimersAsync();
    const r2 = await p2;

    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(r1.recipe.recipe_metadata.title).toBe('Primera');
    expect(r2.recipe.recipe_metadata.title).toBe('Segunda');
  });

  it('convierte un 429 AI_RATE_LIMITED en AiRateLimitedError y frena la siguiente llamada', async () => {
    // aiRateLimiter es un singleton compartido con el test anterior de este
    // mismo archivo — se fija el reloj muy por delante de cualquier
    // `lastCallTime` que pudiera arrastrarse, para que este test no herede
    // una espera que no le corresponde (mismo motivo que en rateLimiter.test.ts).
    vi.setSystemTime(new Date(2999, 0, 1));
    vi.mocked(apiFetch).mockRejectedValueOnce(new ApiError('AI_RATE_LIMITED', 429));

    const p1 = generateRecipeAI('pollo al horno', 'text');
    // El `.rejects` se encadena YA (no tras el runAllTimersAsync) para que la
    // promesa tenga un handler desde el principio — si no, Node la marca como
    // "unhandled rejection" en el instante en que se resuelve durante el
    // flush de temporizadores, aunque más abajo sí se compruebe.
    const p1Rejects = expect(p1).rejects.toBeInstanceOf(AiRateLimitedError);
    await vi.runAllTimersAsync();
    await p1Rejects;

    // Tras el 429, la siguiente llamada debe esperar más que el intervalo
    // normal de 5s (el cooldown que impone `penalize`) antes de disparase.
    const callTimes: number[] = [];
    vi.mocked(apiFetch).mockImplementationOnce(async () => {
      callTimes.push(Date.now());
      return recipeResponse('Tras el cooldown');
    });
    const start = Date.now();
    const p2 = generateRecipeAI('pollo al horno', 'text');
    await vi.runAllTimersAsync();
    await p2;

    expect(callTimes[0] - start).toBeGreaterThanOrEqual(10000);
  });
});
