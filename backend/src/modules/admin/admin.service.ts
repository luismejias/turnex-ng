import { prisma } from '../../config/prisma';

/**
 * Crea un error con código de estado HTTP adjunto, compatible con el middleware de errores.
 * @param message - Mensaje descriptivo.
 * @param statusCode - Código HTTP a devolver.
 */
function createAppError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * Renombra la relación `schedules` a `shifts` para alinear el nombre con el frontend.
 * @param c - Objeto empresa de Prisma.
 * @returns Empresa con la propiedad `shifts` en lugar de `schedules`.
 */
function mapCompany(c: any) {
  const { schedules, ...rest } = c;
  return { ...rest, shifts: schedules };
}

// ── Companies ─────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista completa de empresas (solo SUPER_ADMIN).
 * @returns Lista de empresas con perfiles y horarios incluidos.
 */
export async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: { profiles: true, schedules: true },
    orderBy: { createdAt: 'asc' },
  });
  return companies.map(mapCompany);
}

/**
 * Obtiene una empresa por ID.
 * Lanza 404 si la empresa no existe.
 * @param id - ID de la empresa.
 * @returns Empresa con perfiles y horarios incluidos.
 */
export async function getCompanyById(id: number) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { profiles: true, schedules: true },
  });
  if (!company) throw createAppError('Company not found', 404);
  return mapCompany(company);
}

/**
 * Crea una nueva empresa.
 * @param data - Datos básicos de la empresa.
 * @returns Empresa creada con perfiles y horarios vacíos.
 */
export async function createCompany(data: {
  name: string; cuit: string; phone: string; address: string; service: string; logo?: string;
}) {
  const company = await prisma.company.create({
    data,
    include: { profiles: true, schedules: true },
  });
  return mapCompany(company);
}

/**
 * Actualiza los datos de una empresa existente.
 * Lanza 404 si la empresa no existe.
 * @param id - ID de la empresa.
 * @param data - Campos a modificar.
 * @returns Empresa actualizada.
 */
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

/**
 * Elimina una empresa permanentemente.
 * Lanza 404 si la empresa no existe.
 * @param id - ID de la empresa a eliminar.
 */
export async function deleteCompany(id: number) {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) throw createAppError('Company not found', 404);
  await prisma.company.delete({ where: { id } });
}

// ── Profiles ──────────────────────────────────────────────────────────────────

/**
 * Crea un perfil de staff para una empresa.
 * @param companyId - ID de la empresa.
 * @param data - Datos del perfil.
 * @returns Perfil creado.
 */
export async function createProfile(companyId: number, data: {
  type: string; name: string; lastName: string; phone: string; email: string;
}) {
  return prisma.companyProfile.create({ data: { ...data, companyId } });
}

/**
 * Actualiza los datos de un perfil de staff.
 * Lanza 404 si el perfil no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param profileId - ID del perfil.
 * @param data - Campos a modificar.
 * @returns Perfil actualizado.
 */
export async function updateProfile(companyId: number, profileId: number, data: Partial<{
  type: string; name: string; lastName: string; phone: string; email: string; active: boolean;
}>) {
  const existing = await prisma.companyProfile.findFirst({ where: { id: profileId, companyId } });
  if (!existing) throw createAppError('Profile not found', 404);
  return prisma.companyProfile.update({ where: { id: profileId }, data });
}

/**
 * Elimina un perfil de staff de una empresa.
 * Lanza 404 si el perfil no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param profileId - ID del perfil a eliminar.
 */
export async function deleteProfile(companyId: number, profileId: number) {
  const existing = await prisma.companyProfile.findFirst({ where: { id: profileId, companyId } });
  if (!existing) throw createAppError('Profile not found', 404);
  await prisma.companyProfile.delete({ where: { id: profileId } });
}

// ── Schedules (frontend calls them "shifts") ──────────────────────────────────

/**
 * Crea un horario (schedule) para una empresa.
 * @param companyId - ID de la empresa.
 * @param data - Datos del horario.
 * @returns Horario creado.
 */
export async function createSchedule(companyId: number, data: {
  name: string; days: string[]; timeFrom: string; timeTo: string; periodicity: string; packs: string[];
}) {
  return prisma.companySchedule.create({ data: { ...data, companyId } });
}

/**
 * Actualiza los datos de un horario de empresa.
 * Lanza 404 si el horario no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param scheduleId - ID del horario.
 * @param data - Campos a modificar.
 * @returns Horario actualizado.
 */
export async function updateSchedule(companyId: number, scheduleId: number, data: Partial<{
  name: string; days: string[]; timeFrom: string; timeTo: string; periodicity: string; packs: string[];
}>) {
  const existing = await prisma.companySchedule.findFirst({ where: { id: scheduleId, companyId } });
  if (!existing) throw createAppError('Schedule not found', 404);
  return prisma.companySchedule.update({ where: { id: scheduleId }, data });
}

/**
 * Elimina un horario de empresa.
 * Lanza 404 si el horario no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param scheduleId - ID del horario a eliminar.
 */
export async function deleteSchedule(companyId: number, scheduleId: number) {
  const existing = await prisma.companySchedule.findFirst({ where: { id: scheduleId, companyId } });
  if (!existing) throw createAppError('Schedule not found', 404);
  await prisma.companySchedule.delete({ where: { id: scheduleId } });
}

// ── Users ─────────────────────────────────────────────────────────────────────

/** Proyección de campos de usuario seguros para devolver al cliente. */
const USER_SELECT = {
  id: true, name: true, lastName: true, email: true,
  role: true, active: true, companyId: true, createdAt: true,
};

/**
 * Obtiene todos los usuarios de una empresa.
 * @param companyId - ID de la empresa.
 * @returns Lista de usuarios de la empresa ordenados por fecha de creación.
 */
export async function getUsersByCompany(companyId: number) {
  return prisma.user.findMany({
    where: { companyId },
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Crea un usuario en una empresa o vincula uno existente si el email ya está registrado.
 * Lanza 409 si el usuario ya pertenece a otra empresa.
 * @param companyId - ID de la empresa.
 * @param data - Datos del usuario (incluye contraseña en texto plano).
 * @returns Usuario creado o actualizado.
 */
export async function createUser(companyId: number, data: {
  name: string; lastName: string; email: string; password: string;
  role?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    if (existing.companyId !== null && existing.companyId !== companyId) {
      throw createAppError('El usuario ya pertenece a otra empresa', 409);
    }
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

/**
 * Actualiza los datos de un usuario de empresa.
 * Los ADMIN solo pueden asignar el rol USER; los SUPER_ADMIN no tienen restricción.
 * Lanza 404 si el usuario no se encuentra y 403 si el rol solicitado no está permitido.
 * @param companyId - ID de la empresa.
 * @param userId - ID del usuario.
 * @param data - Campos a modificar.
 * @param callerIsSuperAdmin - `true` si el solicitante es SUPER_ADMIN.
 * @returns Usuario actualizado.
 */
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

/**
 * Elimina permanentemente un usuario.
 * Lanza 404 si el usuario no se encuentra en la empresa.
 * @param companyId - ID de la empresa.
 * @param userId - ID del usuario a eliminar.
 * @param callerIsSuperAdmin - `true` si el solicitante es SUPER_ADMIN (omite el filtro de empresa).
 */
export async function deleteUser(companyId: number, userId: number, callerIsSuperAdmin: boolean) {
  const user = await prisma.user.findFirst({
    where: callerIsSuperAdmin ? { id: userId } : { id: userId, companyId },
  });
  if (!user) throw createAppError('User not found', 404);
  await prisma.user.delete({ where: { id: userId } });
}

// ── Company Specialties ───────────────────────────────────────────────────────

/**
 * Obtiene las especialidades de una empresa con su horario asociado.
 * @param companyId - ID de la empresa.
 * @returns Lista de especialidades de la empresa.
 */
export async function getSpecialties(companyId: number) {
  return prisma.companySpecialty.findMany({
    where: { companyId },
    include: { schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } } },
    orderBy: { id: 'asc' },
  });
}

/**
 * Crea una especialidad de empresa.
 * @param companyId - ID de la empresa.
 * @param data - Datos de la especialidad.
 * @returns Especialidad creada con su horario incluido.
 */
export async function createSpecialty(companyId: number, data: {
  name: string; description?: string; capacity: number; scheduleId?: number;
}) {
  return prisma.companySpecialty.create({
    data: { ...data, companyId },
    include: { schedule: { select: { id: true, name: true, timeFrom: true, timeTo: true, periodicity: true, days: true } } },
  });
}

/**
 * Actualiza los datos de una especialidad de empresa.
 * Lanza 404 si la especialidad no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param specialtyId - ID de la especialidad.
 * @param data - Campos a modificar.
 * @returns Especialidad actualizada con su horario incluido.
 */
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

/**
 * Elimina una especialidad de empresa.
 * Lanza 404 si la especialidad no pertenece a la empresa.
 * @param companyId - ID de la empresa.
 * @param specialtyId - ID de la especialidad a eliminar.
 */
export async function deleteSpecialty(companyId: number, specialtyId: number) {
  const existing = await prisma.companySpecialty.findFirst({ where: { id: specialtyId, companyId } });
  if (!existing) throw createAppError('Specialty not found', 404);
  await prisma.companySpecialty.delete({ where: { id: specialtyId } });
}

// ── Availability ──────────────────────────────────────────────────────────────

/**
 * Genera los horarios disponibles entre `timeFrom` y `timeTo` según la periodicidad.
 * @param timeFrom - Hora de inicio en formato HH:MM.
 * @param timeTo - Hora de fin en formato HH:MM.
 * @param periodicity - Periodicidad como texto (ej. "Cada 30 minutos").
 * @returns Lista de horarios en formato HH:MM.
 */
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

/**
 * Devuelve la disponibilidad de una especialidad para una fecha concreta.
 * Calcula los turnos ya reservados en cada slot y devuelve cupos restantes.
 * Retorna un array vacío si la fecha no corresponde a un día configurado en el horario.
 * @param companyId - ID de la empresa.
 * @param specialtyId - ID de la especialidad de empresa (CompanySpecialty).
 * @param date - Fecha en formato ISO `YYYY-MM-DD`.
 * @returns Lista de slots con capacidad, turnos reservados y cupos disponibles.
 */
export async function getAvailability(companyId: number, specialtyId: number, date: string) {
  const specialty = await prisma.companySpecialty.findFirst({
    where: { id: specialtyId, companyId, active: true },
    include: { schedule: true },
  });
  if (!specialty) throw createAppError('Specialty not found', 404);
  if (!specialty.schedule) throw createAppError('Specialty has no schedule assigned', 400);

  const { schedule, capacity } = specialty;

  const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dayName = DAY_NAMES[new Date(date + 'T12:00:00').getDay()];
  if (!schedule.days.includes(dayName)) {
    return [];
  }

  const slots = generateSlots(schedule.timeFrom, schedule.timeTo, schedule.periodicity);

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

/** Nombres de días en español indexados por el valor de `Date.getDay()`. */
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Obtiene todos los turnos de un usuario visto desde el panel de administración.
 * Auto-completa turnos vencidos antes de devolver la lista.
 * Para ADMIN, verifica que el usuario pertenezca a la empresa.
 * @param companyId - ID de la empresa.
 * @param userId - ID del usuario.
 * @param isSuperAdmin - `true` omite la validación de empresa.
 * @returns Lista de turnos del usuario ordenados por fecha.
 */
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

/**
 * Cancela un turno desde el panel de administración.
 * Para ADMIN verifica que el turno pertenezca a un usuario de su empresa.
 * Lanza 404 si el turno no se encuentra.
 * @param companyId - ID de la empresa.
 * @param shiftId - ID del turno a cancelar.
 * @param isSuperAdmin - `true` omite la validación de empresa.
 * @returns Turno actualizado con status CANCELED.
 */
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

/**
 * Reagenda un turno desde el panel de administración.
 * Cancela el turno original y crea uno nuevo con la fecha y hora indicadas.
 * Lanza 404 si el turno no se encuentra.
 * @param companyId - ID de la empresa.
 * @param shiftId - ID del turno original.
 * @param date - Nueva fecha en formato ISO.
 * @param time - Nueva hora en formato HH:MM.
 * @param isSuperAdmin - `true` omite la validación de empresa.
 * @returns Turno nuevo creado con status NEXT.
 */
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
