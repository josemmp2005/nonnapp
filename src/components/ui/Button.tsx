import React from 'react';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Botón circular sin texto (toggle de tema, cerrar menú, etc.) — cambia el
  // padding/forma en vez de usar el tamaño horizontal de un botón con texto.
  iconOnly?: boolean;
}

// Botón base reutilizable (manual visual, secciones 18-19): `primary` (oliva)
// es la acción por defecto, `accent` (naranja) se reserva para las pocas CTAs
// que de verdad queremos destacar ("Generar receta", "Empezar"...), no para
// toda la interfaz.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-soft hover:shadow-soft-md',
  accent: 'bg-accent text-white hover:bg-accent-600 shadow-soft hover:shadow-soft-md',
  secondary: 'bg-ink/5 dark:bg-ink-light/10 text-ink dark:text-ink-light hover:bg-ink/10 dark:hover:bg-ink-light/20',
  outline: 'bg-transparent border border-ink/15 dark:border-ink-light/15 text-body dark:text-body-dark hover:border-primary hover:text-primary',
  ghost: 'bg-transparent text-muted dark:text-muted-dark hover:bg-ink/5 dark:hover:bg-ink-light/10 hover:text-primary',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3.5 text-base gap-2.5',
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2.5',
  lg: 'p-3.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-bold
        rounded-xl transition duration-200 ease-out
        active:scale-95 disabled:opacity-60 disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:focus-visible:ring-offset-cream-dark
        ${iconOnly ? `rounded-full ${ICON_SIZE_CLASSES[size]}` : SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
