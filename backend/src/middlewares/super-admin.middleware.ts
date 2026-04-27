import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from './auth.middleware';

export function superAdminMiddleware(req: Request, res: Response, next: NextFunction): void {
  authMiddleware(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (!user || user.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Forbidden: SUPER_ADMIN role required' });
        return;
      }
      next();
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
