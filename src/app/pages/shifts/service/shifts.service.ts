import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TypeShifts } from '../shift.enum';
import { NewShiftState } from '../models/new-shift-state.interface';
import { Hour, Shift, CreateShiftsPayload } from '../models';
import { daysOfWeek } from 'src/app/pages/constants';
import { API_URL } from 'src/app/shared/api.config';

/**
 * Servicio de turnos del usuario autenticado.
 * Centraliza todas las operaciones CRUD de turnos contra el backend.
 */
@Injectable({ providedIn: 'root' })
export class ShiftsService {
  private http = inject(HttpClient);

  /**
   * Obtiene todos los turnos del usuario autenticado.
   * El backend auto-completa los turnos con fecha ≤ (ahora + 1 h) antes de responder.
   * @returns Observable con la lista de turnos del usuario.
   */
  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts`);
  }

  /**
   * Crea uno o varios turnos a partir del estado final del wizard de nuevo turno.
   * @param newShiftState - Estado completo del flujo de creación de turno.
   * @returns Observable con los turnos creados.
   */
  saveShifts(newShiftState: NewShiftState): Observable<Shift[]> {
    const payload = this._buildPayload(newShiftState);
    return this.http.post<Shift[]>(`${API_URL}/shifts`, payload);
  }

  /**
   * Actualiza el estado de un turno (ej. cancelar o completar manualmente).
   * @param shiftId - ID del turno a modificar.
   * @param status - Nuevo estado del turno.
   * @returns Observable con el turno actualizado.
   */
  updateShiftStatus(shiftId: number, status: TypeShifts): Observable<Shift> {
    return this.http.patch<Shift>(`${API_URL}/shifts/${shiftId}`, { status });
  }

  /**
   * Reagenda un turno existente a una nueva fecha y hora.
   * El turno original se cancela y se crea uno nuevo.
   * @param shiftId - ID del turno original.
   * @param date - Nueva fecha en formato ISO.
   * @param time - Nueva hora en formato HH:MM.
   * @returns Observable con el nuevo turno creado.
   */
  rescheduleShift(shiftId: number, date: string, time: string): Observable<Shift> {
    return this.http.post<Shift>(`${API_URL}/shifts/${shiftId}/reschedule`, { date, time });
  }

  /**
   * Elimina un turno de forma permanente.
   * @param shiftId - ID del turno a eliminar.
   * @returns Observable vacío que completa al eliminar el turno.
   */
  deleteShift(shiftId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/shifts/${shiftId}`);
  }

  /**
   * Filtra un mapa de horarios conservando solo los que el usuario seleccionó.
   * @param hours - Mapa de día → lista de horarios (seleccionados y no seleccionados).
   * @returns Mapa con los mismos días pero únicamente los horarios con `isSelected = true`.
   */
  filterSelectedHours(hours: Record<string, Hour[]>): Record<string, Hour[]> {
    const filtered: Record<string, Hour[]> = {};
    for (const day in hours) {
      if (Object.prototype.hasOwnProperty.call(hours, day)) {
        filtered[day] = hours[day].filter((h) => h.isSelected);
      }
    }
    return filtered;
  }

  /**
   * Construye un mapa de nombre de día en español → índice numérico (0 = lunes).
   * Útil para convertir nombres de días a valores comparables.
   * @returns Mapa `{ "Lunes": 0, "Martes": 1, … }`.
   */
  getDaysOfWeekInEnglish(): Record<string, number> {
    const map: Record<string, number> = {};
    daysOfWeek.forEach((day, i) => { map[day.description] = i; });
    return map;
  }

  /**
   * Construye el payload de creación de turnos a partir del estado del wizard.
   * @param state - Estado completo del flujo de nuevo turno.
   * @returns Payload listo para enviar al backend.
   */
  private _buildPayload(state: NewShiftState): CreateShiftsPayload {
    return {
      packId: state.pack!.id,
      specialtyId: state.specialty?.id,
      companySpecialtyId: state.companySpecialty?.id,
      hours: state.hours ?? {},
      ...(state.dates ? { dates: state.dates } : {}),
    };
  }
}
