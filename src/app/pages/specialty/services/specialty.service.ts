import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Specialty } from 'src/app/models';
import { API_URL } from 'src/app/shared/api.config';

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  private http = inject(HttpClient);

  getAllSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${API_URL}/specialties`);
  }
}
