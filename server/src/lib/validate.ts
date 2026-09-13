import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

// Valida req.body contra un schema zod y lo reemplaza por la versión parseada
// (con defaults/trim aplicados). 400 con el primer mensaje de error si falla.
export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0]?.message || 'Datos inválidos' });
    }
    req.body = result.data;
    next();
  };
