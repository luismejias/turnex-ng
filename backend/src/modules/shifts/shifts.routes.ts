import { Router } from 'express';
import {
  getShiftsController,
  createShiftsController,
  updateShiftStatusController,
  deleteShiftController,
} from './shifts.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const shiftsRouter = Router();

shiftsRouter.use(authMiddleware);

shiftsRouter.get('/', getShiftsController);
shiftsRouter.post('/', createShiftsController);
shiftsRouter.patch('/:id', updateShiftStatusController);
shiftsRouter.delete('/:id', deleteShiftController);
