/**
 * Tarjeta base reutilizable: fondo de superficie, borde ligero, radio grande y
 * sombra suave.
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Pequeña elevación al pasar el ratón — para cards clicables/interactivas,
  // no para contenedores puramente informativos.
  hoverable?: boolean;
}

// Card base reutilizable (manual visual, sección 22): fondo de superficie,
// borde muy ligero, radio grande, sombra suave con tinte cálido.
export const Card: React.FC<CardProps> = ({ hoverable = false, className = '', children, ...props }) => {
  return (
    <div
      className={`
        bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10
        rounded-2xl shadow-soft transition duration-200 ease-out
        ${hoverable ? 'hover:shadow-soft-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
