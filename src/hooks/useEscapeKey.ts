import { useEffect } from 'react';

// Cierra con Escape — compartido por todos los modales de la app en vez de
// repetir el mismo useEffect en cada uno.
export const useEscapeKey = (onEscape: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);
};
