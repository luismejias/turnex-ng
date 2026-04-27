import { ShiftStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { CreateShiftsDto, UpdateShiftStatusDto, RescheduleShiftDto } from './shifts.schemas';

const DAYS_OF_WEEK: Record<string, number> = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
  Jueves: 4, Viernes: 5, Sábado: 6,
};

function createAppError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export async function getShifts(userId: number) {
  // Auto-complete any NEXT shift whose time is within 1 hour or already past
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

export async function createShifts(userId: number, dto: CreateShiftsDto) {
  const pack = await prisma.pack.findUnique({ where: { id: dto.packId } });
  if (!pack) throw createAppError('Pack not found', 404);

  const shiftsToCreate: {
    userId: number; packId: number; specialtyId?: number; companySpecialtyId?: number;
    day: string; date: Date; time: string; status: ShiftStatus;
  }[] = [];

  // Clase suelta (pack 4): use the exact date sent by the frontend
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
    // Regular packs: generate recurring shifts for the current month, capped at classCount
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

export async function updateShiftStatus(userId: number, shiftId: number, dto: UpdateShiftStatusDto) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  return prisma.shift.update({
    where: { id: shiftId },
    data: { status: dto.status as ShiftStatus },
    include: { pack: true, specialty: true },
  });
}

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

export async function deleteShift(userId: number, shiftId: number) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  await prisma.shift.delete({ where: { id: shiftId } });
}
