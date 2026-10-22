import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

// Role-specific guard for admin/kitchen-only routes
export const roleGuard = (...allowed: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.role();
  if (role && allowed.includes(role)) return true;

  router.navigate(['/']);
  return false;
};