/**
 * Configuración de Vite: plugin de React y de PWA (manifest, iconos y service
 * worker que solo cachea estáticos, nunca las llamadas a `/api`).
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Solo cachea los archivos estáticos del build (JS/CSS/HTML/imágenes) —
      // nunca las llamadas a /api/*, que siempre necesitan red real (auth,
      // generación de recetas, chat). Sin `runtimeCaching` para /api aquí a
      // propósito: así el service worker las deja pasar sin tocarlas.
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Nonnapp - Tu Chef IA Personal',
        short_name: 'Nonnapp',
        description:
          'Genera recetas de cocina únicas al instante con IA. Modo despensa para cocinar con lo que tienes.',
        lang: 'es',
        theme_color: '#F97316',
        background_color: '#FCF6EC',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
