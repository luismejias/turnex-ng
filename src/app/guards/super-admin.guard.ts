import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../shared/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getStoredUser();
  if (user?.role === 'SUPER_ADMIN') return true;

  router.navigate(['/home']);
  return false;
};
