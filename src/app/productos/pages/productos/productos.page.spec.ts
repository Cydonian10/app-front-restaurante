import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { ProductosPage } from './productos.page';

describe('ProductosPage', () => {
  let requests: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductosPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTanStackQuery(
          () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        ),
      ],
    });
    requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());
  const response = {
    items: [
      {
        id: '1',
        nombre: 'Lomo',
        tipo: 'PLATO_FONDO',
        precio: '28.00',
        disponible: true,
        imageUrl: null,
      },
    ],
    page: 1,
    limit: 10,
    total: 11,
    totalPages: 2,
  };

  it('muestra productos y consulta página, nombre y tipo seleccionados', async () => {
    const fixture = TestBed.createComponent(ProductosPage);
    fixture.detectChanges();
    const initial = requests.expectOne((r) => r.url.endsWith('/products/admin'));
    expect(initial.request.params.get('page')).toBe('1');
    initial.flush(response);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Lomo');
    });
    expect(fixture.nativeElement.textContent).toContain('S/ 28.00');
    expect(fixture.nativeElement.querySelector('[aria-label="Sin imagen"]')).toBeTruthy();
    fixture.nativeElement.querySelector('[aria-label="Página 2"]').click();
    fixture.detectChanges();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.params.get('page') === '2');
      req.flush({ ...response, page: 2 });
    });
    const search = fixture.nativeElement.querySelector('#buscar-producto') as HTMLInputElement;
    search.value = 'Lomo'; search.dispatchEvent(new Event('input')); fixture.detectChanges();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.params.get('nombre') === 'Lomo');
      expect(req.request.params.get('page')).toBe('1'); req.flush(response);
    });
    const select = fixture.nativeElement.querySelector('#tipo-producto') as HTMLSelectElement;
    select.value = 'BEBIDA'; select.dispatchEvent(new Event('change')); fixture.detectChanges();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.params.get('tipo') === 'BEBIDA');
      expect(req.request.params.get('nombre')).toBe('Lomo'); req.flush({ ...response, items: [] });
    });
  });

  it('muestra error y permite reintentar con estado vacío', async () => {
    const fixture = TestBed.createComponent(ProductosPage);
    fixture.detectChanges();
    requests
      .expectOne((r) => r.url.endsWith('/products/admin'))
      .flush({}, { status: 500, statusText: 'Error' });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar');
    });
    fixture.nativeElement.querySelector('button').click();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.url.endsWith('/products/admin'));
      req.flush({ items: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No hay registros');
    });
  });
});
