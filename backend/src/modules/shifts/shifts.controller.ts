import { Request, Response, NextFunction } from 'express';
import { createShiftsSchema, updateShiftStatusSchema } from './shifts.schemas';
import * as shiftsService from './shifts.service';

export async function getShiftsController(req: Request, res: Response, next: NextFunction) {
  try {
    const shifts = await shiftsService.getShifts(req.user!.userId);
    res.json(shifts);
  } catch (err) { next(err); }
}

export async function createShiftsController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createShiftsSchema.parse(req.body);
    const shifts = await shiftsService.createShifts(req.user!.userId, dto);
    res.status(201).json(shifts);
  } catch (err) { next(err); }
}

export async function updateShiftStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateShiftStatusSchema.parse(req.body);
    const shift = await shiftsService.updateShiftStatus(req.user!.userId, Number(req.params['id']), dto);
    res.json(shift);
  } catch (err) { next(err); }
}

export async function deleteShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    await shiftsService.deleteShift(req.user!.userId, Number(req.params['id']));
    res.status(204).send();
  } catch (err) { next(err); }
}
