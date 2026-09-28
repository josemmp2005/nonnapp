/**
 * Wrapper de `fetch` de bajo nivel para la API: envía siempre la cookie de
 * sesión (`credentials: 'include'`), serializa JSON y convierte los errores
 * HTTP en `ApiError`.
 */

// En local, sin VITE_API_URL definida, se asume el backend de `npm run dev:all`
// (localhost:3001). En producción (Netlify) esta variable puede ser:
//   - la URL absoluta del backend (llamada directa, cross-site) — sigue funcionando, pero
//     Safari/iOS trata esa cookie de sesión como "de terceros" y a veces la descarta; o
//   - "" (vacía, A PROPÓSITO): las rutas quedan relativas (`/api/...`) y las resuelve el
//     proxy del propio hosting (`public/_redirects`) hacia el backend, así que para el
//     navegador la API vive en el mismo dominio que la app — la cookie deja de ser "de
//     terceros" y Safari/iOS deja de perderla. Es el valor recomendado en producción.
// Solo se avisa si la variable falta del todo (undefined) — un "" puesto a propósito es
// una configuración válida, no un olvido, así que no debe disparar el aviso.
if (import.meta.env.PROD && import.meta.env.VITE_API_URL === undefined) {
  console.error(
    '[Nonnapp] VITE_API_URL no estaba definida al compilar este build de producción — ' +
    'todas las llamadas a la API irán a localhost y fallarán. Configúrala en las variables ' +
    'de entorno de tu hosting (Netlify) y vuelve a desplegar — "" (vacía) para usar el proxy ' +
    'de public/_redirects, o la URL del backend para llamarlo directo.'
  );
}

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  // Cuerpo JSON completo de la respuesta de error, por si una ruta manda
  // campos extra además de `error` (p.ej. `retryAfterSeconds` en 429s).
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/**
 * Fetch wrapper for the Nonnapp API. Always sends the httpOnly session
 * cookie (`credentials: 'include'`) — the frontend never touches the JWT.
 */
export const apiFetch = async <T = unknown>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = (data && (data.error || data.message)) || `Error ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
};
