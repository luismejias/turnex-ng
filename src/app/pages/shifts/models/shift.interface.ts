import { Specialty } from "../components";
import { TypeShifts } from "../shift.enum";

export interface Shift {
  day: string;
  date: string;
  time: string;
  specialty?: Specialty;
  status: TypeShifts
}
