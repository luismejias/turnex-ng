import { Component, inject, OnInit } from '@angular/core';

import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from '../shifts/shift.enum';
import { SelectSpecialtyComponent } from '../shifts/components/select-specialty/select-specialty.component';
import { Router } from '@angular/router';
import { UserProfileService } from '../user-profile';
import { Shift } from '../shifts/models';
import { ShiftsService } from '../shifts/service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from 'src/app/shared/auth.service';
import { AdminSpecialty } from '../admin/models/admin.models';

@Component({
  selector: 'turnex-home',
  imports: [TitleComponent, ShiftCardComponent, SelectSpecialtyComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private readonly shiftsService = inject(ShiftsService);
  private readonly dialog = inject(MatDialog);
  private router = inject(Router);

  shifts!: Shift[];
  nextShift!: Shift | null;
  user!: string;
  userCompanyId: number | undefined;
  typeShifts = TypeShifts;
  today = new Date();

  ngOnInit(): void {
    this.userCompanyId = this.authService.getStoredUser()?.companyId ?? undefined;
    const userData = this.userProfileService.getDataUser();
    this.user = `¡Hola, ${userData?.name ?? ''}!`;
    this.getShifts();
  }

  getShifts(): void {
    this.shiftsService.getShifts().subscribe({
      next: (shifts) => {
        if (!shifts.length) {
          this.router.navigate(['/shifts/newShift']);
          return;
        }
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
    return null;
  }

  goToNewShift(sp: AdminSpecialty): void {
    this.router.navigate([`/shifts/newShift/${sp.id}`]);
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
