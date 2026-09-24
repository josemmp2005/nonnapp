/**
 * Hook `usePwaInstall`: expone el estado de instalación de la PWA (si se puede
 * instalar, si es iOS, si ya está instalada) a partir del almacén de
 * `utils/pwaInstall`.
 */

import { useSyncExternalStore } from 'react';
import {
  closeIosHelp,
  getPwaInstallSnapshot,
  isIos,
  isStandalone,
  requestInstall,
  subscribePwaInstall,
} from '../utils/pwaInstall';

// `available`: hay algo que ofrecer — el navegador nos dejó lanzar el diálogo
// de instalación (Android) o es iOS (guía manual) — y la app no está ya
// instalada/abierta desde el icono.
export const usePwaInstall = () => {
  const { canPrompt, installed, iosHelpOpen } = useSyncExternalStore(subscribePwaInstall, getPwaInstallSnapshot);
  const available = !installed && !isStandalone() && (canPrompt || isIos());
  return { available, install: requestInstall, iosHelpOpen, closeIosHelp };
};
