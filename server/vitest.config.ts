import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setup/env.ts', './tests/setup/db.ts'],
    // Los tests comparten una única base de datos de test (ver .env.test) y
    // aíslan entre sí truncando tablas en un beforeEach — correr varios
    // ficheros de test en paralelo haría que se pisaran los datos unos a
    // otros (el TRUNCATE de un archivo borraría las filas que otro archivo
    // está usando a la vez), así que van secuenciales.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 20000,
  },
});
