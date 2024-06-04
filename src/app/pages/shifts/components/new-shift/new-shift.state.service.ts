import { Injectable } from '@angular/core';
import { SimpleStoreService } from 'src/app/simple-store.service';
import { NewShiftState } from '../../models/new-shift-state.interface';

@Injectable({
  providedIn: 'root'
})
export class NewShiftStateService extends SimpleStoreService<NewShiftState> {
  constructor() {
    super();
  }

}
