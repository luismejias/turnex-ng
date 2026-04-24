import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

// ── Companies ─────────────────────────────────────────────────────────────────

export async function getCompaniesController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.getCompanies()); }
  catch (err) { next(err); }
}

export async function getCompanyController(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminService.getCompanyById(Number(req.params['id']))); }
  catch (err) { next(err); }
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
