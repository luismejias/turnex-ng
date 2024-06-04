import { Component, effect } from '@angular/core';
import { NewShiftState } from '../new-shift/new-shift.state.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'turnex-new-shift-summary',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './new-shift-summary.component.html',
  styleUrl: './new-shift-summary.component.scss'
})
export class NewShiftSummaryComponent {
  state!: NewShiftState;
  constructor(private newShiftState: NewShiftState) {
    effect(() => {
      this.state = this.newShiftState.state();
    })
  }

}
