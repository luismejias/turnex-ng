import { Day } from "./day.interface";
import { Hour } from "./hour.interface";

export interface NewShiftState {
  step: number;
  pack: string;
  specialty: string;
  days: Day[] | undefined;
  hours: Record<string, Hour[]> | undefined;
}
