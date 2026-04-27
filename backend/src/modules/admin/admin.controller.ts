import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

// ── Companies ─────────────────────────────────────────────────────────────────

export async function getCompaniesController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.getCompanies()); }
  catch (err) { next(err); }
}

export async function getCompanyController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['id']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(await adminService.getCompanyById(companyId));
  } catch (err) { next(err); }
}

export async function createCompanyController(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await adminService.createCompany(req.body)); }
  catch (err) { next(err); }
}

export async function updateCompanyController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.updateCompany(Number(req.params['id']), req.body)); }
  catch (err) { next(err); }
}

export async function deleteCompanyController(req: Request, res: Response, next: NextFunction) {
  try { await adminService.deleteCompany(Number(req.params['id'])); res.status(204).send(); }
  catch (err) { next(err); }
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function createProfileController(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await adminService.createProfile(Number(req.params['companyId']), req.body)); }
  catch (err) { next(err); }
}

export async function updateProfileController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.updateProfile(Number(req.params['companyId']), Number(req.params['profileId']), req.body)); }
  catch (err) { next(err); }
}

export async function deleteProfileController(req: Request, res: Response, next: NextFunction) {
  try { await adminService.deleteProfile(Number(req.params['companyId']), Number(req.params['profileId'])); res.status(204).send(); }
  catch (err) { next(err); }
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export async function createScheduleController(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await adminService.createSchedule(Number(req.params['companyId']), req.body)); }
  catch (err) { next(err); }
}

export async function updateScheduleController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.updateSchedule(Number(req.params['companyId']), Number(req.params['scheduleId']), req.body)); }
  catch (err) { next(err); }
}

export async function deleteScheduleController(req: Request, res: Response, next: NextFunction) {
  try { await adminService.deleteSchedule(Number(req.params['companyId']), Number(req.params['scheduleId'])); res.status(204).send(); }
  catch (err) { next(err); }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(await adminService.getUsersByCompany(companyId));
  } catch (err) { next(err); }
}

export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.status(201).json(await adminService.createUser(companyId, req.body));
  } catch (err) { next(err); }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const userId = Number(req.params['userId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(await adminService.updateUser(companyId, userId, req.body, isSuperAdmin));
  } catch (err) { next(err); }
}

export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const userId = Number(req.params['userId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    await adminService.deleteUser(companyId, userId, isSuperAdmin);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ── Company Specialties ───────────────────────────────────────────────────────

export async function getSpecialtiesController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.getSpecialties(Number(req.params['companyId']))); }
  catch (err) { next(err); }
}

export async function createSpecialtyController(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await adminService.createSpecialty(Number(req.params['companyId']), req.body)); }
  catch (err) { next(err); }
}

export async function updateSpecialtyController(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.updateSpecialty(
      Number(req.params['companyId']), Number(req.params['specialtyId']), req.body
    ));
  } catch (err) { next(err); }
}

export async function deleteSpecialtyController(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteSpecialty(Number(req.params['companyId']), Number(req.params['specialtyId']));
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getAvailabilityController(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query['date'] as string;
    if (!date) { res.status(400).json({ message: 'date query param required' }); return; }
    res.json(await adminService.getAvailability(
      Number(req.params['companyId']), Number(req.params['specialtyId']), date
    ));
  } catch (err) { next(err); }
}

// ── Admin Shift Management ────────────────────────────────────────────────────

export async function getUserShiftsController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const userId = Number(req.params['userId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(await adminService.getUserShifts(companyId, userId, isSuperAdmin));
  } catch (err) { next(err); }
}

export async function adminCancelShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    res.json(await adminService.adminCancelShift(companyId, Number(req.params['shiftId']), isSuperAdmin));
  } catch (err) { next(err); }
}

export async function adminRescheduleShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = Number(req.params['companyId']);
    const isSuperAdmin = req.adminCompanyId === null;
    if (!isSuperAdmin && req.adminCompanyId !== companyId) {
      res.status(403).json({ message: 'Forbidden' }); return;
    }
    const { date, time } = req.body as { date: string; time: string };
    if (!date || !time) { res.status(400).json({ message: 'date and time are required' }); return; }
    res.status(201).json(await adminService.adminRescheduleShift(
      companyId, Number(req.params['shiftId']), date, time, isSuperAdmin
    ));
  } catch (err) { next(err); }
}
