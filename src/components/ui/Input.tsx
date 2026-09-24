/**
 * Campo de texto base reutilizable con icono opcional y estado de error.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

// Input base reutilizable (manual visual, mismo tratamiento visual que ya
// usaba Auth.tsx: fondo crema, borde sutil, foco con anillo `primary`).
export const Input: React.FC<InputProps> = ({ icon: Icon, error, className = '', id, ...props }) => {
  return (
    <div>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted dark:text-muted-dark pointer-events-none"
          />
        )}
        <input
          id={id}
          className={`
            w-full py-3 bg-cream dark:bg-[#221B12] border rounded-xl outline-none transition
            text-ink dark:text-ink-light
            focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:border-transparent
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${error ? 'border-error focus:ring-error' : 'border-ink/15 dark:border-ink-light/15 focus:ring-primary'}
            ${className}
          `}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
};
