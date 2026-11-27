import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('abre, emite acciones y bloquea la cancelación mientras está ocupado', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialog] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('title', 'Dar de baja');
    fixture.componentRef.setInput('message', '¿Continuar?');
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    const confirm = vi.fn();
    const cancel = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirm);
    fixture.componentInstance.cancelled.subscribe(cancel);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    const buttons = dialog.querySelectorAll('button');
    buttons[1].click();
    buttons[0].click();
    expect(confirm).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(buttons[1].disabled).toBe(true);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(dialog.close).toHaveBeenCalledOnce();
  });
});
