/**
 * Punto de entrada del frontend: registra la escucha de instalación de la PWA,
 * carga estilos e i18n y monta `<App />` en `#root`.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/pwaInstall' // registra `beforeinstallprompt` antes de que monte nada
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)