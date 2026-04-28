/** Roles disponibles en el sistema. */
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

/** Representa un usuario registrado en el sistema. */
export interface User {
  /** Identificador único del usuario. */
  id: number;
  /** Nombre de pila del usuario. */
  name: string;
  /** Apellido del usuario. */
  lastName: string;
  /** Contraseña en texto plano (solo presente en formularios, nunca se persiste). */
  password?: string;
  /** Dirección de correo electrónico única del usuario. */
  email: string;
  /** Rol que determina los permisos del usuario en la aplicación. */
  role: UserRole;
  /** Indica si la cuenta del usuario está habilitada. */
  active: boolean;
  /** `true` hasta que el usuario completa su primera reserva de turno. */
  firstLogin?: boolean;
  /** Indica si el usuario aceptó los términos y condiciones. */
  termAndConditions: boolean;
  /** ID de la empresa a la que pertenece el usuario (null para SUPER_ADMIN). */
  companyId?: number | null;
  /** Fecha de creación de la cuenta en formato ISO. */
  createdAt?: string;
}

/** Respuesta del servidor tras un login o registro exitoso. */
export interface AuthResponse {
  /** Datos del usuario autenticado. */
  user: User;
  /** JWT de sesión que debe enviarse en el header `Authorization: Bearer <token>`. */
  token: string;
}
