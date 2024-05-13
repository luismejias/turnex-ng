import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from './shift.enum';

@Component({
  selector: 'turnex-shifts',
  standalone: true,
  imports: [CommonModule, ShiftCardComponent, TitleComponent],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent {
  typeShifts = TypeShifts;

  filterSelected: TypeShifts = this.typeShifts.NEXT;

  onSelected(selected: TypeShifts){
    this.filterSelected = selected;
  }

}
