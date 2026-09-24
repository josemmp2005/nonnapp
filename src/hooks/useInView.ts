/**
 * Hook `useInView`: indica si un elemento ha entrado en pantalla
 * (IntersectionObserver), para animarlo al hacer scroll.
 */

import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

// IntersectionObserver propio en vez de una librería de animación — el
// rediseño de la landing solo necesita "revelar al entrar en viewport",
// no gestos/drag/layout animations, así que no justifica añadir Framer
// Motion. `once` (por defecto true) evita que las secciones parpadeen si
// el usuario sube y baja la página.
export const useInView = <T extends HTMLElement = HTMLDivElement>(options: Options = {}) => {
  const { threshold = 0.2, rootMargin = '0px 0px -10% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  // Si el usuario prefiere menos movimiento, se muestra directamente sin
  // esperar a la intersección — no tiene sentido "revelar" con un fade.
  // Calculado en el inicializador de useState (no dentro del efecto) para
  // no disparar un setState síncrono en el primer render.
  const [isInView, setIsInView] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (isInView) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, isInView]);

  return { ref, isInView };
};
