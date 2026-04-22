import { Component, Input } from '@angular/core';
import { Day } from '../../models';
import { daysOfWeek } from 'src/app/pages/constants';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { step } from 'src/app/models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'turnex-select-day',
  imports: [NgClass],
  templateUrl: './select-day.component.html',
  styleUrl: './select-day.component.scss',
})
export class SelectDayComponent {
  @Input({ required: true }) maxDays!: number;

  daysOfWeek: Day[] = daysOfWeek.map(d => ({ ...d }));
  step = step;

  constructor(private newShiftStateService: NewShiftStateService) {}

  get selectedCount(): number {
    return this.daysOfWeek.filter(d => d.isSelected).length;
  }

  onDaySelect(day: Day) {
    if (day.isSelected) {
      day.isSelected = false;
    } else if (this.selectedCount < this.maxDays) {
      day.isSelected = true;
    } else if (this.maxDays === 1) {
      // Auto-swap: deselect current, select new
      this.daysOfWeek.forEach(d => { d.isSelected = false; });
      day.isSelected = true;
    }
    // Multi-day at max: user must deselect one first (counter guides them)
    this.newShiftStateService.set(this.step.DAYS, this.daysOfWeek.filter(d => d.isSelected));
  }
}
