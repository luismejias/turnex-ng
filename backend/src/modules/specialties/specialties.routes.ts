import { Router } from 'express';
import { getAllSpecialtiesController } from './specialties.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const specialtiesRouter = Router();

specialtiesRouter.get('/', authMiddleware, getAllSpecialtiesController);
