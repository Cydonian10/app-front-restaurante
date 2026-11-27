import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AlertService } from '../../services/alert';
import { AlertViewport } from './alert-viewport';

describe('Alertas globales', () => {
  it('apila los cuatro tipos y permite cerrar solo una alerta', () => {
    TestBed.configureTestingModule({ imports: [AlertViewport] });
    const fixture = TestBed.createComponent(AlertViewport);
    const alerts = TestBed.inject(AlertService);
    fixture.detectChanges();
    alerts.success('Guardado', { duration: 0 });
    alerts.warning('Atención al stock', { duration: 0 });
    alerts.info('Información adicional', { duration: 0 });
    alerts.error('No se pudo guardar', { duration: 0 });
    fixture.detectChanges();
    const rendered = fixture.nativeElement.querySelectorAll('app-alert') as NodeListOf<HTMLElement>;
    expect(rendered).toHaveLength(4);
    expect([...rendered].map((item) => item.textContent)).toEqual([
      expect.stringContaining('Guardado'),
      expect.stringContaining('Atención al stock'),
      expect.stringContaining('Información adicional'),
      expect.stringContaining('No se pudo guardar'),
    ]);
    expect(rendered[3].querySelector('[role="alert"]')).toBeTruthy();
    expect(rendered[0].querySelector('[role="status"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('section.right-4').querySelectorAll('app-alert'),
    ).toHaveLength(4);
    rendered[1].querySelector('button')!.click();
    expect(alerts.alerts().map((item) => item.message)).toEqual([
      'Guardado',
      'Información adicional',
      'No se pudo guardar',
    ]);
  });

  it('mantiene pilas independientes para las posiciones elegidas', () => {
    TestBed.configureTestingModule({ imports: [AlertViewport] });
    const fixture = TestBed.createComponent(AlertViewport);
    const alerts = TestBed.inject(AlertService);
    alerts.info('Derecha', { duration: 0 });
    alerts.success('Izquierda', { position: 'top-left', duration: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section.left-4').textContent).toContain(
      'Izquierda',
    );
    expect(fixture.nativeElement.querySelector('section.right-4').textContent).toContain('Derecha');
  });

  it('respeta la duración configurada, el cierre manual y las alertas persistentes', () => {
    vi.useFakeTimers();
    const alerts = new AlertService();
    try {
      alerts.success('Breve', { duration: 300 });
      alerts.warning('Persistente', { duration: 0 });
      const errorId = alerts.error('Cierre manual', { duration: 1000 });
      alerts.info('Duración predeterminada');
      vi.advanceTimersByTime(299);
      expect(alerts.alerts()).toHaveLength(4);
      vi.advanceTimersByTime(1);
      expect(alerts.alerts().map((item) => item.message)).not.toContain('Breve');
      alerts.dismiss(errorId);
      vi.advanceTimersByTime(4699);
      expect(alerts.alerts()).toHaveLength(2);
      vi.advanceTimersByTime(1);
      expect(alerts.alerts().map((item) => item.message)).toEqual(['Persistente']);
    } finally {
      alerts.ngOnDestroy();
      vi.useRealTimers();
    }
  });
});
