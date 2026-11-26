import { httpResource, HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { SKIP_AUTH } from '../interceptors/auth-context';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../interfaces/auth-user';
import { AuthResponse } from '../interfaces/auth-response';

const KEY = 'restaurant.auth';
const API = environment.api.replace(/\/$/, '');

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenState = signal(this.readToken());
  readonly token = this.tokenState.asReadonly();
  readonly profile = httpResource<AuthUser>(() => {
    const token = this.token();
    return token ? { url: `${API}/auth/me` } : undefined;
  });
  readonly user = computed(() => (this.profile.hasValue() ? this.profile.value() : undefined));
  readonly googleConfig = httpResource<{ enabled: boolean }>(() => ({
    url: `${API}/auth/oidc/google/config`,
    timeout: 8000,
    context: new HttpContext().set(SKIP_AUTH, true),
  }));

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(
        `${API}/auth/login`,
        { email, password },
        { context: new HttpContext().set(SKIP_AUTH, true) },
      )
      .pipe(tap((result) => this.save(result)));
  }
  startGoogleLogin(): void {
    window.location.assign(`${API}/auth/oidc/google/login`);
  }
  exchangeGoogleCode(code: string) {
    return this.http
      .post<AuthResponse>(
        `${API}/auth/oidc/google/exchange`,
        { code },
        { withCredentials: true, context: new HttpContext().set(SKIP_AUTH, true) },
      )
      .pipe(tap((result) => this.save(result)));
  }
  logout(): void {
    this.tokenState.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* Storage is optional. */
    }
    void this.router.navigateByUrl('/auth/login');
  }
  private save(result: AuthResponse): void {
    if (!result.accessToken) throw new Error('Respuesta de autenticación inválida');
    try {
      localStorage.setItem(KEY, JSON.stringify({ accessToken: result.accessToken }));
    } catch {
      /* Keep session in memory. */
    }
    this.tokenState.set(result.accessToken);
  }
  private readToken(): string | null {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      return value &&
        typeof value === 'object' &&
        'accessToken' in value &&
        typeof value.accessToken === 'string' &&
        value.accessToken
        ? value.accessToken
        : null;
    } catch {
      return null;
    }
  }
}
