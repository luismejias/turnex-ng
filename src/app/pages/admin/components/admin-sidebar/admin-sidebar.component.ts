import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppStateService } from 'src/app/app.state.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'turnex-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  private appStateService = inject(AppStateService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  get isCompaniesRoute(): boolean {
    return this.router.url.startsWith('/admin/companies');
  }

  close(): void {
    this.closed.emit();
  }

  logout(): void {
    this.close();
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cerrar sesión',
        message: '¿Confirmás que querés cerrar sesión?',
        confirmText: 'Sí, cerrar sesión',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.appStateService.logout();
    });
  }
}
