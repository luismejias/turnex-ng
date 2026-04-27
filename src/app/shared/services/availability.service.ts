import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AdminSpecialty, AvailabilitySlot } from 'src/app/pages/admin/models/admin.models';

/**
 * Servicio de disponibilidad pública.
 * Expone los endpoints sin autenticación que devuelven especialidades y slots
 * disponibles para una empresa, usados en el flujo de selección de turno.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private base = `${API_URL}/availability`;

  /**
   * Obtiene la lista de especialidades activas de una empresa.
   * @param companyId - ID de la empresa.
   * @returns Observable con las especialidades de la empresa.
   */
  getSpecialties(companyId: number): Observable<AdminSpecialty[]> {
    return this.http.get<AdminSpecialty[]>(`${this.base}/companies/${companyId}/specialties`);
  }

  /**
   * Obtiene los slots de disponibilidad de una especialidad para una fecha concreta.
   * Cada slot indica capacidad total, turnos reservados y cupos restantes.
   * @param companyId - ID de la empresa.
   * @param specialtyId - ID de la especialidad de empresa (CompanySpecialty).
   * @param date - Fecha en formato ISO `YYYY-MM-DD`.
   * @returns Observable con la lista de slots de disponibilidad.
   */
  getSlots(companyId: number, specialtyId: number, date: string): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(
      `${this.base}/companies/${companyId}/specialties/${specialtyId}`,
      { params: { date } }
    );
  }
}
