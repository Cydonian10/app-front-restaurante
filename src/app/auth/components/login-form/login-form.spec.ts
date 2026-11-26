import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('valida los campos y muestra el error de credenciales', async () => {
    TestBed.configureTestingModule({ imports: [LoginForm], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const fixture = TestBed.createComponent(LoginForm);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost:3000/api/v1/auth/oidc/google/config').flush({ enabled: false });
    await fixture.whenStable();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Ingresá tu correo electrónico.');
    expect(fixture.nativeElement.textContent).toContain('Ingresá tu contraseña.');
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    email.value = 'ana@example.com'; email.dispatchEvent(new Event('input'));
    password.value = 'clave'; password.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectOne('http://localhost:3000/api/v1/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Correo o contraseña incorrectos.');
    const google = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(button => button.textContent?.includes('Continuar con Google'));
    expect(google?.disabled).toBe(true);
  });
});
