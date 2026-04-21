import { inject, Injectable } from '@angular/core';
import { SimpleStoreService } from './simple-store.service';
import { AppState, User } from './models';
import { Router } from '@angular/router';
import { AuthService } from './shared/auth.service';

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

  private _restoreSession(): void {
    if (this.authService.isAuthenticated()) {
      this.state.set({ isLoggedIn: true, isChildFlow: false });
    } else {
      this.state.set({ isLoggedIn: false, isChildFlow: false });
    }
  }

  login(_user: User): void {
    this.state.set({ isLoggedIn: true, isChildFlow: false });
    this.router.navigate(['/home']);
  }

  setLoggedIn(): void {
    this.state.set({ isLoggedIn: true, isChildFlow: false });
  }

  logout(): void {
    this.authService.logout();
    this.state.set({ isLoggedIn: false, isChildFlow: false });
    this.router.navigate(['/login']);
  }
}
