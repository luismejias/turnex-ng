import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Interfaz de error enriquecido con código de estado HTTP.
 * Todos los errores lanzados desde los servicios deben incluir `statusCode`.
 */
export interface AppError extends Error {
  /** Código de estado HTTP a devolver al cliente. */
  statusCode?: number;
}

/**
 * Middleware de manejo global de errores de Express.
 * - Los errores de validación Zod devuelven 400 con el detalle de los campos inválidos.
 * - Los errores con `statusCode` devuelven ese código con el mensaje del error.
 * - Cualquier otro error devuelve 500.
 */
export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    message: err.message ?? 'Internal server error',
  });
}
