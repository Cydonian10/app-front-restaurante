import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { ProductosPage } from './productos.page';
import { AlertService } from '../../../shared/services/alert';

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
    search.value = 'Lomo';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.params.get('nombre') === 'Lomo');
      expect(req.request.params.get('page')).toBe('1');
      req.flush(response);
    });
    const select = fixture.nativeElement.querySelector('#tipo-producto') as HTMLSelectElement;
    select.value = 'BEBIDA';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.params.get('tipo') === 'BEBIDA');
      expect(req.request.params.get('nombre')).toBe('Lomo');
      req.flush({ ...response, items: [] });
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

  it('cambia disponibilidad y confirma la baja antes de actualizar el listado', async () => {
    const fixture = TestBed.createComponent(ProductosPage);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    requests.expectOne((r) => r.url.endsWith('/products/admin')).flush(response);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Lomo');
    });
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Marcar no disponible: Lomo"]',
      ) as HTMLButtonElement
    ).click();
    await vi.waitFor(() => {
      const req = requests.expectOne((r) => r.url.endsWith('/products/1/disponibilidad'));
      expect(req.request.body).toEqual({ disponible: false });
      req.flush({ id: '1', disponible: false });
    });
    await vi.waitFor(() =>
      requests
        .expectOne((r) => r.url.endsWith('/products/admin'))
        .flush({ ...response, items: [{ ...response.items[0], disponible: false }] }),
    );
    await vi.waitFor(() => {
      expect(TestBed.inject(AlertService).alerts().at(-1)?.message).toContain(
        'Disponibilidad actualizada',
      );
    });
    expect(fixture.nativeElement.querySelector('a[aria-label="Editar: Lomo"]')).toBeTruthy();
    const deleteButton = fixture.nativeElement.querySelector(
      'button[aria-label="Dar de baja: Lomo"]',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    dialog.querySelectorAll('button')[0].click();
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
    requests.expectNone((r) => r.method === 'DELETE');
    deleteButton.click();
    fixture.detectChanges();
    dialog.querySelectorAll('button')[1].click();
    await vi.waitFor(() =>
      requests
        .expectOne((r) => r.method === 'DELETE' && r.url.endsWith('/products/1'))
        .flush({ id: '1' }),
    );
    await vi.waitFor(() =>
      requests
        .expectOne((r) => r.url.endsWith('/products/admin'))
        .flush({ ...response, items: [], total: 0, totalPages: 0 }),
    );
    await vi.waitFor(() => {
      expect(TestBed.inject(AlertService).alerts().at(-1)?.message).toContain(
        'Producto dado de baja correctamente',
      );
    });
  });
});
