import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Day, Hour } from '../../models';
import { step } from 'src/app/models';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
export interface TimesByDay {
  [key: string]: Hour[];
}
@Component({
  selector: 'turnex-select-hour',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './select-hour.component.html',
  styleUrl: './select-hour.component.scss'
})
export class SelectHourComponent implements OnInit {
  @Input({ required: true }) hoursCount!: number;
  @Input({ required: true }) interval!: number;
  @Input({ required: true }) startTime!: string;
  selectedDays!: Day[];
  selectedDaysWithTimes!: Record<string, Hour[]>;
  hours!: Hour[];
  step = step;

  constructor(private newShiftStateService: NewShiftStateService) { }

  ngOnInit(): void {
    this.hours = this._generateTimes();
    const days = this.newShiftStateService.state().days;
    this.selectedDays = days ? days : [];
    this.selectedDaysWithTimes = this._generateTimesForSelectedDays();
  }

  private get $hours() {
    return this.newShiftStateService.state().hours;
  }

  onHourSelect(hour: Hour) {
    hour.isSelected = !hour.isSelected;
    this.newShiftStateService.set(this.step.HOURS, this.selectedDaysWithTimes);
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
        isSelected: false
      });
    }

    return times;
  }

  private _generateTimesForSelectedDays(): Record<string, Hour[]> {
    const timesByDay: Record<string, Hour[]> = {};

    // Iterar sobre cada día de la semana
    this.selectedDays?.forEach(day => {
      if (day.isSelected) {
        // Generar las horas solo si el día está seleccionado
        timesByDay[day.description] = this._generateTimes();
      }
    });
    const filterHoursByTimesByDay = this.$hours ? this._filterHoursByTimesByDay(timesByDay, this.$hours) : timesByDay;
    const timesByDayResult = { ...timesByDay, ...filterHoursByTimesByDay };
    return timesByDayResult;
  }

  private _filterHoursByTimesByDay(timesByDay: TimesByDay, hours: TimesByDay): TimesByDay {
    const filteredHours: TimesByDay = {};

    for (const day in timesByDay) {
      // Verifica si la misma clave existe en hours.
      if (Object.prototype.hasOwnProperty.call(hours, day)) {
        filteredHours[day] = hours[day];
      }
    }
    return filteredHours;
  }
}
