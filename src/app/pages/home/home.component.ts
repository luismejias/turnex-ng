import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from '../shifts/shift.enum';
import { SelectItemsComponent } from '../shifts/components';
import { SpecialtyService } from '../specialty';
import { Specialty, step } from 'src/app/models';
import { Router } from '@angular/router';

@Component({
  selector: 'turnex-home',
  standalone: true,
  imports: [CommonModule, TitleComponent, ShiftCardComponent, SelectItemsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  private specialtyService = inject(SpecialtyService);
  private router= inject(Router);
  typeShifts = TypeShifts;
  specialties!: Specialty[];
  step = step;
  shift = {
    id: 1,
    userId: 123,
    date: new Date('2022-10-15T08:00:00.000Z'),
    status: this.typeShifts.NEXT,
    clientId: 456,
    specialityID: 789,
    active: true
  }
ngOnInit(): void {
    this.getAllSpecialties();
}

getAllSpecialties(): void {
  this.specialtyService.getAllSpecialties().subscribe((specialties: Specialty[]) => {
    this.specialties = specialties;
  })
}

goToNewShift(itemType: 'specialty', item: Specialty){
  console.log({itemType}, {item});
  this.router.navigate([`/shifts/newShift/${item.id}`]);

}

}
