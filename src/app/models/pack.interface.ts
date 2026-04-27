/** Representa un pack de clases disponible para contratar. */
export interface Pack {
  /** Identificador único del pack. */
  id: number;
  /** Descripción legible del pack (ej. "Pack mensual"). */
  description: string;
  /** Precio del pack en la moneda local. */
  price: number;
  /** Duración del pack expresada como texto (ej. "30 días"). */
  duration: string;
  /** Cantidad de clases incluidas en el pack. */
  classCount: number;
  /** Indica si el pack está disponible para ser contratado. */
  active: boolean;
  /** Estado de selección en la UI del flujo de nuevo turno. */
  isSelected?: boolean;
}
