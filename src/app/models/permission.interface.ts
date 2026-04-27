/** Representa un permiso del sistema (reservado para uso futuro). */
export interface Permission {
  /** Identificador único del permiso. */
  id: number;
  /** Descripción legible del permiso. */
  description: string;
  /** Indica si el permiso está activo. */
  active: boolean;
  /** Fecha de creación del permiso. */
  createAt: Date;
  /** Fecha de la última modificación del permiso. */
  updatedAt: Date;
}
