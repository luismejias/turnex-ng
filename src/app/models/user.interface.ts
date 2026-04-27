export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number,
  name: string,
  lastName: string,
  password?: string,
  email: string,
  role: UserRole,
  active: boolean,
  termAndConditions: boolean,
  companyId?: number | null,
  createdAt?: string,
}

export interface AuthResponse {
  user: User;
  token: string;
}
