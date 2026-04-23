import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminCompany, AdminProfile, AdminShift } from '../../models/admin.models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Location } from '@angular/common';

type Tab = 'datos' | 'perfiles' | 'turnos' | 'settings';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PACKS = ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'];
const PERIODICITY = ['Cada 15 minutos', 'Cada 30 minutos', 'Cada 45 minutos', 'Cada 60 minutos'];

@Component({
  selector: 'turnex-empresa-detail',
  imports: [FormsModule],
  templateUrl: './empresa-detail.component.html',
  styleUrl: './empresa-detail.component.scss',
})
export class EmpresaDetailComponent implements OnInit {
  @Input() id!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  company!: AdminCompany;
  activeTab: Tab = 'datos';
  readonly days = DAYS;
  readonly packs = PACKS;
  readonly periodicity = PERIODICITY;

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.id));
    if (!company) { this.router.navigate(['/admin']); return; }
    this.company = { ...company };
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.location.back();
  }

  // --- Datos ---
  saveCompanyData(): void {
    this.adminService.updateCompany(this.company.id, {
      name: this.company.name,
      cuit: this.company.cuit,
      phone: this.company.phone,
      address: this.company.address,
      service: this.company.service,
    });
    this.router.navigate(['/admin']);
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
        this.adminService.deleteCompany(this.company.id);
        this.router.navigate(['/admin']);
      }
    });
  }

  // --- Perfiles ---
  addProfile(): void {
    this.router.navigate(['/admin/empresas', this.id, 'perfiles', 'crear']);
  }

  editProfile(profile: AdminProfile): void {
    this.router.navigate(['/admin/empresas', this.id, 'perfiles', profile.id, 'editar']);
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
        this.adminService.deleteProfile(this.company.id, profile.id);
        this.company = this.adminService.getCompanyById(this.company.id)!;
      }
    });
  }

  toggleProfileActive(profile: AdminProfile): void {
    this.adminService.updateProfile(this.company.id, profile.id, { active: !profile.active });
    this.company = this.adminService.getCompanyById(this.company.id)!;
  }

  // --- Turnos ---
  addShift(): void {
    this.router.navigate(['/admin/empresas', this.id, 'turnos', 'crear']);
  }

  editShift(shift: AdminShift): void {
    this.router.navigate(['/admin/empresas', this.id, 'turnos', shift.id, 'editar']);
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
        this.adminService.deleteShift(this.company.id, shift.id);
        this.company = this.adminService.getCompanyById(this.company.id)!;
      }
    });
  }
}
