/**
 * Elige entre una imagen clara y una oscura según el tema, y sigue si ya
 * terminó de cargar (para hacerla aparecer con un fundido en vez de golpe).
 * Al cambiar el tema el `<img>` cambia de `src`, así que vuelve a "no
 * cargada" para esperar la nueva. Mismo patrón que usaban por separado el
 * fondo del dashboard (Layout.tsx) y el del login (Auth.tsx).
 *
 * El reseteo se hace ajustando el estado durante el propio render (comparando
 * con el tema del render anterior) en vez de con un efecto — evita una vuelta
 * de render de más y es el patrón que recomienda React para "resetear estado
 * cuando cambia una prop" (https://react.dev/learn/you-might-not-need-an-effect).
 */

import { useState } from 'react';

export const useThemedImage = (theme: 'light' | 'dark', lightSrc: string, darkSrc: string) => {
  const [prevTheme, setPrevTheme] = useState(theme);
  const [loaded, setLoaded] = useState(false);

  if (theme !== prevTheme) {
    setPrevTheme(theme);
    setLoaded(false);
  }

  return {
    src: theme === 'dark' ? darkSrc : lightSrc,
    loaded,
    onLoad: () => setLoaded(true),
  };
};
