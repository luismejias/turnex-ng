import { Pack, Specialty } from "src/app/models";
import { Day } from "./day.interface";
import { Hour } from "./hour.interface";

export interface NewShiftState {
  step: number;
  pack: Pack | undefined;
  specialty: Specialty | undefined;
  days: Day[] | undefined;
  hours: Record<string, Hour[]> | undefined;
}
