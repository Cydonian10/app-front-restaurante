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

  it('envía la imagen elegida y la conserva si falla el primer intento', async () => {
    TestBed.configureTestingModule({
      imports: [CrearProductoPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTanStackQuery(() => new QueryClient()),
      ],
    });
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:imagen');
    URL.revokeObjectURL = vi.fn();
    try {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const fixture = TestBed.createComponent(CrearProductoPage);
      fixture.detectChanges();
      for (const [selector, value] of [
        ['#producto-nombre', 'Tarta'],
        ['#producto-precio', '10.00'],
        ['#producto-tipo', 'POSTRE'],
      ]) {
        const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }
      const image = new File(['foto'], 'tarta.png', { type: 'image/png' });
      const input = fixture.nativeElement.querySelector('#producto-imagen') as HTMLInputElement;
      Object.defineProperty(input, 'files', { configurable: true, value: [image] });
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const submit = () =>
        fixture.nativeElement
          .querySelector('form')
          .dispatchEvent(new Event('submit', { cancelable: true }));
      const requests = TestBed.inject(HttpTestingController);
      submit();
      await vi.waitFor(() => {
        const request = requests.expectOne('http://localhost:3000/api/v1/products');
        expect(request.request.body.get('imagen')).toBe(image);
        request.flush({}, { status: 500, statusText: 'Error' });
      });
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No se pudo crear');
      });
      expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:imagen');
      submit();
      await vi.waitFor(() => {
        const request = requests.expectOne('http://localhost:3000/api/v1/products');
        expect(request.request.body.get('imagen')).toBe(image);
        request.flush({ id: '1' });
      });
      await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin/productos'));
      requests.verify();
      fixture.destroy();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:imagen');
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });
});
