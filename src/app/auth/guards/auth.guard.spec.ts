import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const auth = { token: vi.fn<() => string | null>() };
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] }));
  function check() {
    return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }
  it('permite el acceso con una sesión', () => { auth.token.mockReturnValue('jwt'); expect(check()).toBe(true); });
  it('redirige al login sin sesión', () => { auth.token.mockReturnValue(null); expect(TestBed.inject(Router).serializeUrl(check() as ReturnType<Router['createUrlTree']>)).toBe('/auth/login'); });
});
