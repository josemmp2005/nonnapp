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
