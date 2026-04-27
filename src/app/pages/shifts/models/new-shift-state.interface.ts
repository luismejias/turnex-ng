import { Pack, Specialty } from "src/app/models";
import { AdminSpecialty } from "src/app/pages/admin/models/admin.models";
import { Day } from "./day.interface";
import { Hour } from "./hour.interface";
import { Shift } from "./shift.interface";

/**
 * Estado completo del flujo de creación de un nuevo turno.
 * Gestionado por {@link NewShiftStateService} mediante señales de Angular.
 */
export interface NewShiftState {
  /** Paso actual del wizard (1 = especialidad, 2 = pack, 3 = día, 4 = hora). */
  step: number;
  /** Pack seleccionado por el usuario. */
  pack: Pack | undefined;
  /** Especialidad genérica seleccionada (catálogo global). */
  specialty: Specialty | undefined;
  /** Especialidad de empresa seleccionada con su horario y capacidad configurados. */
  companySpecialty: AdminSpecialty | undefined;
  /** Días de la semana seleccionados por el usuario. */
  days: Day[] | undefined;
  /**
   * Horarios seleccionados por día.
   * La clave es el nombre del día en español; el valor es la lista de horarios.
   */
  hours: Record<string, Hour[]> | undefined;
  /**
   * Fechas concretas asociadas a cada día (solo turno suelto / clase suelta).
   * La clave es el nombre del día; el valor es la fecha en formato ISO.
   */
  dates?: Record<string, string>;
  /** Turnos resultantes tras el cálculo previo a la confirmación. */
  shiftsCalculated?: Shift[];
}
