import { inject, Injectable } from '@angular/core';
import { SimpleStoreService } from './simple-store.service';
import { AppState, User } from './models';
import { Router } from '@angular/router';
import { AuthService } from './shared/auth.service';

/**
 * Servicio de estado global de la aplicación.
 * Extiende {@link SimpleStoreService} con las acciones de sesión y navegación post-login.
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService extends SimpleStoreService<AppState> {
  router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    super();
    this._restoreSession();
  }

  /**
   * Inicializa el estado según si existe un token en localStorage.
   * Se llama una única vez al arrancar la aplicación.
   */
  private _restoreSession(): void {
    if (this.authService.isAuthenticated()) {
      this.state.set({ isLoggedIn: true, isChildFlow: false });
      this.authService.refreshUser();
    } else {
      this.state.set({ isLoggedIn: false, isChildFlow: false });
    }
  }

  /**
   * Marca al usuario como autenticado y redirige según su rol.
   * - SUPER_ADMIN / ADMIN → `/admin`
   * - USER → `/home`
   * @param user - Datos del usuario que acaba de iniciar sesión.
   */
  login(user: User): void {
    this.state.set({ isLoggedIn: true, isChildFlow: false });
    const destination = (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? '/admin' : '/home';
    this.router.navigate([destination]);
  }

  /**
   * Marca al usuario como autenticado sin realizar ninguna navegación.
   * Útil para restaurar la sesión de forma silenciosa.
   */
  setLoggedIn(): void {
    this.state.set({ isLoggedIn: true, isChildFlow: false });
  }

  /**
   * Cierra la sesión del usuario: limpia el localStorage, reinicia el estado
   * y redirige a la pantalla de login.
   */
  logout(): void {
    this.authService.logout();
    this.state.set({ isLoggedIn: false, isChildFlow: false });
    this.router.navigate(['/login']);
  }
}
