import { Injectable } from '@angular/core';
import { SimpleStoreService } from 'src/app/simple-store.service';
import { CurrentWeek } from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class CurrentWeekState extends SimpleStoreService<CurrentWeek> {
  constructor() {
    super();
  }
}
