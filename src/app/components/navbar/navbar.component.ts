import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppStateService } from 'src/app/app.state.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

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
  private dialog = inject(MatDialog);

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
