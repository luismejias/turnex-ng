import { Request, Response, NextFunction } from 'express';
import * as packsService from './packs.service';

export async function getAllPacksController(req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await packsService.getAllPacks();
    res.json(packs);
  } catch (err) {
    next(err);
  }
}
