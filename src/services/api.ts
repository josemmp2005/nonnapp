/**
 * Wrapper de `fetch` de bajo nivel para la API: envía siempre la cookie de
 * sesión (`credentials: 'include'`), serializa JSON y convierte los errores
 * HTTP en `ApiError`.
 */

// En local, sin VITE_API_URL definida, se asume el backend de `npm run dev:all`
// (localhost:3001). En producción, sin definirla (recomendado, es el caso por
// defecto: no hace falta tocar nada en Netlify), las rutas quedan relativas
// (`/api/...`) y las resuelve el proxy del propio hosting (`public/_redirects`)
// hacia el backend — para el navegador la API vive en el mismo dominio que la
// app, así que la cookie de sesión deja de ser "de terceros" y Safari/iOS deja
// de perderla. Solo hace falta definirla (a la URL absoluta del backend) para
// el caso contrario: llamarlo directo, sin proxy, cross-site — vuelve a
// exponerse a que Safari/iOS pierda la cookie, así que es la opción NO
// recomendada, solo para cuando no se pueda montar el proxy.
//
// A diferencia de una versión anterior de este archivo, aquí NO se depende de
// poner la variable a "" a propósito en el panel de Netlify (frágil: no está
// claro que su interfaz guarde un valor vacío tal cual, y de fallar esa
// suposición el build de producción caía a localhost, mucho peor que el
// problema original). Con este diseño, no definir la variable ya es el modo
// recomendado — no hay nada que configurar mal.
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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
  // Para poder cancelar una petición en curso (p. ej. "Cancelar" mientras se
  // genera una receta) — si ya está abortada al llegar aquí, `fetch` rechaza
  // de inmediato con un `AbortError`, sin llegar a tocar la red.
  signal?: AbortSignal;
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
    signal: options.signal,
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
