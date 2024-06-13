import { TypeShifts } from "../shift.enum";

export interface ShiftCalculated {
  day: string;
  date: string;
  time: string;
  status: TypeShifts
}
