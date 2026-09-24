/**
 * Wrapper de `fetch` de bajo nivel para la API: envía siempre la cookie de
 * sesión (`credentials: 'include'`), serializa JSON y convierte los errores
 * HTTP en `ApiError`.
 */

// En local, sin VITE_API_URL definida, se asume el backend de `npm run dev:all`
// (localhost:3001). En un build de producción (Netlify/Vercel) esta variable
// es OBLIGATORIA — Vite la incrusta en tiempo de compilación, así que si falta
// aquí, faltaba en el momento del build, no algo que se pueda arreglar en
// runtime. El aviso es para que el fallo se vea en consola en vez de fallar
// en silencio contra un localhost que no existe en el navegador del usuario.
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error(
    '[Sabora] VITE_API_URL no estaba definida al compilar este build de producción — ' +
    'todas las llamadas a la API irán a localhost y fallarán. Configúrala en las variables ' +
    'de entorno de tu hosting (Netlify/Vercel) y vuelve a desplegar.'
  );
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
 * Fetch wrapper for the Sabora API. Always sends the httpOnly session
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
