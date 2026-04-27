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

// ── Users ─────────────────────────────────────────────────────────────────────

const USER_SELECT = {
  id: true, name: true, lastName: true, email: true,
  role: true, active: true, companyId: true, createdAt: true,
};

export async function getUsersByCompany(companyId: number) {
  return prisma.user.findMany({
    where: { companyId },
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createUser(companyId: number, data: {
  name: string; lastName: string; email: string; password: string;
  role?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    if (existing.companyId !== null && existing.companyId !== companyId) {
      throw createAppError('El usuario ya pertenece a otra empresa', 409);
    }
    // Link existing user to this company
    return prisma.user.update({
      where: { id: existing.id },
      data: { companyId, role: (data.role as any) ?? existing.role },
      select: USER_SELECT,
    });
  }

  const bcrypt = await import('bcryptjs');
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { name: data.name, lastName: data.lastName, email: data.email,
            password: hashed, role: (data.role as any) ?? 'USER',
            companyId, termAndConditions: true },
    select: USER_SELECT,
  });
}

export async function updateUser(companyId: number, userId: number, data: Partial<{
  name: string; lastName: string; email: string; role: string; active: boolean;
}>, callerIsSuperAdmin: boolean) {
  const user = await prisma.user.findFirst({
    where: callerIsSuperAdmin ? { id: userId } : { id: userId, companyId },
  });
  if (!user) throw createAppError('User not found', 404);
  if (!callerIsSuperAdmin && data.role && data.role !== 'USER') {
    throw createAppError('ADMIN can only assign USER role', 403);
  }
  return prisma.user.update({ where: { id: userId }, data: data as any, select: USER_SELECT });
}

export async function deleteUser(companyId: number, userId: number, callerIsSuperAdmin: boolean) {
  const user = await prisma.user.findFirst({
    where: callerIsSuperAdmin ? { id: userId } : { id: userId, companyId },
  });
  if (!user) throw createAppError('User not found', 404);
  await prisma.user.delete({ where: { id: userId } });
}

// ── Company Specialties ───────────────────────────────────────────────────────

export async function getSpecialties(companyId: number) {
  return prisma.companySpecialty.findMany({
    where: { companyId },
    include: { schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } } },
    orderBy: { id: 'asc' },
  });
}

export async function createSpecialty(companyId: number, data: {
  name: string; description?: string; capacity: number; scheduleId?: number;
}) {
  return prisma.companySpecialty.create({
    data: { ...data, companyId },
    include: { schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } } },
  });
}

export async function updateSpecialty(companyId: number, specialtyId: number, data: Partial<{
  name: string; description: string; capacity: number; scheduleId: number | null; active: boolean;
}>) {
  const existing = await prisma.companySpecialty.findFirst({ where: { id: specialtyId, companyId } });
  if (!existing) throw createAppError('Specialty not found', 404);
  return prisma.companySpecialty.update({
    where: { id: specialtyId },
    data,
    include: { schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } } },
  });
}

export async function deleteSpecialty(companyId: number, specialtyId: number) {
  const existing = await prisma.companySpecialty.findFirst({ where: { id: specialtyId, companyId } });
  if (!existing) throw createAppError('Specialty not found', 404);
  await prisma.companySpecialty.delete({ where: { id: specialtyId } });
}

// ── Availability ──────────────────────────────────────────────────────────────

function generateSlots(timeFrom: string, timeTo: string, periodicity: string): string[] {
  const periodicityMinutes: Record<string, number> = {
    'Cada 15 minutos': 15, 'Cada 30 minutos': 30,
    'Cada 45 minutos': 45, 'Cada 60 minutos': 60,
  };
  const interval = periodicityMinutes[periodicity] ?? 30;
  const [fH, fM] = timeFrom.split(':').map(Number);
  const [tH, tM] = timeTo.split(':').map(Number);
  const startMin = fH * 60 + fM;
  const endMin   = tH * 60 + tM;
  const slots: string[] = [];
  for (let m = startMin; m < endMin; m += interval) {
    const h  = Math.floor(m / 60).toString().padStart(2, '0');
    const mn = (m % 60).toString().padStart(2, '0');
    slots.push(`${h}:${mn}`);
  }
  return slots;
}

export async function getAvailability(companyId: number, specialtyId: number, date: string) {
  const specialty = await prisma.companySpecialty.findFirst({
    where: { id: specialtyId, companyId, active: true },
    include: { schedule: true },
  });
  if (!specialty) throw createAppError('Specialty not found', 404);
  if (!specialty.schedule) throw createAppError('Specialty has no schedule assigned', 400);

  const { schedule, capacity } = specialty;

  // Check the requested date falls on a configured day
  const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dayName = DAY_NAMES[new Date(date + 'T12:00:00').getDay()];
  if (!schedule.days.includes(dayName)) {
    return [];
  }

  const slots = generateSlots(schedule.timeFrom, schedule.timeTo, schedule.periodicity);

  // Count booked shifts per slot for this date
  const bookedShifts = await prisma.shift.groupBy({
    by: ['time'],
    where: {
      companySpecialtyId: specialtyId,
      date: { gte: new Date(date + 'T00:00:00'), lt: new Date(date + 'T23:59:59') },
      status: 'NEXT',
    },
    _count: { time: true },
  });

  const bookedBySlot: Record<string, number> = {};
  bookedShifts.forEach((b: any) => { bookedBySlot[b.time] = b._count.time; });

  return slots.map(time => {
    const booked = bookedBySlot[time] ?? 0;
    return { time, capacity, booked, available: Math.max(0, capacity - booked) };
  });
}

// ── Admin Shift Management ────────────────────────────────────────────────────

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export async function getUserShifts(companyId: number, userId: number, isSuperAdmin = false) {
  if (!isSuperAdmin) {
    const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
    if (!user) throw createAppError('User not found in company', 404);
  }

  const cutoff = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.shift.updateMany({
    where: { userId, status: 'NEXT', date: { lte: cutoff } },
    data: { status: 'COMPLETED' },
  });

  return prisma.shift.findMany({
    where: { userId },
    include: {
      pack: true,
      companySpecialty: { select: { id: true, name: true } },
    },
    orderBy: { date: 'asc' },
  });
}

export async function adminCancelShift(companyId: number, shiftId: number, isSuperAdmin = false) {
  const where = isSuperAdmin
    ? { id: shiftId }
    : { id: shiftId, user: { companyId } };
  const shift = await prisma.shift.findFirst({ where });
  if (!shift) throw createAppError('Shift not found', 404);
  return prisma.shift.update({
    where: { id: shiftId },
    data: { status: 'CANCELED' },
    include: { pack: true, companySpecialty: { select: { id: true, name: true } } },
  });
}

export async function adminRescheduleShift(
  companyId: number, shiftId: number, date: string, time: string, isSuperAdmin = false
) {
  const where = isSuperAdmin
    ? { id: shiftId }
    : { id: shiftId, user: { companyId } };
  const shift = await prisma.shift.findFirst({ where });
  if (!shift) throw createAppError('Shift not found', 404);

  await prisma.shift.update({ where: { id: shiftId }, data: { status: 'CANCELED' } });

  const newDate = new Date(date);
  const dayName = DAYS_ES[newDate.getDay()];

  return prisma.shift.create({
    data: {
      userId: shift.userId,
      packId: shift.packId,
      specialtyId: shift.specialtyId,
      companySpecialtyId: shift.companySpecialtyId,
      day: dayName,
      date: newDate,
      time,
      status: 'NEXT',
    },
    include: { pack: true, companySpecialty: { select: { id: true, name: true } } },
  });
}
