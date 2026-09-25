/**
 * Punto de entrada del frontend: carga estilos e i18n, recarga la página si un
 * módulo cargado con `lazy()` ya no existe tras un despliegue nuevo, captura el
 * aviso de instalación de la PWA y monta `<App />` en `#root`.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import './utils/pwaInstall' // registra `beforeinstallprompt` antes de que monte nada

// Cada despliegue genera archivos con un hash nuevo (LandingPage-XXXX.js) y
// borra los de la versión anterior. Quien tuviera la pestaña abierta desde
// antes (o la app instalada como PWA con el service worker cacheando la
// versión vieja) intenta cargar un lazy() apuntando a un chunk que ya no
// existe → "Failed to fetch dynamically imported module". Vite dispara este
// evento antes de que el import rechace la promesa; recargar trae el
// index.html y el mapa de módulos ya actualizados. Como mucho una vez por
// pestaña — si el despliegue estuviera roto de verdad, evita un bucle.
window.addEventListener('vite:preloadError', () => {
  const FLAG = 'nonnapp_reloaded_after_preload_error';
  if (sessionStorage.getItem(FLAG)) return;
  sessionStorage.setItem(FLAG, 'true');
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)