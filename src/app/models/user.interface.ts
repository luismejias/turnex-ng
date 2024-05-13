import { Pack } from "./pack.interface";
import { Permission } from "./permission.interface";
import { Shift } from "./shift.interface";

export interface User {
  id: number,
  name: string,
  lastName: string,
  password: string,
  email: string,
  active: Boolean,
  termAndConditions: Boolean,
  createAt: Date,
  updatedAt: Date,
  shifts: Shift[],
  packs: Pack[],
  permissions: Permission[]

}