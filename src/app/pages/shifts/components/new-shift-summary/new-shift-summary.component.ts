import { Component, effect } from '@angular/core';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';

import { NewShiftState } from '../../models/new-shift-state.interface';

@Component({
  selector: 'turnex-new-shift-summary',
  imports: [],
  templateUrl: './new-shift-summary.component.html',
  styleUrl: './new-shift-summary.component.scss',
})
export class NewShiftSummaryComponent {
  state!: NewShiftState;
  constructor(private newShiftStateService: NewShiftStateService) {
    effect(() => {
      this.state = this.newShiftStateService.state();
    });
  }
}
