import React from 'react';
import nonnaPhoto from '../../assets/nonna.webp';
import { useInView } from '../../hooks/useInView';

export const NonnaAvatar: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <img
    src={nonnaPhoto}
    alt="La Nonna"
    className={`${className} rounded-full object-cover flex-shrink-0 ring-1 ring-primary/30`}
  />
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6" />
  </svg>
);

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
    <span className={`block text-xs font-semibold mb-2.5 ${light ? 'text-primary' : 'text-primary'}`}>{eyebrow}</span>
    <h2
      className={`text-2xl md:text-[34px] font-bold tracking-tight ${
        light ? 'text-white' : 'text-[#241B10] dark:text-[#F8F2E6]'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-4 text-sm md:text-[15.5px] leading-relaxed ${light ? 'text-white/70' : 'text-[#5C4E3A] dark:text-[#8B8B90]'}`}>
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
  const base = light ? 'text-white/80' : 'text-[#8C7C63] dark:text-[#7C715E]';
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
    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-[#18130D] border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-lg text-xs font-semibold text-[#3A2E1D] dark:text-[#E7DCC5] ${className}`}
  >
    <span className="text-primary flex-shrink-0">{icon}</span>
    {label}
  </div>
);
