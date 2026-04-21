import { Router } from 'express';
import { registerController, loginController, getMeController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.get('/me', authMiddleware, getMeController);
