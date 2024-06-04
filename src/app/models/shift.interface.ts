import { TypeShifts } from "../pages/shifts/shift.enum";

export interface Shift {
  id: number,
  userId: number,
  date: Date,
  clientId: number,
  specialityID: number,
  status: TypeShifts;
  active: boolean,
}
