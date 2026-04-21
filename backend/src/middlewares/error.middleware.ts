import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
}

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
