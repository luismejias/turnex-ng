/** Representa un día de la semana dentro del flujo de selección de turno. */
export interface Day {
  /** Nombre del día en español (ej. "Lunes"). */
  description: string;
  /** Fecha concreta asociada al día (solo para turnos sueltos / semana). */
  date?: Date;
  /** Indica si el usuario seleccionó este día. */
  isSelected: boolean;
}
