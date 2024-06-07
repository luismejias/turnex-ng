import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Specialty } from 'src/app/models';
const specialties: Specialty[] = [
  { id: '1', description: 'Pilates', isSelected: false },
  { id: '2', description: 'Osteopatía', isSelected: false }
]; //TODO realizar servicio e integrar con back para data real

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {

  private readonly _http = inject(HttpClient);

  getAllSpecialties(): Observable<Specialty[]>{
    return of(specialties);
  }
}
