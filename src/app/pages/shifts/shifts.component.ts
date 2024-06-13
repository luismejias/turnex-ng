import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from './shift.enum';
import { RouterLink } from '@angular/router';
import { ShiftsService } from './service/shifts.service';
import { ShiftCalculated } from './models';
import { NewShiftState } from './models/new-shift-state.interface';

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
  filteredShifts!: ShiftCalculated[];
  shifts!: ShiftCalculated[];
  dataStorage!: NewShiftState;

  private readonly shiftsService = inject(ShiftsService);

  products$ = this.shiftsService.getAllPropducts();
  ngOnInit(): void {
    this.getShifts();
    this.onFilterSelected(this.typeShifts.NEXT);

  }

  onFilterSelected(selected: TypeShifts): void {
    this.filterSelected = selected;
    this.filteredShifts = this.shifts.filter((shift)=> shift.status === selected);
  }

  getShifts(): void {
    this.dataStorage = this.shiftsService.getShifts();
    this.shifts = this.dataStorage.shiftsCalculated || [];
  }

}
