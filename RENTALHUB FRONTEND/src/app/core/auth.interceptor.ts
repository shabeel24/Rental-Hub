import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API } from './api';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isApi = req.url.startsWith(API);
  const outgoing = token && isApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(outgoing).pipe(
    catchError(err => {
      if (err.status === 401 && isApi && !req.url.includes('/api/auth/')) {
        auth.logout();
        router.navigate(['/sign-in'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};
