import type { RequestHandler } from 'express';
import { env } from '../env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// La cookie de sesión es SameSite=None en producción (frontend y backend en
// dominios distintos), así que el navegador la adjunta también a peticiones
// lanzadas desde otros sitios. CORS no cubre los POST/DELETE sin body JSON
// (p. ej. /logout, /resend-verification): un <form> externo los envía sin
// preflight. Los navegadores mandan siempre `Origin` en peticiones que
// cambian estado, así que se rechaza cualquiera que no venga del frontend.
// Sin `Origin` (curl, supertest, servidor a servidor) se deja pasar: esos
// clientes no arrastran la cookie de la víctima, así que no hay CSRF posible.
export const requireSameOrigin: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin === undefined || origin === env.corsOrigin) return next();

  res.status(403).json({ error: 'Origen no permitido.' });
};
