import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../shared/auth.service';

/**
 * Guard que protege rutas del panel de administración.
 * Permite el acceso a usuarios con rol `ADMIN` o `SUPER_ADMIN`.
 * Redirige a `/home` si el usuario no cumple el requisito.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getStoredUser();
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') return true;

  router.navigate(['/home']);
  return false;
};
