import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCompany, AdminProfile, AdminShift } from '../../models/admin.models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Location } from '@angular/common';

type Tab = 'data' | 'profiles' | 'schedules' | 'settings';

@Component({
  selector: 'turnex-company-detail',
  imports: [],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss',
})
export class CompanyDetailComponent implements OnInit {
  @Input() id!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  company!: AdminCompany;
  activeTab: Tab = 'data';

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.id));
    if (!company) { this.router.navigate(['/admin']); return; }
    this.company = { ...company };
  }

  setTab(tab: Tab): void { this.activeTab = tab; }
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
}
