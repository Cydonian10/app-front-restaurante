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

  it('permite arrastrar una imagen válida, enviarla y retirar la selección', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:foto');
    URL.revokeObjectURL = vi.fn();
    try {
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
      const saved = vi.fn();
      fixture.componentInstance.saved.subscribe(saved);
      fixture.detectChanges();
      const image = new File(['foto'], 'nuevo.webp', { type: 'image/webp' });
      const drop = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(drop, 'dataTransfer', { value: { files: [image] } });
      const zone = fixture.nativeElement.querySelector('app-image-upload > div') as HTMLElement;
      zone.dispatchEvent(drop);
      fixture.detectChanges();
      expect(drop.defaultPrevented).toBe(true);
      expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:foto');
      expect(fixture.nativeElement.textContent).toContain('nuevo.webp');
      fixture.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      expect(saved).toHaveBeenCalledWith({
        nombre: 'Café',
        precio: '4.00',
        tipo: 'BEBIDA',
        imagen: image,
      });
      const clear = [...fixture.nativeElement.querySelectorAll('button')].find(
        (button: HTMLButtonElement) => button.textContent?.includes('Quitar selección'),
      ) as HTMLButtonElement;
      clear.click();
      fixture.detectChanges();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:foto');
      expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/cafe.jpg');
      fixture.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      expect(saved).toHaveBeenLastCalledWith({ nombre: 'Café', precio: '4.00', tipo: 'BEBIDA' });
      fixture.destroy();
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('bloquea el guardado de imágenes inválidas y permite corregir la selección', () => {
    const fixture = TestBed.createComponent(ProductoForm);
    fixture.componentRef.setInput('savingEnabled', true);
    fixture.componentRef.setInput('producto', {
      id: '1',
      nombre: 'Café',
      descripcion: null,
      precio: '4.00',
      tipo: 'BEBIDA',
      imageUrl: null,
    });
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.detectChanges();
    const fileInput = fixture.nativeElement.querySelector('#producto-imagen') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })],
    });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    expect(saved).not.toHaveBeenCalled();
    expect(fileInput.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('no superar 5 MB');
    const clear = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Quitar selección'),
    ) as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    expect(saved).toHaveBeenCalledWith({ nombre: 'Café', precio: '4.00', tipo: 'BEBIDA' });
  });
});
