import { ShiftStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { CreateShiftsDto, UpdateShiftStatusDto, RescheduleShiftDto } from './shifts.schemas';

/** Mapa de nombre de día en español → índice numérico de la semana (0 = domingo). */
const DAYS_OF_WEEK: Record<string, number> = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
  Jueves: 4, Viernes: 5, Sábado: 6,
};

/**
 * Crea un error con código de estado HTTP adjunto, compatible con el middleware de errores.
 * @param message - Mensaje descriptivo.
 * @param statusCode - Código HTTP a devolver.
 */
function createAppError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * Obtiene todos los turnos del usuario autenticado.
 * Antes de consultar, auto-completa los turnos NEXT cuya fecha sea ≤ (ahora + 1 hora),
 * lo que permite que los turnos pasados cambien de estado sin un proceso externo.
 * @param userId - ID del usuario autenticado.
 * @returns Lista de turnos ordenados por fecha ascendente.
 */
export async function getShifts(userId: number) {
  const cutoff = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.shift.updateMany({
    where: { userId, status: ShiftStatus.NEXT, date: { lte: cutoff } },
    data: { status: ShiftStatus.COMPLETED },
  });

  return prisma.shift.findMany({
    where: { userId },
    include: { pack: true, specialty: true },
    orderBy: { date: 'asc' },
  });
}

/**
 * Crea uno o varios turnos a partir del DTO del wizard de nuevo turno.
 *
 * - **Pack 4 (clase suelta)**: usa la fecha exacta enviada por el frontend (`dto.dates`).
 * - **Otros packs**: genera turnos recurrentes en el mes en curso hasta completar
 *   `pack.classCount` clases.
 *
 * @param userId - ID del usuario para quien se crean los turnos.
 * @param dto - Datos del wizard: packId, horarios seleccionados y fechas opcionales.
 * @returns Lista actualizada de turnos NEXT del usuario.
 */
export async function createShifts(userId: number, dto: CreateShiftsDto) {
  const pack = await prisma.pack.findUnique({ where: { id: dto.packId } });
  if (!pack) throw createAppError('Pack not found', 404);

  const shiftsToCreate: {
    userId: number; packId: number; specialtyId?: number; companySpecialtyId?: number;
    day: string; date: Date; time: string; status: ShiftStatus;
  }[] = [];

  if (pack.id === 4) {
    for (const [dayName, hours] of Object.entries(dto.hours)) {
      const selectedHours = hours.filter((h) => h.isSelected);
      if (!selectedHours.length) continue;

      const isoDate = dto.dates?.[dayName];
      if (!isoDate) continue;

      const date = new Date(isoDate);
      for (const hour of selectedHours) {
        const [h, m] = hour.description.split(':').map(Number);
        const shiftDate = new Date(date);
        shiftDate.setHours(h, m, 0, 0);
        shiftsToCreate.push({
          userId, packId: dto.packId, specialtyId: dto.specialtyId, companySpecialtyId: dto.companySpecialtyId,
          day: dayName, date: shiftDate, time: hour.description,
          status: ShiftStatus.NEXT,
        });
      }
    }
  } else {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let createdCount = 0;

    for (const [dayName, hours] of Object.entries(dto.hours)) {
      const dayIndex = DAYS_OF_WEEK[dayName];
      if (dayIndex === undefined) continue;

      const selectedHours = hours.filter((h) => h.isSelected);
      if (!selectedHours.length) continue;

      for (let d = 1; d <= daysInMonth; d++) {
        if (createdCount >= pack.classCount) break;
        const date = new Date(year, month, d);
        if (date.getDay() !== dayIndex) continue;

        for (const hour of selectedHours) {
          if (createdCount >= pack.classCount) break;
          const [h, m] = hour.description.split(':').map(Number);
          const shiftDate = new Date(date);
          shiftDate.setHours(h, m, 0, 0);
          shiftsToCreate.push({
            userId, packId: dto.packId, specialtyId: dto.specialtyId, companySpecialtyId: dto.companySpecialtyId,
            day: dayName, date: shiftDate, time: hour.description,
            status: ShiftStatus.NEXT,
          });
          createdCount++;
        }
      }
    }
  }

  if (!shiftsToCreate.length) {
    throw createAppError('No valid shifts to create', 400);
  }

  await prisma.shift.createMany({ data: shiftsToCreate });
  return prisma.shift.findMany({
    where: { userId, status: ShiftStatus.NEXT },
    include: { pack: true, specialty: true },
    orderBy: { date: 'asc' },
  });
}

/**
 * Actualiza el estado de un turno del usuario (ej. cancelar).
 * Lanza 404 si el turno no pertenece al usuario.
 * @param userId - ID del usuario autenticado.
 * @param shiftId - ID del turno a actualizar.
 * @param dto - Nuevo estado del turno.
 * @returns Turno actualizado con pack y especialidad incluidos.
 */
export async function updateShiftStatus(userId: number, shiftId: number, dto: UpdateShiftStatusDto) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  return prisma.shift.update({
    where: { id: shiftId },
    data: { status: dto.status as ShiftStatus },
    include: { pack: true, specialty: true },
  });
}

/**
 * Reagenda un turno del usuario a una nueva fecha y hora.
 * Cancela el turno original y crea uno nuevo con status NEXT.
 * Lanza 404 si el turno no pertenece al usuario.
 * @param userId - ID del usuario autenticado.
 * @param shiftId - ID del turno original a reagendar.
 * @param dto - Nueva fecha (ISO) y hora (HH:MM) del turno.
 * @returns Turno nuevo creado.
 */
export async function rescheduleShift(userId: number, shiftId: number, dto: RescheduleShiftDto) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  await prisma.shift.update({
    where: { id: shiftId },
    data: { status: ShiftStatus.CANCELED },
  });

  const newDate = new Date(dto.date);
  const dayIndex = newDate.getUTCDay();
  const dayName = Object.keys(DAYS_OF_WEEK).find(k => DAYS_OF_WEEK[k] === dayIndex) ?? '';

  return prisma.shift.create({
    data: {
      userId,
      packId: shift.packId,
      specialtyId: shift.specialtyId,
      day: dayName,
      date: newDate,
      time: dto.time,
      status: ShiftStatus.NEXT,
    },
    include: { pack: true, specialty: true },
  });
}

/**
 * Elimina permanentemente un turno del usuario.
 * Lanza 404 si el turno no pertenece al usuario.
 * @param userId - ID del usuario autenticado.
 * @param shiftId - ID del turno a eliminar.
 */
export async function deleteShift(userId: number, shiftId: number) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  await prisma.shift.delete({ where: { id: shiftId } });
}
