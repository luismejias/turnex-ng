import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  private readonly _http = inject(HttpClient);

  getAllPropducts(): Observable<unknown> {
    return this._http.get('https://sssfakestoreapi.com/products');
  }
}
