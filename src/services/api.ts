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
