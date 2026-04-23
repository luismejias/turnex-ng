import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';

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

  get isEmpresasRoute(): boolean {
    return this.router.url.startsWith('/admin/empresas');
  }

  close(): void {
    this.closed.emit();
  }

  logout(): void {
    this.appStateService.logout();
  }
}
