import { prisma } from '../../config/prisma';

function createAppError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

function mapCompany(c: any) {
  const { schedules, ...rest } = c;
  return { ...rest, shifts: schedules };
}

// ── Companies ─────────────────────────────────────────────────────────────────

export async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: { profiles: true, schedules: true },
    orderBy: { createdAt: 'asc' },
  });
  return companies.map(mapCompany);
}

export async function getCompanyById(id: number) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { profiles: true, schedules: true },
  });
  if (!company) throw createAppError('Company not found', 404);
  return mapCompany(company);
}

export async function createCompany(data: {
  name: string; cuit: string; phone: string; address: string; service: string; logo?: string;
}) {
  const company = await prisma.company.create({
    data,
    include: { profiles: true, schedules: true },
  });
  return mapCompany(company);
}

export async function updateCompany(id: number, data: Partial<{
  name: string; cuit: string; phone: string; address: string; service: string; logo: string;
}>) {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) throw createAppError('Company not found', 404);
  const company = await prisma.company.update({
    where: { id },
    data,
    include: { profiles: true, schedules: true },
  });
  return mapCompany(company);
}

export async function deleteCompany(id: number) {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) throw createAppError('Company not found', 404);
  await prisma.company.delete({ where: { id } });
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function createProfile(companyId: number, data: {
  type: string; name: string; lastName: string; phone: string; email: string;
}) {
  return prisma.companyProfile.create({ data: { ...data, companyId } });
}

export async function updateProfile(companyId: number, profileId: number, data: Partial<{
  type: string; name: string; lastName: string; phone: string; email: string; active: boolean;
}>) {
  const existing = await prisma.companyProfile.findFirst({ where: { id: profileId, companyId } });
  if (!existing) throw createAppError('Profile not found', 404);
  return prisma.companyProfile.update({ where: { id: profileId }, data });
}

export async function deleteProfile(companyId: number, profileId: number) {
  const existing = await prisma.companyProfile.findFirst({ where: { id: profileId, companyId } });
  if (!existing) throw createAppError('Profile not found', 404);
  await prisma.companyProfile.delete({ where: { id: profileId } });
}

// ── Schedules (frontend calls them "shifts") ──────────────────────────────────

export async function createSchedule(companyId: number, data: {
  name: string; days: string[]; timeFrom: string; timeTo: string; periodicity: string; packs: string[];
}) {
  return prisma.companySchedule.create({ data: { ...data, companyId } });
}

export async function updateSchedule(companyId: number, scheduleId: number, data: Partial<{
  name: string; days: string[]; timeFrom: string; timeTo: string; periodicity: string; packs: string[];
}>) {
  const existing = await prisma.companySchedule.findFirst({ where: { id: scheduleId, companyId } });
  if (!existing) throw createAppError('Schedule not found', 404);
  return prisma.companySchedule.update({ where: { id: scheduleId }, data });
}

export async function deleteSchedule(companyId: number, scheduleId: number) {
  const existing = await prisma.companySchedule.findFirst({ where: { id: scheduleId, companyId } });
  if (!existing) throw createAppError('Schedule not found', 404);
  await prisma.companySchedule.delete({ where: { id: scheduleId } });
}
