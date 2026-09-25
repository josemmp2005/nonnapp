/**
 * Hook `usePwaInstall`: expone si se puede ofrecer instalar la app (en
 * cualquier navegador, salvo que ya esté instalada o abierta como app) y el
 * estado de la guía de instalación, a partir del almacén de `utils/pwaInstall`.
 */

import { useSyncExternalStore } from 'react';
import {
  closeInstallHelp,
  getPwaInstallSnapshot,
  isStandalone,
  requestInstall,
  subscribePwaInstall,
} from '../utils/pwaInstall';

export const usePwaInstall = () => {
  const { installed, helpOpen } = useSyncExternalStore(subscribePwaInstall, getPwaInstallSnapshot);
  const available = !installed && !isStandalone();
  return { available, install: requestInstall, helpOpen, closeHelp: closeInstallHelp };
};
