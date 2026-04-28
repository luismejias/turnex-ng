import { Component, computed, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppStateService } from 'src/app/app.state.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'turnex-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  _isMobile = false;
  @Input() isChildFlow!: boolean;
  @Input() set isMobile(value: boolean) {
    this._isMobile = value;
  }

  private appStateService = inject(AppStateService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly companyName = computed(() => this.authService.currentUser()?.companyName ?? null);

  logout(): void {
    const ref = this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro que querés cerrar la sesión?',
        confirmText: 'Sí, salir',
        cancelText: 'Cancelar',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.appStateService.logout();
    });
  }
}
