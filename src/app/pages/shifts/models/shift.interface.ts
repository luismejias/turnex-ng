import { Pack, Specialty } from 'src/app/models';
import { TypeShifts } from '../shift.enum';

/** Representa un turno registrado en el sistema para el usuario autenticado. */
export interface Shift {
  /** Identificador único del turno. */
  id: number;
  /** Nombre del día en español (ej. "Lunes"). */
  day: string;
  /** Fecha del turno en formato ISO. */
  date: string;
  /** Hora del turno en formato HH:MM. */
  time: string;
  /** Pack asociado al turno (puede ser null para turnos sueltos). */
  pack?: Pack;
  /** Especialidad genérica asociada al turno. */
  specialty?: Specialty;
  /** ID de la especialidad de empresa (CompanySpecialty) asociada al turno. */
  companySpecialtyId?: number | null;
  /** Estado actual del turno en su ciclo de vida. */
  status: TypeShifts;
}

/** Payload enviado al backend para crear uno o varios turnos. */
export interface CreateShiftsPayload {
  /** ID del pack seleccionado. */
  packId: number;
  /** ID de la especialidad genérica (opcional). */
  specialtyId?: number;
  /** ID de la especialidad de empresa (opcional). */
  companySpecialtyId?: number;
  /**
   * Mapa de días a horarios seleccionados.
   * La clave es el nombre del día en español; el valor es la lista de horarios marcados.
   */
  hours: Record<string, { description: string; isSelected: boolean }[]>;
  /**
   * Mapa de días a fechas ISO concretas.
   * Solo presente en el flujo de turno suelto (semana).
   */
  dates?: Record<string, string>;
}
