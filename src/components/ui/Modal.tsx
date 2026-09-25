/**
 * Backdrop de diálogo modal reutilizable: fondo oscuro con blur, centrado,
 * se cierra con Escape o con un clic fuera del panel, y bloquea la
 * propagación del clic dentro del panel (para no cerrarse solo por
 * interactuar con el contenido). `onClose` se usa tal cual para los dos
 * caminos de cierre — si una pantalla necesita bloquear el cierre en algún
 * momento (p. ej. mientras procesa algo), se le pasa ya envuelto.
 *
 * Cubre el patrón que repetían por separado ShoppingListModal,
 * RecipePreviewModal, RecipePickerModal, PlanChangeDisabledNotice y
 * PlanCheckoutModal. No los pantalla-completa sin backdrop (CookMode,
 * LoadingOverlay) ni la hoja inferior de InstallHelpModal — son otro widget,
 * no el mismo diálogo centrado.
 */

import React from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  // Clases del panel (ancho, alto máximo, flex...) — cada modal las trae
  // tal cual las tenía, así que el aspecto de cada uno no cambia.
  panelClassName: string;
  labelledBy?: string;
  label?: string;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, panelClassName, labelledBy, label }) => {
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={label}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
