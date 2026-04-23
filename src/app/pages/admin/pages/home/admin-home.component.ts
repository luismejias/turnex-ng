import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCompany } from '../../models/admin.models';
import { AuthService } from 'src/app/shared/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'turnex-admin-home',
  imports: [],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
})
export class AdminHomeComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  get companies(): AdminCompany[] {
    return this.adminService.getCompanies();
  }

  get userName(): string {
    const user = this.authService.getStoredUser();
    return user?.name ?? 'Admin';
  }

  goToCompany(id: number): void {
    this.router.navigate(['/admin/empresas', id]);
  }

  createCompany(): void {
    this.router.navigate(['/admin/empresas/crear']);
  }

  deleteCompany(event: Event, company: AdminCompany): void {
    event.stopPropagation();
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Eliminar empresa',
        message: `¿Confirmás que querés eliminar "${company.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.adminService.deleteCompany(company.id);
    });
  }
}
