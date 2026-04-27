import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/prisma';
import { getAvailability } from '../admin/admin.service';

export const availabilityRouter = Router();

availabilityRouter.use(authMiddleware);

// GET /api/availability/companies/:companyId/specialties
availabilityRouter.get('/companies/:companyId/specialties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialties = await prisma.companySpecialty.findMany({
      where: { companyId: Number(req.params['companyId']), active: true },
      select: {
        id: true, companyId: true, name: true, description: true, capacity: true, scheduleId: true,
        schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json(specialties);
  } catch (err) { next(err); }
});

// GET /api/availability/companies/:companyId/specialties/:specialtyId?date=YYYY-MM-DD
availabilityRouter.get('/companies/:companyId/specialties/:specialtyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.query['date'] as string;
    if (!date) { res.status(400).json({ message: 'date query param required' }); return; }
    res.json(await getAvailability(
      Number(req.params['companyId']),
      Number(req.params['specialtyId']),
      date,
    ));
  } catch (err) { next(err); }
});
