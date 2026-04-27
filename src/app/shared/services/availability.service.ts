import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AdminSpecialty, AvailabilitySlot } from 'src/app/pages/admin/models/admin.models';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private base = `${API_URL}/availability`;

  getSpecialties(companyId: number): Observable<AdminSpecialty[]> {
    return this.http.get<AdminSpecialty[]>(`${this.base}/companies/${companyId}/specialties`);
  }

  getSlots(companyId: number, specialtyId: number, date: string): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(
      `${this.base}/companies/${companyId}/specialties/${specialtyId}`,
      { params: { date } }
    );
  }
}
