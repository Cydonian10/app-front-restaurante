import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { EditarProductoPage } from './editar-producto.page';
import { AlertService } from '../../../shared/services/alert';

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

  it('conserva los cambios al fallar y actualiza la caché al guardar', async () => {
    const client = TestBed.inject(QueryClient);
    const listKey = ['productos', 'list', { page: 1, limit: 10 }];
    client.setQueryData(listKey, { items: [] });
    const harness = await RouterTestingHarness.create('/productos/abc/editar');
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('http://localhost:3000/api/v1/products/admin/abc').flush({
      id: 'abc',
      nombre: 'Café',
      precio: '4.00',
      tipo: 'BEBIDA',
      descripcion: null,
      imageUrl: null,
    });
    await vi.waitFor(() => {
      expect(harness.routeNativeElement?.querySelector('#producto-nombre')).toBeTruthy();
    });
    const name = harness.routeNativeElement!.querySelector('#producto-nombre') as HTMLInputElement;
    name.value = 'Café especial';
    name.dispatchEvent(new Event('input'));
    const submit = () =>
      harness
        .routeNativeElement!.querySelector('form')!
        .dispatchEvent(new Event('submit', { cancelable: true }));
    submit();
    await vi.waitFor(() => {
      const req = requests.expectOne('http://localhost:3000/api/v1/products/abc');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.get('nombre')).toBe('Café especial');
      req.flush({}, { status: 500, statusText: 'Error' });
    });
    await vi.waitFor(() => {
      expect(harness.routeNativeElement?.textContent).toContain('No se pudo guardar');
    });
    expect(name.value).toBe('Café especial');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    submit();
    await vi.waitFor(() =>
      requests.expectOne('http://localhost:3000/api/v1/products/abc').flush({ id: 'abc' }),
    );
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin/productos'));
    expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(['productos', 'detail', 'abc'])?.isInvalidated).toBe(true);
    expect(TestBed.inject(AlertService).alerts().at(-1)?.message).toBe(
      'Producto actualizado correctamente.',
    );
    requests.verify();
  });
});
