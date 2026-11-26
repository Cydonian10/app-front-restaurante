import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { SKIP_AUTH } from './auth-context';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const auth = { token: vi.fn(() => 'jwt'), logout: vi.fn() };
  let http: HttpClient;
  let requests: HttpTestingController;
  beforeEach(() => {
    auth.token.mockReturnValue('jwt'); auth.logout.mockClear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), { provide: AuthService, useValue: auth }] });
    http = TestBed.inject(HttpClient); requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());

  it('adjunta el token a la API protegida', () => {
    http.get('http://localhost:3000/api/v1/auth/me').subscribe();
    const request = requests.expectOne('http://localhost:3000/api/v1/auth/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt'); request.flush({});
  });
  it('omite peticiones públicas, otros orígenes y rutas fuera de la API', () => {
    const publicUrl = 'http://localhost:3000/api/v1/auth/login';
    const urls = [publicUrl, 'https://otro.example/api/v1/auth/me', 'http://localhost:3000/api/v10/auth/me'];
    http.get(publicUrl, { context: new HttpContext().set(SKIP_AUTH, true) }).subscribe();
    for (const url of urls.slice(1)) http.get(url).subscribe();
    for (const url of urls) { const request = requests.expectOne(url); expect(request.request.headers.has('Authorization')).toBe(false); request.flush({}); }
  });
  it('respeta Authorization explícito', () => {
    http.get('http://localhost:3000/api/v1/test', { headers: { Authorization: 'Basic abc' } }).subscribe();
    const request = requests.expectOne('http://localhost:3000/api/v1/test');
    expect(request.request.headers.get('Authorization')).toBe('Basic abc'); request.flush({});
  });
  it('cierra la sesión en 401 solo si el token sigue vigente', () => {
    http.get('http://localhost:3000/api/v1/test').subscribe({ error: () => {} });
    requests.expectOne('http://localhost:3000/api/v1/test').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledOnce();
    http.get('http://localhost:3000/api/v1/test').subscribe({ error: () => {} });
    auth.token.mockReturnValue('nuevo-token');
    requests.expectOne('http://localhost:3000/api/v1/test').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
