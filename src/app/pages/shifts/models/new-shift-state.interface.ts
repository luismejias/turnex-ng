import { Pack, Specialty } from "src/app/models";
import { AdminSpecialty } from "src/app/pages/admin/models/admin.models";
import { Day } from "./day.interface";
import { Hour } from "./hour.interface";
import { Shift } from "./shift.interface";

export interface NewShiftState {
  step: number;
  pack: Pack | undefined;
  specialty: Specialty | undefined;
  companySpecialty: AdminSpecialty | undefined;
  days: Day[] | undefined;
  hours: Record<string, Hour[]> | undefined;
  dates?: Record<string, string>; // dayName -> ISO date string (clase suelta)
  shiftsCalculated?: Shift[];
}
