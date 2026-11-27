import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { AuthService } from '../../auth/services/auth.service';
import { authInterceptor } from '../../auth/interceptors/auth.interceptor';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;
  let requests: HttpTestingController;
  let client: QueryClient;
  const url = 'http://localhost:3000/api/v1/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: vi.fn(() => 'jwt'), logout: vi.fn() } },
      ],
    });
    service = TestBed.inject(ProductosService);
    requests = TestBed.inject(HttpTestingController);
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });
  afterEach(() => {
    requests.verify();
    client.clear();
  });

  it('consulta el listado administrativo con filtros y credenciales', async () => {
    const result = client.fetchQuery(
      service.list({ page: 2, limit: 5, tipo: 'BEBIDA', nombre: 'café' }),
    );
    const req = requests.expectOne((r) => r.url === `${url}/admin`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('tipo')).toBe('BEBIDA');
    expect(req.request.params.get('nombre')).toBe('café');
    req.flush({ items: [], page: 2, limit: 5, total: 0, totalPages: 0 });
    expect((await result).items).toEqual([]);
  });

  it('consulta un producto por identificador', async () => {
    const result = client.fetchQuery(service.detail('abc'));
    requests.expectOne(`${url}/admin/abc`).flush({ id: 'abc', nombre: 'Plato' });
    expect((await result).nombre).toBe('Plato');
  });

  it('envía creación y edición con datos multipart e imagen opcional', async () => {
    const data = { nombre: 'Plato', precio: '12.50', tipo: 'PLATO_FONDO' as const };
    const create = client.getMutationCache().build(client, service.create()).execute(data);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const first = requests.expectOne(url);
    expect(first.request.method).toBe('POST');
    expect(first.request.body.get('precio')).toBe('12.50');
    expect(first.request.body.has('descripcion')).toBe(false);
    first.flush({ id: 'abc' });
    await create;
    const image = new File(['foto'], 'foto.png', { type: 'image/png' });
    const update = client
      .getMutationCache()
      .build(client, service.update())
      .execute({ id: 'abc', data: { ...data, descripcion: 'Detalle', imagen: image } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const second = requests.expectOne(`${url}/abc`);
    expect(second.request.method).toBe('PATCH');
    expect(second.request.body.get('descripcion')).toBe('Detalle');
    expect(second.request.body.get('imagen')).toBe(image);
    second.flush({ id: 'abc' });
    await update;
  });

  it('envía disponibilidad y baja al endpoint correspondiente', async () => {
    const availability = client
      .getMutationCache()
      .build(client, service.updateAvailability())
      .execute({ id: 'abc', disponible: false });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const req = requests.expectOne(`${url}/abc/disponibilidad`);
    expect(req.request.body).toEqual({ disponible: false });
    req.flush({ id: 'abc', disponible: false });
    await availability;
    const remove = client.getMutationCache().build(client, service.delete()).execute('abc');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const deletion = requests.expectOne(`${url}/abc`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush({ id: 'abc' });
    await remove;
  });
});
