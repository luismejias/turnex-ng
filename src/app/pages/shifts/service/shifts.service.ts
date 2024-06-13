import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Shift } from 'src/app/models';
import { TypeShifts } from '../shift.enum';
import { NewShiftState } from '../models/new-shift-state.interface';
import { Hour, ShiftCalculated } from '../models';
import { daysOfWeek } from 'src/app/pages/constants';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  dataStorage!: NewShiftState;
  private readonly _http = inject(HttpClient);


  getAllPropducts(): Observable<unknown> {
    return this._http.get('https://sssfakestoreapi.com/products');
  }

  getShifts() {
    const shiftsStorage = localStorage.getItem('shifts');
    this.dataStorage = shiftsStorage ? JSON.parse(shiftsStorage): [];
    return this.dataStorage;
  }

  saveShifts(newShiftState: NewShiftState) {
    const shiftForMonth = this.createShiftForMonth(newShiftState);
    const shiftForMonthString = JSON.stringify(shiftForMonth);
    localStorage.setItem('shifts', shiftForMonthString);
  }

  // getShift(date: Date): Shift | undefined {
  //   const shifts = localStorage.getItem('users');
  //   this.shifts = shifts ? JSON.parse(shifts) : [];
  //   return this.shifts ? this.shifts.find((shift) => (shift.date === date)) : undefined;
  // }

  filterSelectedHours(hours: Record<string, Hour[]>): Record<string, Hour[]> {
    const filteredSchedule: Record<string, Hour[]> = {};
    for (const day in hours) {
      if (Object.prototype.hasOwnProperty.call(hours, day)) {
        filteredSchedule[day] = hours[day].filter(hour => hour.isSelected);
      }
    }

    return filteredSchedule;
  }

  createShiftForMonth(newShiftState: NewShiftState): NewShiftState {
    const daysOfWeekInEnglish = this.getDaysOfWeekInEnglish();
    const shiftsCalculated: ShiftCalculated[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Obtener el número de días en el mes actual

    if (!newShiftState.hours) return { ...newShiftState, shiftsCalculated: [] };

    for (const day in newShiftState.hours) {
      if (Object.prototype.hasOwnProperty.call(newShiftState.hours, day)) {
        const dayIndex = daysOfWeekInEnglish[day];

        for (let date = 1; date <= daysInMonth; date++) {
          const currentDate = new Date(year, month, date);

          if (currentDate.getDay() === dayIndex) {
            newShiftState.hours[day].forEach(hour => {
              if (hour.isSelected) { // Filtrar solo las horas seleccionadas
                const turn: ShiftCalculated = {
                  day,
                  date: currentDate.toISOString(),
                  time: hour.description,
                  status: TypeShifts.NEXT
                };
                shiftsCalculated.push(turn);
              }
            });
          }
        }
      }
    }

    return { ...newShiftState, shiftsCalculated };
  }

  getDaysOfWeekInEnglish(): { [key: string]: number } {
    const daysOfWeekInEnglish: { [key: string]: number } = {};
    daysOfWeek.forEach((day, index) => {
      daysOfWeekInEnglish[day.description] = index;
    });
    return daysOfWeekInEnglish;
  }
}
