import { TestBed } from '@angular/core/testing';
import { Input } from './input';

describe('Input de contraseña', () => {
  it('permite mostrar y ocultar la contraseña sin enviar el formulario', async () => {
    const fixture = TestBed.createComponent(Input);
    fixture.componentRef.setInput('label', 'Contraseña');
    fixture.componentRef.setInput('name', 'password');
    fixture.componentRef.setInput('type', 'password');
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Ocultar contraseña');
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('password');
  });
});
