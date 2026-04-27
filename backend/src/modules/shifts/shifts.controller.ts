import { Request, Response, NextFunction } from 'express';
import { createShiftsSchema, updateShiftStatusSchema, rescheduleShiftSchema } from './shifts.schemas';
import * as shiftsService from './shifts.service';

/**
 * Devuelve los turnos del usuario autenticado.
 * Los turnos vencidos son auto-completados antes de la respuesta.
 */
export async function getShiftsController(req: Request, res: Response, next: NextFunction) {
  try {
    const shifts = await shiftsService.getShifts(req.user!.userId);
    res.json(shifts);
  } catch (err) { next(err); }
}

/**
 * Crea uno o varios turnos para el usuario autenticado.
 * Valida el body con `createShiftsSchema` y responde con 201 y la lista de turnos NEXT.
 */
export async function createShiftsController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createShiftsSchema.parse(req.body);
    const shifts = await shiftsService.createShifts(req.user!.userId, dto);
    res.status(201).json(shifts);
  } catch (err) { next(err); }
}

/**
 * Actualiza el estado de un turno del usuario autenticado.
 * Valida el body con `updateShiftStatusSchema`.
 */
export async function updateShiftStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateShiftStatusSchema.parse(req.body);
    const shift = await shiftsService.updateShiftStatus(req.user!.userId, Number(req.params['id']), dto);
    res.json(shift);
  } catch (err) { next(err); }
}

/**
 * Reagenda un turno del usuario autenticado.
 * Valida el body con `rescheduleShiftSchema` y responde con 201 y el nuevo turno.
 */
export async function rescheduleShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = rescheduleShiftSchema.parse(req.body);
    const shift = await shiftsService.rescheduleShift(req.user!.userId, Number(req.params['id']), dto);
    res.status(201).json(shift);
  } catch (err) { next(err); }
}

/**
 * Elimina permanentemente un turno del usuario autenticado.
 * Responde con 204 sin contenido si la operación fue exitosa.
 */
export async function deleteShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    await shiftsService.deleteShift(req.user!.userId, Number(req.params['id']));
    res.status(204).send();
  } catch (err) { next(err); }
}
