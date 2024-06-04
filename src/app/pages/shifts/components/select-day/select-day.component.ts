import { Component } from '@angular/core';
import { Day } from '../../models';
import { daysOfWeek } from 'src/app/pages/constants';
import { NewShiftStateService } from '../new-shift/new-shift.state.service';
import { step } from 'src/app/models';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'turnex-select-day',
  standalone: true,
  imports: [NgIf, NgClass, NgFor],
  templateUrl: './select-day.component.html',
  styleUrl: './select-day.component.scss'
})
export class SelectDayComponent {
  selectedDays!: Day[];
  daysOfWeek: Day[] = daysOfWeek;
  step = step;
  constructor(private newShiftStateService: NewShiftStateService){}

  onDaySelect(day: Day) {
    day.isSelected = !day.isSelected;
    this.selectedDays = this._selectedDays;
    this.newShiftStateService.set(this.step.DAYS, this.selectedDays);
  }

  private get _selectedDays(): Day[] {
    return this.daysOfWeek.filter(day => day.isSelected);
  }
}
