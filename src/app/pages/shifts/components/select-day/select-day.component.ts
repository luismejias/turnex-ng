import { Component, Input } from '@angular/core';
import { Day } from '../../models';
import { daysOfWeek } from 'src/app/pages/constants';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { step } from 'src/app/models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'turnex-select-day',
  imports: [NgClass],
  templateUrl: './select-day.component.html',
  styleUrl: './select-day.component.scss',
})
/**
 * Componente de selección de días de la semana (paso 3 del wizard de nuevo turno).
 * Respeta el límite de días del pack y filtra los días configurados en el horario.
 */
export class SelectDayComponent {
  /** Máximo de días seleccionables (determinado por `packMaxDays` del padre). */
  @Input({ required: true }) maxDays!: number;
  /**
   * Lista de nombres de días habilitados por el horario de la especialidad.
   * Si está vacía, se muestran todos los días de la semana.
   */
  @Input() availableDays: string[] = [];

  /** Lista completa de días de la semana con su estado de selección. */
  daysOfWeek: Day[] = daysOfWeek.map(d => ({ ...d }));

  /**
   * Lista de días filtrada por `availableDays`.
   * Si `availableDays` está vacío, devuelve todos los días.
   */
  get filteredDaysOfWeek(): Day[] {
    if (!this.availableDays.length) return this.daysOfWeek;
    return this.daysOfWeek.filter(d => this.availableDays.includes(d.description));
  }
  step = step;

  constructor(private newShiftStateService: NewShiftStateService) {}

  /** Cantidad de días actualmente seleccionados por el usuario. */
  get selectedCount(): number {
    return this.daysOfWeek.filter(d => d.isSelected).length;
  }

  /**
   * Maneja la selección/deselección de un día.
   * - Si el día está seleccionado, lo deselecciona.
   * - Si hay cupos disponibles, lo selecciona.
   * - Si `maxDays = 1`, hace auto-swap (deselecciona el anterior y selecciona el nuevo).
   * - Si se alcanzó el máximo en modo multi-día, no hace nada (el contador guía al usuario).
   * @param day - Día que el usuario tocó/clicó.
   */
  onDaySelect(day: Day) {
    if (day.isSelected) {
      day.isSelected = false;
    } else if (this.selectedCount < this.maxDays) {
      day.isSelected = true;
    } else if (this.maxDays === 1) {
      // Auto-swap: deselect current, select new
      this.daysOfWeek.forEach(d => { d.isSelected = false; });
      day.isSelected = true;
    }
    // Multi-day at max: user must deselect one first (counter guides them)
    this.newShiftStateService.set(this.step.DAYS, this.daysOfWeek.filter(d => d.isSelected));
  }
}
