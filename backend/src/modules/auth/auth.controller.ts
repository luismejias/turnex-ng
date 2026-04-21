import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import * as authService from './auth.service';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = registerSchema.parse(req.body);
    const result = await authService.register(dto);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await authService.login(dto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMeController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
