/** Rango de fechas que representa la semana actualmente visible en el week-pager. */
export interface CurrentWeek {
  /** Primer día de la semana (lunes). */
  start: Date;
  /** Último día de la semana (domingo). */
  end: Date;
}
