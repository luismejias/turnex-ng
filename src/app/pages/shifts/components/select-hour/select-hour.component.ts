import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CurrentWeek, Day, Hour, Shift } from '../../models';
import { Pack, step } from 'src/app/models';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { WeekPagerComponent } from '../week-pager/week-pager.component';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { AvailabilitySlot } from 'src/app/pages/admin/models/admin.models';
import { daysOfWeek } from 'src/app/pages/constants';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShiftsService } from '../../service';
import { TypeShifts } from '../../shift.enum';

/** Mapa de nombre de día → lista de horarios, usado internamente por `SelectHourComponent`. */
export interface TimesByDay { [key: string]: Hour[]; }

@Component({
  selector: 'turnex-select-hour',
  imports: [WeekPagerComponent, NgClass, DatePipe],
  templateUrl: './select-hour.component.html',
  styleUrl: './select-hour.component.scss',
})
/**
 * Componente de selección de horarios (paso 4 del wizard de nuevo turno).
 * Carga la disponibilidad real desde el backend y marca los slots ya reservados
 * por el usuario para evitar duplicados. Soporta modo week-pager (pack 4).
 */
export class SelectHourComponent implements OnInit {
  /** Cantidad de horas de rango del horario de la especialidad. */
  @Input({ required: true }) hoursCount!: number;
  /** Intervalo en minutos entre cada slot de horario. */
  @Input({ required: true }) interval!: number;
  /** Hora de inicio del horario en formato HH:MM. */
  @Input({ required: true }) startTime!: string;

  private newShiftStateService = inject(NewShiftStateService);
  private availabilityService = inject(AvailabilityService);
  private shiftsService = inject(ShiftsService);

  /** `true` cuando el pack activo es el pack 4 (clase suelta) y se muestra el week-pager. */
  weekPagerIsVisible = false;
  /** `true` mientras se espera la respuesta del endpoint de disponibilidad. */
  loadingAvailability = false;
  /** Días seleccionados en el paso anterior (para packs regulares). */
  selectedDays: Day[] = [];
  /** Mapa de día → lista de horarios con disponibilidad y selección. */
  selectedDaysWithTimes!: Record<string, Hour[]>;
  /** Mapa de nombre de día → fecha ISO concreta (usado en modo week-pager). */
  dayDates: Record<string, string> = {};
  /** Lista base de horarios generados a partir de `startTime`, `interval` y `hoursCount`. */
  hours!: Hour[];
  step = step;
  /** Pack activo del usuario (leído desde el estado del wizard). */
  pack!: Pack | undefined;
  /**
   * Set de claves compuestas para detectar turnos ya reservados en O(1).
   * Formato: `date|YYYY-MM-DD|HH:MM` (week-pager) o `day|NombreDia|HH:MM` (regular).
   */
  private bookedTimes = new Set<string>();

  ngOnInit(): void {
    this.hours = this._generateTimes();
    const { days, pack } = this.newShiftStateService.state();
    this.pack = pack;
    this.weekPagerIsVisible = this.pack?.id === 4;

    this.shiftsService.getShifts().pipe(
      catchError(() => of([] as Shift[]))
    ).subscribe(shifts => {
      const spId = this._companySpecialty?.id;
      shifts
        .filter(s => s.status === TypeShifts.NEXT && s.companySpecialtyId === spId)
        .forEach(s => {
          const dateKey = this._toLocalDateString(new Date(s.date));
          this.bookedTimes.add(`date|${dateKey}|${s.time}`);
          this.bookedTimes.add(`day|${s.day}|${s.time}`);
        });

      if (this.weekPagerIsVisible) {
        this.setCurrentWeek(this._currentWeek());
      } else {
        this.selectedDays = days ?? [];
        this.selectedDaysWithTimes = this._generateTimesForSelectedDays(this.selectedDays);
        this._computeDayDatesForRegularPack();
        this._loadAvailability();
      }
    });
  }

  private get $hours() { return this.newShiftStateService.state().hours; }
  private get _companySpecialty() { return this.newShiftStateService.state().companySpecialty; }
  private get _scheduleDays(): string[] { return this._companySpecialty?.schedule?.days ?? []; }

  // ── Week helpers ──────────────────────────────────────────────────────────

  private _currentWeek(): CurrentWeek {
    const today = new Date();
    const dow = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dow + (dow === 0 ? -6 : 1));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  // ── Availability loading ──────────────────────────────────────────────────

  private _toLocalDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private _computeDayDatesForRegularPack(): void {
    const DAY_INDEX: Record<string, number> = {
      Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
      Jueves: 4, Viernes: 5, Sábado: 6,
    };
    const today = new Date();
    this.selectedDays.filter(d => d.isSelected).forEach(day => {
      const target = DAY_INDEX[day.description] ?? 1;
      const current = today.getDay();
      const diff = (target - current + 7) % 7 || 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      this.dayDates[day.description] = this._toLocalDateString(next);
    });
  }

  private _loadAvailability(): void {
    const sp = this._companySpecialty;
    if (!sp) return;

    const days = this.selectedDays.filter(d => d.isSelected);
    if (!days.length) return;

    this.loadingAvailability = true;

    const requests = days.map(day => {
      const date = this.dayDates[day.description];
      if (!date) return of([] as AvailabilitySlot[]);
      return this.availabilityService.getSlots(sp.companyId, sp.id, date).pipe(
        catchError(() => of([] as AvailabilitySlot[]))
      );
    });

    forkJoin(requests).subscribe(results => {
      const daysWithSlots: string[] = [];

      days.forEach((day, i) => {
        const slots = results[i];
        if (!slots.length) {
          // No availability for this day — remove it entirely
          delete this.selectedDaysWithTimes[day.description];
          return;
        }
        daysWithSlots.push(day.description);
        const slotMap: Record<string, AvailabilitySlot> = {};
        slots.forEach(s => { slotMap[s.time] = s; });
        this.selectedDaysWithTimes[day.description] = this.selectedDaysWithTimes[day.description]
          .map(h => {
            const slot = slotMap[h.description];
            const base = slot
              ? { ...h, available: slot.available, capacity: slot.capacity }
              : { ...h, available: 0, capacity: 0 };
            const dateKey = this.dayDates[day.description];
            const isBooked = this.weekPagerIsVisible
              ? this.bookedTimes.has(`date|${dateKey}|${h.description}`)
              : this.bookedTimes.has(`day|${day.description}|${h.description}`);
            return isBooked ? { ...base, available: 0, alreadyBooked: true } : base;
          });
      });

      // Hide days that had no slots (applies to week pager and regular packs)
      this.selectedDays = this.selectedDays.filter(d => daysWithSlots.includes(d.description));
      this.loadingAvailability = false;
    });
  }

  // ── Hour selection ────────────────────────────────────────────────────────

  onHourSelect(hour: Hour) {
    if (hour.available === 0) return;
    const wasSelected = hour.isSelected;
    const dayKey = this._getDayKeyForHour(hour);

    if (this.weekPagerIsVisible) {
      Object.values(this.selectedDaysWithTimes).forEach(hours =>
        hours.forEach(h => { h.isSelected = false; })
      );
      if (dayKey) {
        const specificDay = this.selectedDays.find(d => d.description === dayKey);
        if (specificDay?.date) {
          this.newShiftStateService.set('dates', {
            [dayKey]: new Date(specificDay.date).toISOString(),
          });
        }
      }
    } else {
      if (dayKey) {
        this.selectedDaysWithTimes[dayKey].forEach(h => { h.isSelected = false; });
      }
    }

    hour.isSelected = !wasSelected;
    this.newShiftStateService.set(this.step.HOURS, this.selectedDaysWithTimes);
  }

  setCurrentWeek(currentWeek: CurrentWeek) {
    const scheduleDays = this._scheduleDays;
    const daysRange = this.getDaysInRange(currentWeek)
      .filter(d => !scheduleDays.length || scheduleDays.includes(d.description));

    this.selectedDays = daysRange;
    this.selectedDaysWithTimes = this._generateTimesForAllDays(daysRange);

    daysRange.forEach(day => {
      if (day.date) {
        this.dayDates[day.description] = this._toLocalDateString(new Date(day.date));
      }
    });
    this._loadAvailability();
  }

  getDaysInRange(currentWeek: CurrentWeek): Day[] {
    const startDate = new Date(currentWeek.start);
    const endDate = new Date(currentWeek.end);
    const result: Day[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = daysOfWeek[d.getDay()].description;
      result.push({ description: dayOfWeek, date: new Date(d), isSelected: true });
    }
    return result;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _getDayKeyForHour(target: Hour): string | undefined {
    for (const day in this.selectedDaysWithTimes) {
      if (this.selectedDaysWithTimes[day].includes(target)) return day;
    }
    return undefined;
  }

  private _generateTimes(): Hour[] {
    const times: Hour[] = [];
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    for (let i = 0; i < this.hoursCount * 60; i += this.interval) {
      const total = startInMinutes + i;
      times.push({
        description: `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`,
        isSelected: false,
      });
    }
    return times;
  }

  private _generateTimesForSelectedDays(selectedDays: Day[]): Record<string, Hour[]> {
    const timesByDay: Record<string, Hour[]> = {};
    selectedDays?.forEach(day => {
      if (day.isSelected) timesByDay[day.description] = this._generateTimes();
    });
    const filtered = this.$hours ? this._filterHoursByTimesByDay(timesByDay, this.$hours) : timesByDay;
    return { ...timesByDay, ...filtered };
  }

  private _generateTimesForAllDays(days: Day[]): Record<string, Hour[]> {
    const timesByDay: Record<string, Hour[]> = {};
    days.forEach(day => { timesByDay[day.description] = this._generateTimes(); });
    return this.$hours ? this._filterHoursByTimesByDay(timesByDay, this.$hours) : timesByDay;
  }

  private _filterHoursByTimesByDay(timesByDay: TimesByDay, hours: TimesByDay): TimesByDay {
    const filtered: TimesByDay = {};
    for (const day in timesByDay) {
      if (Object.prototype.hasOwnProperty.call(hours, day)) filtered[day] = hours[day];
    }
    return filtered;
  }
}
