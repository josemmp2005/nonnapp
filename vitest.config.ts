/**
 * Configuración de Vitest del frontend: tests unitarios de lógica pura (los
 * archivos `.test.ts` de `src/`), sin DOM.
 */

import { defineConfig } from 'vitest/config';

// Tests unitarios de lógica pura del frontend (utils, helpers) — sin DOM/React
// rendering, así que no hace falta jsdom ni React Testing Library aquí.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
