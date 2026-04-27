import { z } from 'zod';

/** Esquema Zod para la creación de uno o varios turnos desde el wizard del frontend. */
export const createShiftsSchema = z.object({
  /** ID del pack seleccionado por el usuario. */
  packId: z.number().int().positive(),
  /** ID de la especialidad genérica (opcional). */
  specialtyId: z.number().int().positive().optional(),
  /** ID de la especialidad de empresa (CompanySpecialty, opcional). */
  companySpecialtyId: z.number().int().positive().optional(),
  /**
   * Mapa de día en español → lista de horarios.
   * Cada horario tiene `description` (HH:MM) e `isSelected` (booleano).
   */
  hours: z.record(
    z.string(),
    z.array(z.object({ description: z.string(), isSelected: z.boolean() }))
  ),
  /**
   * Mapa de día en español → fecha ISO concreta.
   * Solo presente en el flujo de turno suelto (clase suelta, pack 4).
   */
  dates: z.record(z.string(), z.string()).optional(),
});

/** Esquema Zod para actualizar el estado de un turno. */
export const updateShiftStatusSchema = z.object({
  /** Nuevo estado del turno. */
  status: z.enum(['NEXT', 'COMPLETED', 'CANCELED']),
});

/** Esquema Zod para reagendar un turno a una nueva fecha y hora. */
export const rescheduleShiftSchema = z.object({
  /** Nueva fecha del turno en formato ISO. */
  date: z.string(),
  /** Nueva hora del turno en formato HH:MM. */
  time: z.string(),
});

/** DTO tipado para crear turnos, inferido desde `createShiftsSchema`. */
export type CreateShiftsDto = z.infer<typeof createShiftsSchema>;
/** DTO tipado para actualizar estado, inferido desde `updateShiftStatusSchema`. */
export type UpdateShiftStatusDto = z.infer<typeof updateShiftStatusSchema>;
/** DTO tipado para reagendar, inferido desde `rescheduleShiftSchema`. */
export type RescheduleShiftDto = z.infer<typeof rescheduleShiftSchema>;
