import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from './auth.middleware';

declare global {
  namespace Express {
    interface Request {
      /**
       * ID de empresa que restringe el acceso del admin autenticado.
       * - `null` → SUPER_ADMIN (sin restricción de empresa).
       * - `number` → ADMIN (solo puede acceder a su propia empresa).
       */
      adminCompanyId?: number | null;
    }
  }
}

/**
 * Middleware de autorización para rutas del panel de administración.
 * Permite el acceso a roles `SUPER_ADMIN` y `ADMIN`.
 *
 * - Para SUPER_ADMIN: establece `req.adminCompanyId = null` (sin restricción).
 * - Para ADMIN: establece `req.adminCompanyId = user.companyId` (solo su empresa).
 *
 * Los controladores deben comparar `req.adminCompanyId` con el parámetro
 * `:companyId` de la ruta para aplicar el scoping correspondiente.
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
