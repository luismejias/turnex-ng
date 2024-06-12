import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pack } from 'src/app/models';

const  packs: Pack[] = [
  { id: '1', description: '4 clases al mes', isSelected: false, active: true, duration: '', price: 0},
  { id: '2', description: '8 clases al mes', isSelected: false, active: true, duration: '', price: 0 },
  { id: '3', description: '12 clases al mes', isSelected: false, active: true, duration: '', price: 0 },
  { id: '4', description: 'Clase suelta', isSelected: false, active: true, duration: '', price: 0 },
];

@Injectable({
  providedIn: 'root'
})
export class PacksService {
  private readonly _http = inject(HttpClient);

  getAllPacks(): Observable<Pack[]>{
    return of(packs);
  }
}
