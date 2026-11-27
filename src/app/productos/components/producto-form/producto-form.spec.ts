import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ProductoForm } from './producto-form';

describe('ProductoForm', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ProductoForm], providers: [provideRouter([])] }),
  );

  it('valida campos y emite datos válidos sin perderlos al mostrar un error', async () => {
    const fixture = TestBed.createComponent(ProductoForm);
    fixture.componentRef.setInput('savingEnabled', true);
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(saved).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresa el nombre');
    const set = (selector: string, value: string, event = 'input') => {
      const element = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      element.value = value;
      element.dispatchEvent(new Event(event));
      fixture.detectChanges();
    };
    set('#producto-nombre', 'Lomo saltado');
    set('#producto-precio', '12.345');
    set('#producto-tipo', 'BEBIDA');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(saved).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('hasta dos decimales');
    set('#producto-precio', '12.50');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(saved).toHaveBeenCalledWith({ nombre: 'Lomo saltado', precio: '12.50', tipo: 'BEBIDA' });
    fixture.componentRef.setInput('error', 'Error al guardar');
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('#producto-nombre') as HTMLInputElement).value,
    ).toBe('Lomo saltado');
  });

  it('carga datos existentes y rechaza imágenes inválidas', () => {
    const fixture = TestBed.createComponent(ProductoForm);
    fixture.componentRef.setInput('savingEnabled', true);
    fixture.componentRef.setInput('producto', {
      id: '1',
      nombre: 'Café',
      descripcion: null,
      precio: '4.00',
      tipo: 'BEBIDA',
      imageUrl: '/cafe.jpg',
    });
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('#producto-nombre') as HTMLInputElement).value,
    ).toBe('Café');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/cafe.jpg');
    const file = fixture.nativeElement.querySelector('#producto-imagen') as HTMLInputElement;
    Object.defineProperty(file, 'files', {
      configurable: true,
      value: [new File(['x'], 'x.txt', { type: 'text/plain' })],
    });
    file.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('no superar 5 MB');
  });
});
