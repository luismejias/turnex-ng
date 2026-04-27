/** Roles de usuario disponibles en el panel de administración. */
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Especialidad de empresa: vincula una {@link AdminCompany} con una especialidad
 * y el horario configurado para ella.
 */
export interface AdminSpecialty {
  /** Identificador único de la especialidad de empresa. */
  id: number;
  /** ID de la empresa a la que pertenece. */
  companyId: number;
  /** ID del horario asignado (null si no tiene horario). */
  scheduleId: number | null;
  /** Nombre de la especialidad (ej. "Yoga avanzado"). */
  name: string;
  /** Descripción opcional de la especialidad. */
  description?: string;
  /** Capacidad máxima de personas por slot de horario. */
  capacity: number;
  /** Indica si la especialidad está activa y visible para los clientes. */
  active: boolean;
  /** Horario asociado a la especialidad (incluido cuando se requiere). */
  schedule?: {
    /** Identificador único del horario. */
    id: number;
    /** Nombre descriptivo del horario. */
    name: string;
    /** Hora de inicio en formato HH:MM. */
    timeFrom: string;
    /** Hora de fin en formato HH:MM. */
    timeTo: string;
    /** Periodicidad del horario (ej. "WEEKLY"). */
    periodicity: string;
    /** Días de la semana en los que aplica el horario (ej. ["Lunes", "Miércoles"]). */
    days: string[];
  };
}

/** Representa la disponibilidad de un slot horario para una especialidad. */
export interface AvailabilitySlot {
  /** Hora del slot en formato HH:MM. */
  time: string;
  /** Capacidad máxima configurada para el slot. */
  capacity: number;
  /** Cantidad de turnos ya reservados en el slot. */
  booked: number;
  /** Cupos restantes disponibles (`capacity - booked`). */
  available: number;
}

/** Datos de un usuario gestionado desde el panel de administración. */
export interface AdminUser {
  /** Identificador único del usuario. */
  id: number;
  /** Nombre de pila del usuario. */
  name: string;
  /** Apellido del usuario. */
  lastName: string;
  /** Correo electrónico del usuario. */
  email: string;
  /** Rol del usuario dentro del sistema. */
  role: UserRole;
  /** Indica si la cuenta está habilitada. */
  active: boolean;
  /** ID de la empresa a la que pertenece el usuario. */
  companyId: number;
  /** Fecha de creación de la cuenta en formato ISO. */
  createdAt: string;
}

/** Datos de un perfil de staff (instructor, recepcionista, etc.) de una empresa. */
export interface AdminProfile {
  /** Identificador único del perfil. */
  id: number;
  /** URL de la foto de perfil (opcional). */
  photo?: string;
  /** Tipo de perfil dentro de la empresa. */
  type: 'Administrador' | 'Instructor' | 'Recepcionista';
  /** Nombre de pila del profesional. */
  name: string;
  /** Apellido del profesional. */
  lastName: string;
  /** Teléfono de contacto. */
  phone: string;
  /** Correo electrónico de contacto. */
  email: string;
  /** Indica si el perfil está activo. */
  active: boolean;
}

/** Datos de un horario (schedule) configurado en una empresa. */
export interface AdminShift {
  /** Identificador único del horario. */
  id: number;
  /** Nombre del horario. */
  name: string;
  /** Perfil del instructor asignado (opcional). */
  assignedProfile?: AdminProfile;
  /** Días de la semana en los que aplica el horario. */
  days: string[];
  /** Hora de inicio en formato HH:MM. */
  timeFrom: string;
  /** Hora de fin en formato HH:MM. */
  timeTo: string;
  /** Periodicidad del horario (ej. "WEEKLY"). */
  periodicity: string;
  /** Packs habilitados para este horario. */
  packs: string[];
}

/** Turno de un usuario visto desde el panel de administración. */
export interface AdminUserShift {
  /** Identificador único del turno. */
  id: number;
  /** Nombre del día en español. */
  day: string;
  /** Fecha del turno en formato ISO. */
  date: string;
  /** Hora del turno en formato HH:MM. */
  time: string;
  /** Estado actual del turno. */
  status: 'NEXT' | 'COMPLETED' | 'CANCELED';
  /** Pack asociado al turno (null si es turno suelto). */
  pack?: { id: number; description: string } | null;
  /** Especialidad de empresa asociada al turno. */
  companySpecialty?: { id: number; name: string } | null;
}

/** Datos completos de una empresa gestionada desde el panel de administración. */
export interface AdminCompany {
  /** Identificador único de la empresa. */
  id: number;
  /** URL del logo de la empresa (opcional). */
  logo?: string;
  /** Nombre de la empresa. */
  name: string;
  /** CUIT de la empresa. */
  cuit: string;
  /** Teléfono de contacto. */
  phone: string;
  /** Dirección física. */
  address: string;
  /** Tipo de servicio que ofrece la empresa. */
  service: string;
  /** Lista de perfiles de staff de la empresa. */
  profiles: AdminProfile[];
  /** Lista de horarios configurados en la empresa. */
  shifts: AdminShift[];
  /** Lista de usuarios registrados en la empresa. */
  users: AdminUser[];
  /** Lista de especialidades configuradas en la empresa. */
  specialties: AdminSpecialty[];
}
