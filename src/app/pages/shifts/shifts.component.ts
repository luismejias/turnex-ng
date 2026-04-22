import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftCardComponent, TitleComponent } from 'src/app/components';
import { TypeShifts } from './shift.enum';
import { Router, RouterLink } from '@angular/router';
import { ShiftsService } from './service/shifts.service';
import { Shift } from './models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

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
  isLoading = false;

  private readonly shiftsService = inject(ShiftsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getShifts();
  }

  getShifts(): void {
    this.isLoading = true;
    this.shiftsService.getShifts().subscribe({
      next: (shifts) => {
        this.shifts = shifts;
        this.isLoading = false;
        this.onFilterSelected(this.filterSelected);
      },
      error: () => { this.isLoading = false; },
    });
  }

  onFilterSelected(selected: TypeShifts): void {
    this.filterSelected = selected;
    this.filteredShifts = this.shifts.filter((s) => s.status === selected);
  }

  onCancelShift(shift: Shift): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cancelar turno',
        message: `¿Confirmás la cancelación del turno de ${shift.specialty?.description ?? 'la clase'} del ${shift.date}?`,
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

  countByStatus(status: TypeShifts): number {
    return this.shifts.filter(s => s.status === status).length;
  }

  get activePack(): string {
    return this.shifts.find(s => s.pack)?.pack?.description ?? '';
  }
}
