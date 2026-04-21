import { Router } from 'express';
import { getAllPacksController } from './packs.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const packsRouter = Router();

packsRouter.get('/', authMiddleware, getAllPacksController);
