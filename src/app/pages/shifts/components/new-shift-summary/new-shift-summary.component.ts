import { Component, effect } from '@angular/core';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { CommonModule, NgIf } from '@angular/common';
import { NewShiftState } from '../../models/new-shift-state.interface';

@Component({
  selector: 'turnex-new-shift-summary',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './new-shift-summary.component.html',
  styleUrl: './new-shift-summary.component.scss'
})
export class NewShiftSummaryComponent {
  state!: NewShiftState;
  constructor(private newShiftStateService: NewShiftStateService) {
    effect(() => {
      this.state = this.newShiftStateService.state();
    })
  }

}
