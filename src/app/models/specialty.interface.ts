/** Representa una especialidad o disciplina ofrecida por el sistema. */
export interface Specialty {
  /** Identificador único de la especialidad. */
  id: number;
  /** Nombre de la especialidad (ej. "Yoga", "Pilates"). */
  description: string;
  /** Indica si la especialidad está activa y visible para los usuarios. */
  active?: boolean;
  /** Estado de selección en la UI del flujo de nuevo turno. */
  isSelected?: boolean;
}
