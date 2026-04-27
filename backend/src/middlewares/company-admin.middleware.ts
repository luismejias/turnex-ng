import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from './auth.middleware';

declare global {
  namespace Express {
    interface Request {
      adminCompanyId?: number | null;
    }
  }
}

/**
 * Allows SUPER_ADMIN and ADMIN roles.
 * Sets req.adminCompanyId = null for SUPER_ADMIN (no restriction),
 * or the user's companyId for ADMIN (must match route :companyId).
 */
export function companyAdminMiddleware(req: Request, res: Response, next: NextFunction): void {
  authMiddleware(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      req.adminCompanyId = user.role === 'SUPER_ADMIN' ? null : user.companyId;
      next();
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
