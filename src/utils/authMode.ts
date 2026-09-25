/**
 * Qué modo de `/auth` codifica la URL (`?modo=registro`) — lo comparten
 * Auth.tsx (qué formulario mostrar) y Layout.tsx (si ya se ve el login, no
 * repetir el enlace "Iniciar sesión" en la cabecera pública).
 */

export type AuthMode = 'login' | 'signup';

export const authModeFromUrl = (search: string): AuthMode =>
  new URLSearchParams(search).get('modo') === 'registro' ? 'signup' : 'login';
