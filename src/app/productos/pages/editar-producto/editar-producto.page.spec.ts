import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { EditarProductoPage } from './editar-producto.page';

describe('EditarProductoPage', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'productos/:id/editar', component: EditarProductoPage }]),
        provideTanStackQuery(
          () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        ),
      ],
    }),
  );
  it('carga por ID y rellena el formulario al entrar directamente', async () => {
    const harness = await RouterTestingHarness.create('/productos/abc/editar');
    TestBed.inject(HttpTestingController)
      .expectOne('http://localhost:3000/api/v1/products/admin/abc')
      .flush({
        id: 'abc',
        nombre: 'Café',
        precio: '4.00',
        tipo: 'BEBIDA',
        descripcion: null,
        imageUrl: null,
      });
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(
        (harness.routeNativeElement?.querySelector('#producto-nombre') as HTMLInputElement)?.value,
      ).toBe('Café');
    });
    TestBed.inject(HttpTestingController).verify();
  });
  it('muestra un mensaje cuando el producto no existe', async () => {
    const harness = await RouterTestingHarness.create('/productos/abc/editar');
    TestBed.inject(HttpTestingController)
      .expectOne('http://localhost:3000/api/v1/products/admin/abc')
      .flush({}, { status: 404, statusText: 'Not Found' });
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(harness.routeNativeElement?.textContent).toContain('No se encontró el producto');
    });
    TestBed.inject(HttpTestingController).verify();
  });
});
