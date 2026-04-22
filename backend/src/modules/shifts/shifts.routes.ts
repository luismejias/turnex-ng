import { Router } from 'express';
import {
  getShiftsController,
  createShiftsController,
  updateShiftStatusController,
  rescheduleShiftController,
  deleteShiftController,
} from './shifts.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const shiftsRouter = Router();

shiftsRouter.use(authMiddleware);

shiftsRouter.get('/', getShiftsController);
shiftsRouter.post('/', createShiftsController);
shiftsRouter.patch('/:id', updateShiftStatusController);
shiftsRouter.post('/:id/reschedule', rescheduleShiftController);
shiftsRouter.delete('/:id', deleteShiftController);
