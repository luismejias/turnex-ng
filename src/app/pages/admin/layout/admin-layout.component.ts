import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../components/admin-sidebar/admin-sidebar.component';
import { AdminService } from '../services/admin.service';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'turnex-admin-layout',
  imports: [RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  sidebarOpen = false;

  ngOnInit(): void {
    const user = this.authService.getStoredUser();
    if (user?.role === 'SUPER_ADMIN') {
      this.adminService.loadCompanies().subscribe();
    } else if (user?.role === 'ADMIN' && user.companyId) {
      this.adminService.loadCompany(user.companyId).subscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
