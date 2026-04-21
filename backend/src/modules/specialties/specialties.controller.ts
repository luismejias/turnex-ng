import { Request, Response, NextFunction } from 'express';
import * as specialtiesService from './specialties.service';

export async function getAllSpecialtiesController(req: Request, res: Response, next: NextFunction) {
  try {
    const specialties = await specialtiesService.getAllSpecialties();
    res.json(specialties);
  } catch (err) {
    next(err);
  }
}
