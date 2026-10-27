import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './api';

export const authGuard: CanActivateFn = (_r, state) => {
  const auth = inject(AuthService);
  return auth.loggedIn() ? true : inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard = (role: Role): CanActivateFn => (_r, state) => {
  const auth = inject(AuthService);
  if (!auth.loggedIn()) return inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
  return auth.role() === role ? true : inject(Router).createUrlTree(['/']);
};
