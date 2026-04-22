import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TypeShifts } from '../shift.enum';
import { NewShiftState } from '../models/new-shift-state.interface';
import { Hour, Shift, CreateShiftsPayload } from '../models';
import { daysOfWeek } from 'src/app/pages/constants';
import { API_URL } from 'src/app/shared/api.config';

@Injectable({ providedIn: 'root' })
export class ShiftsService {
  private http = inject(HttpClient);

  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts`);
  }

  saveShifts(newShiftState: NewShiftState): Observable<Shift[]> {
    const payload = this._buildPayload(newShiftState);
    return this.http.post<Shift[]>(`${API_URL}/shifts`, payload);
  }

  updateShiftStatus(shiftId: number, status: TypeShifts): Observable<Shift> {
    return this.http.patch<Shift>(`${API_URL}/shifts/${shiftId}`, { status });
  }

  rescheduleShift(shiftId: number, date: string, time: string): Observable<Shift> {
    return this.http.post<Shift>(`${API_URL}/shifts/${shiftId}/reschedule`, { date, time });
  }

  deleteShift(shiftId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/shifts/${shiftId}`);
  }

  filterSelectedHours(hours: Record<string, Hour[]>): Record<string, Hour[]> {
    const filtered: Record<string, Hour[]> = {};
    for (const day in hours) {
      if (Object.prototype.hasOwnProperty.call(hours, day)) {
        filtered[day] = hours[day].filter((h) => h.isSelected);
      }
    }
    return filtered;
  }

  getDaysOfWeekInEnglish(): Record<string, number> {
    const map: Record<string, number> = {};
    daysOfWeek.forEach((day, i) => { map[day.description] = i; });
    return map;
  }

  private _buildPayload(state: NewShiftState): CreateShiftsPayload {
    return {
      packId: state.pack!.id,
      specialtyId: state.specialty!.id,
      hours: state.hours ?? {},
      ...(state.dates ? { dates: state.dates } : {}),
    };
  }
}
