export type UserRole = 'USER' | 'SUPER_ADMIN';

export interface User {
  id: number,
  name: string,
  lastName: string,
  password?: string,
  email: string,
  role: UserRole,
  active: boolean,
  termAndConditions: boolean,
  createdAt?: string,
}

export interface AuthResponse {
  user: User;
  token: string;
}
