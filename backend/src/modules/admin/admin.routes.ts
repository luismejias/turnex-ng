import { Router, Request, Response } from 'express';
import { superAdminMiddleware } from '../../middlewares/super-admin.middleware';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import * as ctrl from './admin.controller';

export const adminRouter = Router();

adminRouter.use(superAdminMiddleware);

adminRouter.post('/upload', uploadMiddleware.single('logo'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ message: 'No se recibió ningún archivo' }); return; }
  res.json({ url: `/uploads/${req.file.filename}` });
});

adminRouter.get('/companies',                                             ctrl.getCompaniesController);
adminRouter.post('/companies',                                            ctrl.createCompanyController);
adminRouter.get('/companies/:id',                                         ctrl.getCompanyController);
adminRouter.patch('/companies/:id',                                       ctrl.updateCompanyController);
adminRouter.delete('/companies/:id',                                      ctrl.deleteCompanyController);

adminRouter.post('/companies/:companyId/profiles',                        ctrl.createProfileController);
adminRouter.patch('/companies/:companyId/profiles/:profileId',            ctrl.updateProfileController);
adminRouter.delete('/companies/:companyId/profiles/:profileId',           ctrl.deleteProfileController);

adminRouter.post('/companies/:companyId/schedules',                       ctrl.createScheduleController);
adminRouter.patch('/companies/:companyId/schedules/:scheduleId',          ctrl.updateScheduleController);
adminRouter.delete('/companies/:companyId/schedules/:scheduleId',         ctrl.deleteScheduleController);
