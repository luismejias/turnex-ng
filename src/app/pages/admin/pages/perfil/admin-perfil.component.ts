import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'turnex-admin-perfil',
  imports: [FormsModule],
  templateUrl: './admin-perfil.component.html',
  styleUrl: './admin-perfil.component.scss',
})
export class AdminPerfilComponent {
  private authService = inject(AuthService);

  user = this.authService.getStoredUser();
  name = this.user?.name ?? '';
  lastName = this.user?.lastName ?? '';
  email = this.user?.email ?? '';
}
