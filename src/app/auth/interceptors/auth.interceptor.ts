import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { SKIP_AUTH } from './auth-context';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const api = new URL(environment.api.replace(/\/$/, '') + '/', window.location.origin);
  const target = new URL(request.url, window.location.origin);
  const apiRoot = api.pathname.slice(0, -1);
  if (
    target.origin !== api.origin ||
    (target.pathname !== apiRoot && !target.pathname.startsWith(api.pathname)) ||
    request.context.get(SKIP_AUTH)
  ) {
    return next(request);
  }

  const auth = inject(AuthService);
  const token = auth.token();
  if (!token || request.headers.has('Authorization')) return next(request);

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (
        auth.token() === token &&
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 401
      ) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
