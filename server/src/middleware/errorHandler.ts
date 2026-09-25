/**
 * Middleware final de errores: cualquier error que llegue a `next(err)` (o un
 * rechazo capturado con `asyncHandler`) se responde en JSON. Conserva los 4xx
 * de Express (JSON mal formado, cuerpo demasiado grande) y convierte el resto
 * en un 500 genérico, sin filtrar detalles internos al cliente.
 */

import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Si la respuesta ya empezó a enviarse no se puede cambiar: se delega en el
  // manejador por defecto de Express, que cierra la conexión.
  if (res.headersSent) return next(err);

  const status =
    typeof err?.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;

  if (status === 500) {
    console.error(`Error no controlado en ${req.method} ${req.path}:`, err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  return res.status(status).json({ error: 'Solicitud no válida' });
};
