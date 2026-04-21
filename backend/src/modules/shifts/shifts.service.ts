import { ShiftStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { CreateShiftsDto, UpdateShiftStatusDto } from './shifts.schemas';

const DAYS_OF_WEEK: Record<string, number> = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
  Jueves: 4, Viernes: 5, Sábado: 6,
};

function createAppError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export async function getShifts(userId: number) {
  return prisma.shift.findMany({
    where: { userId },
    include: { pack: true, specialty: true },
    orderBy: { date: 'asc' },
  });
}

export async function createShifts(userId: number, dto: CreateShiftsDto) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const shiftsToCreate: {
    userId: number; packId: number; specialtyId: number;
    day: string; date: Date; time: string; status: ShiftStatus;
  }[] = [];

  for (const [dayName, hours] of Object.entries(dto.hours)) {
    const dayIndex = DAYS_OF_WEEK[dayName];
    if (dayIndex === undefined) continue;

    const selectedHours = hours.filter((h) => h.isSelected);
    if (!selectedHours.length) continue;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() !== dayIndex) continue;

      for (const hour of selectedHours) {
        shiftsToCreate.push({
          userId,
          packId: dto.packId,
          specialtyId: dto.specialtyId,
          day: dayName,
          date,
          time: hour.description,
          status: ShiftStatus.NEXT,
        });
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

export async function deleteShift(userId: number, shiftId: number) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw createAppError('Shift not found', 404);

  await prisma.shift.delete({ where: { id: shiftId } });
}
