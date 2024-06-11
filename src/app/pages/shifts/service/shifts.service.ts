import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Shift } from 'src/app/models';
import { TypeShifts } from '../shift.enum';
const shifts: Shift[] = [
  {
    id: 1,
    userId: 123,
    date: new Date('2022-10-15T08:00:00.000Z'),
    status: TypeShifts.COMPLETED,
    clientId: 456,
    specialityID: 789,
    active: true
  },
  {
    id: 2,
    userId: 456,
    date: new Date ('2022-10-20T13:30:00.000Z'),
    status: TypeShifts.CANCELED,
    clientId: 789,
    specialityID: 123,
    active: false
  },
  {
    id: 3,
    userId: 789,
    date: new Date ('2022-11-03T10:00:00.000Z'),
    status: TypeShifts.NEXT,
    clientId: 123,
    specialityID: 456,
    active: true
  },
  {
    id: 4,
    userId: 123,
    date: new Date ('2022-11-08T14:15:00.000Z'),
    status: TypeShifts.COMPLETED,
    clientId: 789,
    specialityID: 456,
    active: true
  },
  {
    id: 4,
    userId: 123,
    date: new Date ('2022-11-08T14:15:00.000Z'),
    status: TypeShifts.CANCELED,
    clientId: 789,
    specialityID: 456,
    active: true
  },
  {
    id: 4,
    userId: 123,
    date: new Date ('2022-11-08T14:15:00.000Z'),
    status: TypeShifts.COMPLETED,
    clientId: 789,
    specialityID: 456,
    active: true
  },
  {
    id: 4,
    userId: 123,
    date: new Date ('2022-11-08T14:15:00.000Z'),
    status: TypeShifts.CANCELED,
    clientId: 789,
    specialityID: 456,
    active: true
  },
  {
    id: 4,
    userId: 123,
    date: new Date ('2022-11-08T14:15:00.000Z'),
    status: TypeShifts.NEXT,
    clientId: 789,
    specialityID: 456,
    active: true
  }
];
@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  private readonly _http = inject(HttpClient);

  getAllPropducts(): Observable<unknown> {
    return this._http.get('https://sssfakestoreapi.com/products');
  }

  getShifts(): Observable<Shift[]> {
    return of(shifts);
  }
}
