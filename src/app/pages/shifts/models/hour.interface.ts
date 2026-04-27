/** Representa un horario disponible dentro del flujo de selección de turno. */
export interface Hour {
  /** Fecha ISO asociada al horario (solo en modo week-pager). */
  date?: string;
  /** Hora en formato HH:MM (ej. "09:00"). */
  description: string;
  /** Indica si el usuario seleccionó este horario. */
  isSelected: boolean;
  /** Cupos restantes disponibles para este horario. */
  available?: number;
  /** Capacidad máxima configurada para este horario. */
  capacity?: number;
  /** `true` cuando el usuario ya tiene un turno agendado en este horario. */
  alreadyBooked?: boolean;
}
