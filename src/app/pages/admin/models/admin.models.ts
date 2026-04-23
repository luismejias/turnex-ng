export interface AdminProfile {
  id: number;
  photo?: string;
  type: 'Administrador' | 'Instructor' | 'Recepcionista';
  name: string;
  lastName: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface AdminShift {
  id: number;
  name: string;
  assignedProfile?: AdminProfile;
  days: string[];
  timeFrom: string;
  timeTo: string;
  periodicity: string;
  packs: string[];
}

export interface AdminCompany {
  id: number;
  logo?: string;
  name: string;
  cuit: string;
  phone: string;
  address: string;
  service: string;
  profiles: AdminProfile[];
  shifts: AdminShift[];
}
