import { Pack, Specialty } from 'src/app/models';
import { TypeShifts } from '../shift.enum';

export interface Shift {
  id: number;
  day: string;
  date: string;
  time: string;
  pack?: Pack;
  specialty?: Specialty;
  status: TypeShifts;
}

export interface CreateShiftsPayload {
  packId: number;
  specialtyId: number;
  hours: Record<string, { description: string; isSelected: boolean }[]>;
  dates?: Record<string, string>; // dayName -> ISO date string (clase suelta)
}
