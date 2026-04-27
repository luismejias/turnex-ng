import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../app.state.service';
import { inject } from '@angular/core';

/**
 * Guard que protege rutas que requieren sesión iniciada.
 * Redirige a `/login` si el usuario no está autenticado.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const appStateService = inject(AppStateService);
  const router = inject(Router);
  if(appStateService.state().isLoggedIn){
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
