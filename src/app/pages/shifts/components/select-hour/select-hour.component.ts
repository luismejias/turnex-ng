import { DatePipe, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CurrentWeek, Day, Hour } from '../../models';
import { Pack, step } from 'src/app/models';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { WeekPagerComponent } from '../week-pager/week-pager.component';
import { daysOfWeek } from 'src/app/pages/constants';
export interface TimesByDay {
  [key: string]: Hour[];
}
@Component({
  selector: 'turnex-select-hour',
  imports: [WeekPagerComponent, NgClass, DatePipe],
  templateUrl: './select-hour.component.html',
  styleUrl: './select-hour.component.scss',
})
export class SelectHourComponent implements OnInit {
  @Input({ required: true }) hoursCount!: number;
  @Input({ required: true }) interval!: number;
  @Input({ required: true }) startTime!: string;
  @Input() currentWeekData!: CurrentWeek;
  weekPagerIsVisible = false;
  selectedDays: Day[] = [];
  selectedDaysWithTimes!: Record<string, Hour[]>;
  hours!: Hour[];
  step = step;
  pack!: Pack | undefined;
  constructor(private newShiftStateService: NewShiftStateService) {}
  ngOnInit(): void {
    this.hours = this._generateTimes();
    const { days, pack } = this.newShiftStateService.state();
    this.pack = pack;
    this.weekPagerIsVisible = this.pack?.id === 4;
    this.selectedDays = days ? days : [];
    this.selectedDaysWithTimes = this._generateTimesForSelectedDays(
      this.selectedDays
    );
  }

  private get $hours() {
    return this.newShiftStateService.state().hours;
  }

  onHourSelect(hour: Hour) {
    const wasSelected = hour.isSelected;
    const dayKey = this._getDayKeyForHour(hour);

    if (this.weekPagerIsVisible) {
      // Clase suelta: clear all hours across all days (only 1 total)
      Object.values(this.selectedDaysWithTimes).forEach(hours =>
        hours.forEach(h => { h.isSelected = false; })
      );
      // Persist the specific date for this day so the backend creates exactly 1 shift
      if (dayKey) {
        const specificDay = this.selectedDays.find(d => d.description === dayKey);
        if (specificDay?.date) {
          this.newShiftStateService.set('dates', {
            [dayKey]: new Date(specificDay.date).toISOString(),
          });
        }
      }
    } else {
      // Regular pack: clear all hours for this day only (1 per day)
      if (dayKey) {
        this.selectedDaysWithTimes[dayKey].forEach(h => { h.isSelected = false; });
      }
    }

    hour.isSelected = !wasSelected;
    this.newShiftStateService.set(this.step.HOURS, this.selectedDaysWithTimes);
  }

  private _getDayKeyForHour(target: Hour): string | undefined {
    for (const day in this.selectedDaysWithTimes) {
      if (this.selectedDaysWithTimes[day].includes(target)) return day;
    }
    return undefined;
  }

  private _generateTimes(): Hour[] {
    const times: Hour[] = [];
    const minutesPerHour = 60;

    // Convertir la hora de inicio en minutos totales
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const startInMinutes = startHour * minutesPerHour + startMinute;

    for (let i = 0; i < this.hoursCount * minutesPerHour; i += this.interval) {
      const totalMinutes = startInMinutes + i;
      const currentHour = Math.floor(totalMinutes / minutesPerHour);
      const currentMinute = totalMinutes % minutesPerHour;

      // Formatear las horas y los minutos para que tengan siempre dos dígitos
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');

      times.push({
        description: `${formattedHour}:${formattedMinute}`,
        isSelected: false,
      });
    }

    return times;
  }

  private _generateTimesForSelectedDays(
    selectedDays: Day[]
  ): Record<string, Hour[]> {
    const timesByDay: Record<string, Hour[]> = {};
    // Iterar sobre cada día de la semana
    selectedDays?.forEach(day => {
      if (day.isSelected) {
        // Generar las horas solo si el día está seleccionado
        timesByDay[day.description] = this._generateTimes();
      }
    });
    const filterHoursByTimesByDay = this.$hours
      ? this._filterHoursByTimesByDay(timesByDay, this.$hours)
      : timesByDay;
    const timesByDayResult = { ...timesByDay, ...filterHoursByTimesByDay };
    return timesByDayResult;
  }

  private _filterHoursByTimesByDay(
    timesByDay: TimesByDay,
    hours: TimesByDay
  ): TimesByDay {
    const filteredHours: TimesByDay = {};

    for (const day in timesByDay) {
      // Verifica si la misma clave existe en hours.
      if (Object.prototype.hasOwnProperty.call(hours, day)) {
        filteredHours[day] = hours[day];
      }
    }
    return filteredHours;
  }

  setCurrentWeek(currentWeek: CurrentWeek) {
    const daysRange = this.getDaysInRange(currentWeek);
    this.selectedDays = daysRange;
    this.selectedDaysWithTimes = this._generateTimesForAllDays(daysRange);
  }

  getDaysInRange(currentWeek: CurrentWeek): Day[] {
    const startDate = new Date(currentWeek.start);
    const endDate = new Date(currentWeek.end);
    const result: Day[] = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = daysOfWeek[d.getDay()].description;
      const dateCopy = new Date(d);
      result.push({
        description: dayOfWeek,
        date: dateCopy,
        isSelected: false,
      });
    }
    return result;
  }

  private _generateTimesForAllDays(days: Day[]): Record<string, Hour[]> {
    const timesByDay: Record<string, Hour[]> = {};
    days.forEach(day => {
      timesByDay[day.description] = this._generateTimes();
    });
    return this.$hours ? this._filterHoursByTimesByDay(timesByDay, this.$hours) : timesByDay;
  }
}
