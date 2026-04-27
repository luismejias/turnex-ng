import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/** Payload decodificado del JWT de sesión. */
export interface JwtPayload {
  /** ID del usuario en la base de datos. */
  userId: number;
  /** Email del usuario. */
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado adjuntado por {@link authMiddleware} tras verificar el JWT. */
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticación JWT.
 * Extrae el token del header `Authorization: Bearer <token>`, lo verifica
 * y adjunta el payload decodificado en `req.user`.
 * Responde con 401 si el token falta, es inválido o está expirado.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token missing or invalid' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
}
