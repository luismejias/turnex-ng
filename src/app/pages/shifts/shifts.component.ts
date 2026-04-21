import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from './shift.enum';
import { RouterLink } from '@angular/router';
import { ShiftsService } from './service/shifts.service';
import { Shift } from './models';

@Component({
  selector: 'turnex-shifts',
  imports: [CommonModule, RouterLink, ShiftCardComponent, TitleComponent],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
})
export class ShiftsComponent implements OnInit {
  typeShifts = TypeShifts;
  filterSelected: TypeShifts = this.typeShifts.NEXT;
  filteredShifts: Shift[] = [];
  shifts: Shift[] = [];

  private readonly shiftsService = inject(ShiftsService);

  ngOnInit(): void {
    this.getShifts();
  }

  getShifts(): void {
    this.shiftsService.getShifts().subscribe({
      next: (shifts) => {
        this.shifts = shifts;
        this.onFilterSelected(this.filterSelected);
      },
    });
  }

  onFilterSelected(selected: TypeShifts): void {
    this.filterSelected = selected;
    this.filteredShifts = this.shifts.filter((s) => s.status === selected);
  }
}
