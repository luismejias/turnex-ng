import { Router, Request, Response } from 'express';
import { superAdminMiddleware } from '../../middlewares/super-admin.middleware';
import { companyAdminMiddleware } from '../../middlewares/company-admin.middleware';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import * as ctrl from './admin.controller';

export const adminRouter = Router();

// Upload — SUPER_ADMIN only
adminRouter.post('/upload', superAdminMiddleware, uploadMiddleware.single('logo'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ message: 'No se recibió ningún archivo' }); return; }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Companies — SUPER_ADMIN only
adminRouter.get('/companies',              superAdminMiddleware, ctrl.getCompaniesController);
adminRouter.post('/companies',             superAdminMiddleware, ctrl.createCompanyController);
adminRouter.get('/companies/:id',          companyAdminMiddleware, ctrl.getCompanyController);
adminRouter.patch('/companies/:id',        superAdminMiddleware, ctrl.updateCompanyController);
adminRouter.delete('/companies/:id',       superAdminMiddleware, ctrl.deleteCompanyController);

// Profiles — SUPER_ADMIN only
adminRouter.post('/companies/:companyId/profiles',                     superAdminMiddleware, ctrl.createProfileController);
adminRouter.patch('/companies/:companyId/profiles/:profileId',         superAdminMiddleware, ctrl.updateProfileController);
adminRouter.delete('/companies/:companyId/profiles/:profileId',        superAdminMiddleware, ctrl.deleteProfileController);

// Schedules — SUPER_ADMIN only
adminRouter.post('/companies/:companyId/schedules',                    superAdminMiddleware, ctrl.createScheduleController);
adminRouter.patch('/companies/:companyId/schedules/:scheduleId',       superAdminMiddleware, ctrl.updateScheduleController);
adminRouter.delete('/companies/:companyId/schedules/:scheduleId',      superAdminMiddleware, ctrl.deleteScheduleController);

// Users — SUPER_ADMIN and ADMIN (scoped to their company)
adminRouter.get('/companies/:companyId/users',                         companyAdminMiddleware, ctrl.getUsersController);
adminRouter.post('/companies/:companyId/users',                        companyAdminMiddleware, ctrl.createUserController);
adminRouter.patch('/companies/:companyId/users/:userId',               companyAdminMiddleware, ctrl.updateUserController);
adminRouter.delete('/companies/:companyId/users/:userId',              companyAdminMiddleware, ctrl.deleteUserController);

// Specialties — SUPER_ADMIN and ADMIN
adminRouter.get('/companies/:companyId/specialties',                              companyAdminMiddleware, ctrl.getSpecialtiesController);
adminRouter.post('/companies/:companyId/specialties',                             companyAdminMiddleware, ctrl.createSpecialtyController);
adminRouter.patch('/companies/:companyId/specialties/:specialtyId',               companyAdminMiddleware, ctrl.updateSpecialtyController);
adminRouter.delete('/companies/:companyId/specialties/:specialtyId',              companyAdminMiddleware, ctrl.deleteSpecialtyController);

// Availability — authenticated users (any role)
adminRouter.get('/companies/:companyId/specialties/:specialtyId/availability',    ctrl.getAvailabilityController);

// User shift management — ADMIN + SUPER_ADMIN
adminRouter.get('/companies/:companyId/users/:userId/shifts',                     companyAdminMiddleware, ctrl.getUserShiftsController);
adminRouter.patch('/companies/:companyId/shifts/:shiftId/cancel',                 companyAdminMiddleware, ctrl.adminCancelShiftController);
adminRouter.post('/companies/:companyId/shifts/:shiftId/reschedule',              companyAdminMiddleware, ctrl.adminRescheduleShiftController);
