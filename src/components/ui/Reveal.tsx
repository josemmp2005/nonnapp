import React from 'react';
import { useInView } from '../../hooks/useInView';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

// Fade al entrar en viewport. Sustituye a un "animate-in" fijo en el mount
// (que no distingue si la sección ya estaba visible al cargar o si se llega
// a ella haciendo scroll) por algo que reacciona de verdad al scroll, sin
// librería de animación. Solo opacity (nada de translate-y): el
// IntersectionObserver dispara casi al instante para todo lo que ya es
// visible al cargar la página (hero, stats...), así que un desplazamiento
// ahí cuenta como Cumulative Layout Shift real para Lighthouse aunque sea
// solo un transform. Siempre renderiza un <div> — como elemento de flex/grid
// se comporta igual que un <span> para el layout, así que no hace falta
// soportar una etiqueta variable (y su lío de tipos de `ref`) solo por eso.
// Compartido entre la landing y el resto de la app (originalmente solo vivía
// en landing/shared.tsx).
export const Reveal: React.FC<RevealProps> = ({ children, className = '', delayMs = 0 }) => {
  const { ref, isInView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        isInView ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ transitionDelay: isInView ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};
