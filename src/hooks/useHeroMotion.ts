import { useEffect } from 'react';
import type { RefObject } from 'react';

// Alimenta el movimiento continuo del hero (ver .hero-depth-* en index.css):
//  - --mx / --my: posición del ratón dentro de la sección, de -1 a 1 (solo
//    ratón: en táctil no hay puntero que seguir).
//  - --sy: cuánto se ha desplazado la página por encima del hero, de 0 a 1.
// Además marca la sección con `hero-paused` cuando no se ve, para que el CSS
// pause las animaciones infinitas y no gaste batería. Con
// prefers-reduced-motion no hace nada (el CSS tampoco anima).
export const useHeroMotion = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let mx = 0;
    let my = 0;
    let sy = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty('--mx', mx.toFixed(3));
      el.style.setProperty('--my', my.toFixed(3));
      el.style.setProperty('--sy', sy.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      schedule();
    };
    const onPointerLeave = () => {
      mx = 0;
      my = 0;
      schedule();
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      sy = Math.max(0, Math.min(1, -r.top / r.height));
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => {
      el.classList.toggle('hero-paused', !entry.isIntersecting);
    });
    observer.observe(el);

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ref]);
};
