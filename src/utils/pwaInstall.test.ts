/**
 * Tests del almacén de instalación de la PWA: qué hace el botón "Instalar app"
 * según el navegador haya avisado (`beforeinstallprompt`) o no, sin distinguir
 * navegadores.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

// Cada test carga el módulo de cero: su estado (evento guardado, guía abierta)
// vive a nivel de módulo y los listeners se registran al importarlo.
const load = async () => {
  vi.resetModules();
  const win = new EventTarget() as EventTarget & { matchMedia?: (q: string) => { matches: boolean } };
  vi.stubGlobal('window', win);
  const store = await import('./pwaInstall');
  return { win, store };
};

const installPromptEvent = (outcome: 'accepted' | 'dismissed' = 'accepted') => {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  });
  return { event, prompt };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestInstall', () => {
  it('abre la guía genérica si el navegador no ha avisado de que se puede instalar', async () => {
    const { store } = await load();
    expect(store.getPwaInstallSnapshot().helpOpen).toBe(false);

    await store.requestInstall();

    expect(store.getPwaInstallSnapshot().helpOpen).toBe(true);
    store.closeInstallHelp();
    expect(store.getPwaInstallSnapshot().helpOpen).toBe(false);
  });

  it('lanza el diálogo nativo (y no abre la guía) si el navegador sí ha avisado', async () => {
    const { win, store } = await load();
    const { event, prompt } = installPromptEvent();
    win.dispatchEvent(event);

    await store.requestInstall();

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(store.getPwaInstallSnapshot().helpOpen).toBe(false);
  });

  it('cancela la mini-barra automática del navegador al recibir el aviso', async () => {
    const { win } = await load();
    const { event } = installPromptEvent();

    win.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('el aviso solo vale una vez: si se rechaza el diálogo, la siguiente pulsación abre la guía', async () => {
    const { win, store } = await load();
    const { event, prompt } = installPromptEvent('dismissed');
    win.dispatchEvent(event);

    await store.requestInstall();
    await store.requestInstall();

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(store.getPwaInstallSnapshot().helpOpen).toBe(true);
  });
});

describe('appinstalled', () => {
  it('marca la app como instalada y cierra la guía', async () => {
    const { win, store } = await load();
    await store.requestInstall();
    expect(store.getPwaInstallSnapshot()).toEqual({ installed: false, helpOpen: true });

    win.dispatchEvent(new Event('appinstalled'));

    expect(store.getPwaInstallSnapshot()).toEqual({ installed: true, helpOpen: false });
  });
});

describe('subscribePwaInstall', () => {
  it('avisa a los suscritos de cada cambio y deja de avisar al desuscribirse', async () => {
    const { store } = await load();
    const listener = vi.fn();
    const unsubscribe = store.subscribePwaInstall(listener);

    await store.requestInstall();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.closeInstallHelp();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('isStandalone', () => {
  it('detecta la app abierta como ventana propia (display-mode: standalone)', async () => {
    const { win, store } = await load();
    win.matchMedia = () => ({ matches: true });
    expect(store.isStandalone()).toBe(true);
  });

  it('detecta la app abierta desde el icono de la pantalla de inicio (navigator.standalone)', async () => {
    const { win, store } = await load();
    win.matchMedia = () => ({ matches: false });
    vi.stubGlobal('navigator', { standalone: true });
    expect(store.isStandalone()).toBe(true);
  });

  it('es false en una pestaña normal del navegador', async () => {
    const { win, store } = await load();
    win.matchMedia = () => ({ matches: false });
    vi.stubGlobal('navigator', {});
    expect(store.isStandalone()).toBe(false);
  });
});
