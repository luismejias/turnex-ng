import { Component, inject, OnInit } from '@angular/core';

import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from '../shifts/shift.enum';
import { SelectItemsComponent } from '../shifts/components';
import { SpecialtyService } from '../specialty';
import { Specialty, step } from 'src/app/models';
import { Router } from '@angular/router';
import { UserProfileService } from '../user-profile';
import { Shift } from '../shifts/models';
import { ShiftsService } from '../shifts/service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'turnex-home',
  imports: [TitleComponent, ShiftCardComponent, SelectItemsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private specialtyService = inject(SpecialtyService);
  private userProfileService = inject(UserProfileService);
  private readonly shiftsService = inject(ShiftsService);
  private readonly dialog = inject(MatDialog);
  private router = inject(Router);
  shifts!: Shift[];
  nextShift!: Shift | null;
  user!: string;
  typeShifts = TypeShifts;
  specialties!: Specialty[];
  today = new Date();
  step = step;
  ngOnInit(): void {
    this.getAllSpecialties();
    const userData = this.userProfileService.getDataUser();
    this.user = `¡Hola,  ${userData?.name ?? ''}!`;
    this.getShifts();
  }

  getAllSpecialties(): void {
    this.specialtyService
      .getAllSpecialties()
      .subscribe((specialties: Specialty[]) => {
        this.specialties = specialties;
      });
  }

  getShifts(): void {
    this.shiftsService.getShifts().subscribe({
      next: (shifts) => {
        this.shifts = shifts;
        this.nextShift = this.getNextShift(this.shifts, this.today);
      },
    });
  }

  getNextShift(shifts: Shift[], currentDate: Date): Shift | null {
    for (const shift of shifts) {
      const shiftDate = new Date(shift.date);
      if (shiftDate > currentDate && shift.status === this.typeShifts.NEXT) {
        return shift;
      }
    }
    return null; // No hay turnos disponibles con el status "next" después de la fecha actual
  }

  goToNewShift(itemType: 'specialty', item: Specialty) {
    this.router.navigate([`/shifts/newShift/${item.id}`]);
  }

  onCancelShift(shift: Shift): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cancelar turno',
        message: `¿Confirmás la cancelación del turno de ${shift.specialty?.description ?? 'la clase'}?`,
        confirmText: 'Sí, cancelar',
        cancelText: 'Volver',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.shiftsService.updateShiftStatus(shift.id, TypeShifts.CANCELED).subscribe({
          next: () => this.getShifts(),
        });
      }
    });
  }

  onRescheduleShift(shift: Shift): void {
    this.router.navigate(['/shifts/reschedule', shift.id], { state: { shift } });
  }
}
