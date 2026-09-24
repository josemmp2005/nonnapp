// Instalación de la PWA. El navegador dispara `beforeinstallprompt` UNA sola
// vez y pronto (a menudo antes de que se monte ningún componente), así que el
// listener se registra al importar este módulo desde main.tsx y el evento se
// guarda hasta que el usuario pulse el botón de instalar. Solo Chrome/Edge/
// Samsung Internet en Android lo lanzan; Safari en iOS no tiene API de
// instalación — ahí el botón abre una guía de "Añadir a pantalla de inicio".

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface Snapshot {
  canPrompt: boolean;
  installed: boolean;
  iosHelpOpen: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let iosHelpOpen = false;
let snapshot: Snapshot = { canPrompt: false, installed: false, iosHelpOpen: false };
const listeners = new Set<() => void>();

const emit = () => {
  snapshot = { canPrompt: deferred !== null, installed, iosHelpOpen };
  listeners.forEach((l) => l());
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // evita la mini-barra automática: la instalación la lanza nuestro botón
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    iosHelpOpen = false;
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

// Ya abierta desde el icono de la pantalla de inicio: no hay nada que instalar.
export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS 13+ se identifica como Mac, de ahí el chequeo de pantalla táctil.
export const isIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const requestInstall = async (): Promise<void> => {
  if (deferred) {
    const prompt = deferred;
    // El evento solo se puede usar una vez, se acepte o no el diálogo.
    deferred = null;
    emit();
    await prompt.prompt();
    await prompt.userChoice;
    return;
  }
  if (isIos()) {
    iosHelpOpen = true;
    emit();
  }
};

export const closeIosHelp = () => {
  iosHelpOpen = false;
  emit();
};
