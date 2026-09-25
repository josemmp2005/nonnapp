/**
 * Instalación de la PWA en cualquier navegador. Donde el navegador ofrece un
 * diálogo propio lo lanza el botón "Instalar app"; donde no lo hay, el botón
 * abre una guía genérica (InstallHelpModal). No se distingue navegador: solo
 * si el evento `beforeinstallprompt` llegó o no.
 */

// El navegador dispara `beforeinstallprompt` UNA sola vez y pronto (a menudo
// antes de que se monte ningún componente), así que el listener se registra al
// importar este módulo desde main.tsx y el evento se guarda hasta que el
// usuario pulse el botón.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface Snapshot {
  installed: boolean;
  helpOpen: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let helpOpen = false;
let snapshot: Snapshot = { installed: false, helpOpen: false };
const listeners = new Set<() => void>();

const emit = () => {
  snapshot = { installed, helpOpen };
  listeners.forEach((l) => l());
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // evita la mini-barra automática: la instalación la lanza nuestro botón
    deferred = e as BeforeInstallPromptEvent;
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    helpOpen = false;
    emit();
  });
}

export const subscribePwaInstall = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPwaInstallSnapshot = () => snapshot;

// Ya abierta desde el icono de la pantalla de inicio o como ventana propia: no
// hay nada que instalar.
export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const requestInstall = async (): Promise<void> => {
  if (!deferred) {
    helpOpen = true;
    emit();
    return;
  }
  const prompt = deferred;
  // El evento solo se puede usar una vez, se acepte o no el diálogo.
  deferred = null;
  await prompt.prompt();
  await prompt.userChoice;
};

export const closeInstallHelp = () => {
  helpOpen = false;
  emit();
};
