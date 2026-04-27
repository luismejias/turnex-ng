import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import * as authService from './auth.service';

/**
 * Registra un nuevo usuario.
 * Valida el body con `registerSchema` y delega la lógica a {@link authService.register}.
 * Responde con 201 y el token JWT más los datos del usuario creado.
 */
export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = registerSchema.parse(req.body);
    const result = await authService.register(dto);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Autentica un usuario con email y contraseña.
 * Valida el body con `loginSchema` y delega la lógica a {@link authService.login}.
 * Responde con 200 y el token JWT más los datos del usuario autenticado.
 */
export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await authService.login(dto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve los datos actualizados del usuario autenticado.
 * Requiere que `authMiddleware` haya adjuntado `req.user` previamente.
 * Responde con 200 y los datos del usuario (sin contraseña).
 */
export async function getMeController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
