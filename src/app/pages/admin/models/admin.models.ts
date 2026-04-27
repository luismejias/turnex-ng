export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AdminSpecialty {
  id: number;
  companyId: number;
  scheduleId: number | null;
  name: string;
  description?: string;
  capacity: number;
  active: boolean;
  schedule?: {
    id: number;
    name: string;
    timeFrom: string;
    timeTo: string;
    periodicity: string;
    days: string[];
  };
}

export interface AvailabilitySlot {
  time: string;
  capacity: number;
  booked: number;
  available: number;
}

export interface AdminUser {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  active: boolean;
  companyId: number;
  createdAt: string;
}

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

export interface AdminUserShift {
  id: number;
  day: string;
  date: string;
  time: string;
  status: 'NEXT' | 'COMPLETED' | 'CANCELED';
  pack?: { id: number; description: string } | null;
  companySpecialty?: { id: number; name: string } | null;
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
  users: AdminUser[];
  specialties: AdminSpecialty[];
}
