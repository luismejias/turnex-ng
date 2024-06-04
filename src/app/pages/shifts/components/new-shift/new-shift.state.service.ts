import { Injectable } from '@angular/core';
import { SimpleStoreService } from 'src/app/simple-store.service';
import { Day, Hour } from '../../models';
export interface NewShiftState {
  step: number;
  pack: string;
  specialty: string;
  days: Day[];
  hours: Record<string, Hour[]>;
}
@Injectable({
  providedIn: 'root'
})
export class NewShiftState extends SimpleStoreService<NewShiftState> {
  constructor() {
    super();
  }

}
