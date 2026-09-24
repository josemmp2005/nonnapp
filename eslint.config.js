/**
 * Configuración de ESLint del frontend: reglas de TypeScript, React Hooks y
 * React Refresh para `src/`. El backend (`server/`) queda fuera.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // server/ es un backend Node aparte (sin este eslint.config.js — no tiene
  // linter propio todavía): no debería recibir reglas pensadas para
  // React/navegador.
  globalIgnores(['dist', 'server']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
