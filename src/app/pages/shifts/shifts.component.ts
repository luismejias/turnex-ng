import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from './shift.enum';
import { Shift } from 'src/app/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'turnex-shifts',
  standalone: true,
  imports: [CommonModule, RouterLink, ShiftCardComponent, TitleComponent],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {
  typeShifts = TypeShifts;
  filterSelected: TypeShifts = this.typeShifts.NEXT;
  filteredShifts!: Shift[];
  shifts: Shift[] = [
    {
      id: 1,
      userId: 123,
      date: new Date('2022-10-15T08:00:00.000Z'),
      status: this.typeShifts.COMPLETED,
      clientId: 456,
      specialityID: 789,
      active: true
    },
    {
      id: 2,
      userId: 456,
      date: new Date ('2022-10-20T13:30:00.000Z'),
      status: this.typeShifts.CANCELED,
      clientId: 789,
      specialityID: 123,
      active: false
    },
    {
      id: 3,
      userId: 789,
      date: new Date ('2022-11-03T10:00:00.000Z'),
      status: this.typeShifts.NEXT,
      clientId: 123,
      specialityID: 456,
      active: true
    },
    {
      id: 4,
      userId: 123,
      date: new Date ('2022-11-08T14:15:00.000Z'),
      status: this.typeShifts.COMPLETED,
      clientId: 789,
      specialityID: 456,
      active: true
    },
    {
      id: 4,
      userId: 123,
      date: new Date ('2022-11-08T14:15:00.000Z'),
      status: this.typeShifts.CANCELED,
      clientId: 789,
      specialityID: 456,
      active: true
    },
    {
      id: 4,
      userId: 123,
      date: new Date ('2022-11-08T14:15:00.000Z'),
      status: this.typeShifts.COMPLETED,
      clientId: 789,
      specialityID: 456,
      active: true
    },
    {
      id: 4,
      userId: 123,
      date: new Date ('2022-11-08T14:15:00.000Z'),
      status: this.typeShifts.CANCELED,
      clientId: 789,
      specialityID: 456,
      active: true
    },
    {
      id: 4,
      userId: 123,
      date: new Date ('2022-11-08T14:15:00.000Z'),
      status: this.typeShifts.NEXT,
      clientId: 789,
      specialityID: 456,
      active: true
    }
  ];

  ngOnInit(): void {
      this.onFilterSelected(this.typeShifts.NEXT);
  }

  onFilterSelected(selected: TypeShifts): void{
    this.filterSelected = selected;
    this.filteredShifts = this.shifts.filter((shift)=> shift.status === selected);
  }

  newShift(): void {
    alert('Nuevo turno!!!!!!!');
  }

}
