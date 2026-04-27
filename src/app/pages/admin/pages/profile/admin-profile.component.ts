import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'turnex-admin-profile',
  imports: [],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
})
export class AdminProfileComponent {
  private authService = inject(AuthService);

  user = this.authService.getStoredUser();
}
