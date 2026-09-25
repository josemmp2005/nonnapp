/**
 * Envuelve un handler `async` de Express para que un rechazo (p. ej. una
 * consulta a la BBDD que falla) llegue al middleware de errores. Express 4 no
 * captura esos rechazos y la petición se quedaría sin respuesta.
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };
