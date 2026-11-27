import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { AuthService } from '../../auth/services/auth.service';
import { ProductosAccessPage } from './productos-access.page';

@Component({ template: 'Contenido protegido' })
class ProtectedPage {}

describe('acceso a productos', () => {
  const loading = signal(true);
  const error = signal<unknown>(null);
  const user = signal<{ role: string } | undefined>(undefined);
  const reload = vi.fn();

  beforeEach(() => {
    loading.set(true);
    error.set(null);
    user.set(undefined);
    reload.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'productos',
            component: ProductosAccessPage,
            children: [
              { path: '', component: ProtectedPage },
              { path: 'crear', component: ProtectedPage },
              { path: ':id/editar', component: ProtectedPage },
            ],
          },
        ]),
        {
          provide: AuthService,
          useValue: { profile: { isLoading: loading, error, reload }, user },
        },
      ],
    });
  });

  it('espera el perfil y solo muestra el contenido para ADMIN', async () => {
    const harness = await RouterTestingHarness.create('/productos/crear');
    expect(harness.routeNativeElement?.textContent).toContain('Comprobando acceso');
    expect(harness.routeNativeElement?.textContent).not.toContain('Contenido protegido');
    loading.set(false);
    user.set({ role: 'ADMIN' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Contenido protegido');
  });

  it('deniega el acceso a otros roles incluso en una URL directa', async () => {
    loading.set(false);
    user.set({ role: 'CLIENTE' });
    const harness = await RouterTestingHarness.create('/productos/123/editar');
    expect(harness.routeNativeElement?.textContent).toContain('Acceso denegado');
    expect(harness.routeNativeElement?.textContent).not.toContain('Contenido protegido');
  });

  it('permite reintentar cuando falla la carga del perfil', async () => {
    loading.set(false);
    error.set(new Error('fallo'));
    const harness = await RouterTestingHarness.create('/productos');
    expect(harness.routeNativeElement?.textContent).toContain('No se pudo comprobar');
    (harness.routeNativeElement?.querySelector('button') as HTMLButtonElement).click();
    expect(reload).toHaveBeenCalledOnce();
  });
});
