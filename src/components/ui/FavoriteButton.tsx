/**
 * Botón de corazón para marcar/desmarcar una receta como favorita. Sin estado
 * propio: quien lo usa decide el valor mostrado y qué hacer al pulsarlo
 * (normalmente una actualización optimista con vuelta atrás si falla).
 */

import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  isFavorite: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

export const FavoriteButton: React.FC<Props> = ({ isFavorite, onToggle, label, className = '' }) => (
  <button
    type="button"
    onClick={(e) => {
      // Los sitios donde se usa (tarjetas del recetario, cabecera de la vista
      // previa) son a su vez clicables/enlaces — sin esto, pulsar el corazón
      // también dispararía esa acción de fondo.
      e.stopPropagation();
      e.preventDefault();
      onToggle();
    }}
    aria-label={label}
    aria-pressed={isFavorite}
    className={className}
  >
    <Heart aria-hidden="true" className={`w-full h-full transition-transform active:scale-90 ${isFavorite ? 'fill-current' : ''}`} />
  </button>
);
