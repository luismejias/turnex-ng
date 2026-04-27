import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCompany, AdminProfile, AdminShift, AdminUser, AdminSpecialty, AdminUserShift } from '../../models/admin.models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Location } from '@angular/common';

type Tab = 'data' | 'profiles' | 'schedules' | 'specialties' | 'users' | 'settings';

@Component({
  selector: 'turnex-company-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss',
})
export class CompanyDetailComponent implements OnInit {
  @Input() id!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private location = inject(Location);

  company!: AdminCompany;
  activeTab: Tab = 'data';
  loadingUsers = false;
  loadingSpecialties = false;

  // ── User shift panel ─────────────────────────────────────────────────────
  expandedUserId: number | null = null;
  userShiftsMap: Record<number, AdminUserShift[]> = {};
  loadingShiftsFor: number | null = null;
  rescheduleShiftId: number | null = null;
  rescheduleDate = '';
  rescheduleTime = '';

  ngOnInit(): void {
    const cached = this.adminService.getCompanyById(Number(this.id));
    if (cached) {
      this.company = { ...cached, users: cached.users ?? [], specialties: cached.specialties ?? [] };
    } else {
      this.adminService.loadCompany(Number(this.id)).subscribe({
        next: () => {
          const loaded = this.adminService.getCompanyById(Number(this.id));
          if (!loaded) { this.router.navigate(['/admin']); return; }
          this.company = { ...loaded, users: loaded.users ?? [], specialties: loaded.specialties ?? [] };
        },
        error: () => this.router.navigate(['/admin']),
      });
    }
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'users' && !this.company.users?.length) {
      this.loadingUsers = true;
      this.adminService.loadUsers(this.company.id).subscribe({
        next: () => { this.company = this.adminService.getCompanyById(this.company.id)!; this.loadingUsers = false; },
        error: () => { this.loadingUsers = false; },
      });
    }
    if (tab === 'specialties' && !this.company.specialties?.length) {
      this.loadingSpecialties = true;
      this.adminService.loadSpecialties(this.company.id).subscribe({
        next: () => { this.company = this.adminService.getCompanyById(this.company.id)!; this.loadingSpecialties = false; },
        error: () => { this.loadingSpecialties = false; },
      });
    }
  }

  goBack(): void { this.location.back(); }

  editCompany(): void {
    this.router.navigate(['/admin/companies', this.id, 'edit']);
  }

  deleteCompany(): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar empresa',
        message: `¿Confirmás que querés eliminar "${this.company.name}"?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteCompany(this.company.id)
          .subscribe(() => this.router.navigate(['/admin']));
      }
    });
  }

  // ── Profiles ──────────────────────────────────────────────────────────────

  addProfile(): void {
    this.router.navigate(['/admin/companies', this.id, 'profiles', 'create']);
  }

  editProfile(profile: AdminProfile): void {
    this.router.navigate(['/admin/companies', this.id, 'profiles', profile.id, 'edit']);
  }

  deleteProfile(profile: AdminProfile): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar perfil',
        message: `¿Confirmás que querés eliminar el perfil de ${profile.name} ${profile.lastName}?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteProfile(this.company.id, profile.id)
          .subscribe(() => { this.company = this.adminService.getCompanyById(this.company.id)!; });
      }
    });
  }

  toggleProfileActive(profile: AdminProfile): void {
    this.adminService.updateProfile(this.company.id, profile.id, { active: !profile.active })
      .subscribe(() => { this.company = this.adminService.getCompanyById(this.company.id)!; });
  }

  // ── Schedules ─────────────────────────────────────────────────────────────

  addShift(): void {
    this.router.navigate(['/admin/companies', this.id, 'schedules', 'create']);
  }

  editShift(shift: AdminShift): void {
    this.router.navigate(['/admin/companies', this.id, 'schedules', shift.id, 'edit']);
  }

  deleteShift(shift: AdminShift): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar turno',
        message: `¿Confirmás que querés eliminar el turno "${shift.name}"?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteShift(this.company.id, shift.id)
          .subscribe(() => { this.company = this.adminService.getCompanyById(this.company.id)!; });
      }
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  addUser(): void {
    this.router.navigate(['/admin/companies', this.id, 'users', 'create']);
  }

  editUser(user: AdminUser): void {
    this.router.navigate(['/admin/companies', this.id, 'users', user.id, 'edit']);
  }

  toggleUserActive(user: AdminUser): void {
    this.adminService.updateUser(this.company.id, user.id, { active: !user.active })
      .subscribe(() => { this.company = this.adminService.getCompanyById(this.company.id)!; });
  }

  deleteUser(user: AdminUser): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar usuario',
        message: `¿Confirmás que querés eliminar a ${user.name} ${user.lastName}?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteUser(this.company.id, user.id).subscribe({
          next: () => {
            this.company = this.adminService.getCompanyById(this.company.id)!;
            this.toast.show('Usuario eliminado');
          },
          error: () => this.toast.show('Error al eliminar el usuario', 'error'),
        });
      } else {
        this.toast.show('Operación cancelada', 'info');
      }
    });
  }

  roleLabel(role: string): string {
    return { USER: 'Cliente', ADMIN: 'Administrador', SUPER_ADMIN: 'Super Admin' }[role] ?? role;
  }

  toggleUserShifts(user: AdminUser): void {
    if (this.expandedUserId === user.id) {
      this.expandedUserId = null;
      return;
    }
    this.expandedUserId = user.id;
    this.rescheduleShiftId = null;
    if (this.userShiftsMap[user.id]) return;
    this.loadingShiftsFor = user.id;
    this.adminService.getUserShifts(this.company.id, user.id).subscribe({
      next: shifts => {
        this.userShiftsMap[user.id] = shifts;
        this.loadingShiftsFor = null;
      },
      error: () => {
        this.loadingShiftsFor = null;
        this.expandedUserId = null;
        this.toast.show('No se pudieron cargar los turnos del usuario', 'error');
      },
    });
  }

  cancelUserShift(shift: AdminUserShift, userId: number): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cancelar turno',
        message: `¿Confirmás la cancelación del turno del ${new Date(shift.date).toLocaleDateString('es-AR')} a las ${shift.time}?`,
        confirmText: 'Sí, cancelar',
        cancelText: 'Volver',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminService.cancelUserShift(this.company.id, shift.id).subscribe({
        next: updated => {
          this.userShiftsMap[userId] = this.userShiftsMap[userId]
            .map(s => s.id === shift.id ? updated : s);
          this.toast.show('Turno cancelado');
        },
        error: () => this.toast.show('Error al cancelar el turno', 'error'),
      });
    });
  }

  openReschedule(shift: AdminUserShift): void {
    this.rescheduleShiftId = this.rescheduleShiftId === shift.id ? null : shift.id;
    this.rescheduleDate = '';
    this.rescheduleTime = shift.time;
  }

  submitReschedule(shift: AdminUserShift, userId: number): void {
    if (!this.rescheduleDate || !this.rescheduleTime) return;
    const [h, m] = this.rescheduleTime.split(':').map(Number);
    const d = new Date(this.rescheduleDate);
    d.setHours(h, m, 0, 0);
    this.adminService.rescheduleUserShift(this.company.id, shift.id, d.toISOString(), this.rescheduleTime)
      .subscribe({
        next: created => {
          this.userShiftsMap[userId] = this.userShiftsMap[userId]
            .map(s => s.id === shift.id ? { ...s, status: 'CANCELED' as const } : s)
            .concat(created)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          this.rescheduleShiftId = null;
          this.toast.show('Turno reagendado');
        },
        error: () => this.toast.show('Error al reagendar el turno', 'error'),
      });
  }

  shiftStatusLabel(status: string): string {
    return { NEXT: 'Próximo', COMPLETED: 'Completado', CANCELED: 'Cancelado' }[status] ?? status;
  }

  // ── Specialties ───────────────────────────────────────────────────────────

  addSpecialty(): void {
    this.router.navigate(['/admin/companies', this.id, 'specialties', 'create']);
  }

  editSpecialty(specialty: AdminSpecialty): void {
    this.router.navigate(['/admin/companies', this.id, 'specialties', specialty.id, 'edit']);
  }

  toggleSpecialtyActive(specialty: AdminSpecialty): void {
    this.adminService.updateSpecialty(this.company.id, specialty.id, { active: !specialty.active })
      .subscribe(() => { this.company = this.adminService.getCompanyById(this.company.id)!; });
  }

  deleteSpecialty(specialty: AdminSpecialty): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar especialidad',
        message: `¿Confirmás que querés eliminar "${specialty.name}"?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteSpecialty(this.company.id, specialty.id).subscribe({
          next: () => {
            this.company = this.adminService.getCompanyById(this.company.id)!;
            this.toast.show('Especialidad eliminada');
          },
          error: () => this.toast.show('Error al eliminar la especialidad', 'error'),
        });
      } else {
        this.toast.show('Operación cancelada', 'info');
      }
    });
  }
}
