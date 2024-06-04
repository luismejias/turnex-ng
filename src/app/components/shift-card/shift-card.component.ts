import { Component, Input, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { TypeShifts } from 'src/app/pages/shifts/shift.enum';
import { NgIf } from '@angular/common';
import { daysOfWeek } from 'src/app/pages/constants';

@Component({
  selector: 'turnex-shift-card',
  standalone: true,
  imports: [ButtonComponent, NgIf],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss'
})
export class ShiftCardComponent implements OnInit {
  @Input({required: true}) date!: string;
  @Input({required: true}) status!: TypeShifts;
  typeShift = TypeShifts;
  day!: string;
  hour!: string;

ngOnInit(): void {
    const {day, hour} = this.formatDateTime(this.date);
    this.day = day;
    this.hour = hour;
}
  formatDateTime(isoString: string) {
    const date = new Date(isoString);

    const dayOfWeek = daysOfWeek[date.getDay()].description;
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    const formattedDate = `${dayOfWeek} ${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    return {
        day: formattedDate,
        hour: formattedTime
    };
}
}
