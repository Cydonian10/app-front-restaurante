import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { vi } from 'vitest';
import { CrearProductoPage } from './crear-producto.page';
import { ProductosNoticeService } from '../../services/productos-notice.service';

describe('CrearProductoPage', () => {
  it('conserva los datos ante un error y confirma la creación exitosa', async () => {
    TestBed.configureTestingModule({
      imports: [CrearProductoPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTanStackQuery(() => new QueryClient()),
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CrearProductoPage);
    fixture.detectChanges();
    const fill = (selector: string, value: string) => {
      const el = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    fill('#producto-nombre', 'Lomo');
    fill('#producto-precio', '12.00');
    fill('#producto-tipo', 'PLATO_FONDO');
    const submit = () => {
      fixture.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
    };
    const requests = TestBed.inject(HttpTestingController);
    submit();
    await vi.waitFor(() =>
      requests
        .expectOne('http://localhost:3000/api/v1/products')
        .flush({}, { status: 500, statusText: 'Error' }),
    );
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No se pudo crear');
    });
    expect(
      (fixture.nativeElement.querySelector('#producto-nombre') as HTMLInputElement).value,
    ).toBe('Lomo');
    submit();
    await vi.waitFor(() =>
      requests.expectOne('http://localhost:3000/api/v1/products').flush({ id: '1' }),
    );
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin/productos'));
    expect(TestBed.inject(ProductosNoticeService).consume()).toBe('Producto creado correctamente.');
    requests.verify();
  });
});
