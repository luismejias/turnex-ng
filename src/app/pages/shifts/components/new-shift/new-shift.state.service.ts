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

  setInitialState() {
    this.state.set({
      step: 1,
      pack: undefined,
      specialty: undefined,
      days: undefined,
      hours: undefined
    })
  }

}
