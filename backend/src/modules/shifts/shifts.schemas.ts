import { z } from 'zod';

export const createShiftsSchema = z.object({
  packId: z.number().int().positive(),
  specialtyId: z.number().int().positive(),
  hours: z.record(
    z.string(),
    z.array(z.object({ description: z.string(), isSelected: z.boolean() }))
  ),
});

export const updateShiftStatusSchema = z.object({
  status: z.enum(['NEXT', 'COMPLETED', 'CANCELED']),
});

export type CreateShiftsDto = z.infer<typeof createShiftsSchema>;
export type UpdateShiftStatusDto = z.infer<typeof updateShiftStatusSchema>;
