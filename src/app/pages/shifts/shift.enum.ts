/** Estados posibles de un turno a lo largo de su ciclo de vida. */
export enum TypeShifts {
  /** El turno está agendado y aún no ocurrió. */
  NEXT = 'NEXT',
  /** El turno ya se llevó a cabo (auto-completado 1 h antes del inicio). */
  COMPLETED = 'COMPLETED',
  /** El turno fue cancelado por el usuario o por un administrador. */
  CANCELED = 'CANCELED',
}
