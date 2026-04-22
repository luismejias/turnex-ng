import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { TypeShifts } from 'src/app/pages/shifts/shift.enum';
import { daysOfWeek } from 'src/app/pages/constants';
import { Shift } from 'src/app/pages/shifts/models';

@Component({
  selector: 'turnex-shift-card',
  imports: [ButtonComponent],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss',
})
export class ShiftCardComponent implements OnInit {
  @Input({ required: true }) shift!: Shift;
  @Output() cancelShift = new EventEmitter<Shift>();
  @Output() rescheduleShift = new EventEmitter<Shift>();
  typeShift = TypeShifts;
  day!: string;

  ngOnInit(): void {
    this.day = this.formatDate(this.shift.date);
  }

  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    const dayOfWeek = daysOfWeek[date.getUTCDay()].description;
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${dayOfWeek} ${day}/${month}/${year}`;
  }
}
