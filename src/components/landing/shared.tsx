/**
 * Piezas compartidas por las secciones de la landing (`SectionHeading`,
 * `CheckIcon`, `RecipeMeta`, `FloatingBadge`) y reexportación de `Reveal` y
 * `NonnaAvatar`.
 */

import React from 'react';
export { Reveal } from '../ui/Reveal';
export { NonnaAvatar } from '../ui/NonnaAvatar';

// Nota de consolidación de color: varias secciones de landing tenían tonos
// "apagados"/"texto en oscuro" ligeramente distintos entre sí (deriva propia
// de ir copiando clases de un sitio a otro). Aquí y en el resto de este
// archivo se centralizan en los 3 niveles de texto ya definidos en
// tailwind.config.js: `ink` (títulos/fuerte), `body` (texto por defecto) y
// `muted` (secundario/apagado).

export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6" />
  </svg>
);

// Eyebrow + título + (opcional) subtítulo — el mismo patrón que ya usaban
// HowItWorksSection/FeaturesSection/PricingSection a mano, ahora reutilizable
// también en las secciones nuevas.
export const SectionHeading: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
}> = ({ eyebrow, title, subtitle, align = 'left', light = false, className = '' }) => (
  <div className={`${align === 'center' ? 'text-center mx-auto' : ''} ${className}`}>
    <span className="block text-xs font-semibold mb-2.5 text-primary">{eyebrow}</span>
    <h2
      className={`text-2xl md:text-[34px] font-extrabold tracking-tight ${
        light ? 'text-white' : 'text-ink dark:text-ink-light'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-4 text-sm md:text-[15.5px] leading-relaxed ${light ? 'text-white/70' : 'text-muted dark:text-muted-dark'}`}>
        {subtitle}
      </p>
    )}
  </div>
);

// Fila de metadatos de receta (tiempo / dificultad / calorías) — se repetía
// como JSX suelto en varias secciones nuevas; aquí una sola vez.
export const RecipeMeta: React.FC<{
  time?: string;
  difficulty?: string;
  calories?: string;
  light?: boolean;
  className?: string;
}> = ({ time, difficulty, calories, light = false, className = '' }) => {
  const base = light ? 'text-white/80' : 'text-muted dark:text-muted-dark';
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${base} ${className}`}>
      {time && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </svg>
          {time}
        </span>
      )}
      {difficulty && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c1.4 2.8-1 4.3-1 6.8 0 1.6 1.2 2.9 2.9 2.9s2.9-1.3 2.9-2.9c0-.9-.4-1.6-.9-2.2C17.4 8.4 19 10.9 19 13.8a7 7 0 1 1-14 0c0-2.9 1.3-5.2 3-6.9C9.8 4.9 11 3.5 12 2z" />
          </svg>
          {difficulty}
        </span>
      )}
      {calories && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
          </svg>
          {calories}
        </span>
      )}
    </div>
  );
};

// Pastilla flotante decorativa (icono + texto corto) — usada alrededor del
// mockup del móvil y de la foto de la Nonna.
export const FloatingBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  className?: string;
}> = ({ icon, label, className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 shadow-lg text-xs font-semibold text-body dark:text-body-dark ${className}`}
  >
    <span className="text-primary flex-shrink-0">{icon}</span>
    {label}
  </div>
);
