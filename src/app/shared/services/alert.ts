import { Injectable, OnDestroy, signal } from '@angular/core';
import type { AlertType } from '../components/alert/alert';

export interface AlertOptions {
  title?: string;
  /** Tiempo visible en milisegundos; 0 mantiene la alerta hasta cerrarla. */
  duration?: number;
}

export interface AlertNotification {
  id: number;
  type: AlertType;
  message: string;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService implements OnDestroy {
  private readonly items = signal<readonly AlertNotification[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;
  readonly alerts = this.items.asReadonly();

  show(type: AlertType, message: string, options: AlertOptions = {}): number {
    const id = ++this.nextId;
    const titles: Record<AlertType, string> = {
      success: 'Listo',
      error: 'Ocurrió un error',
      warning: 'Atención',
      info: 'Información',
    };
    this.items.update((items) => [
      ...items,
      { id, type, message, title: options.title ?? titles[type] },
    ]);
    const duration = options.duration ?? 5000;
    if (duration > 0 && Number.isFinite(duration)) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
    return id;
  }

  success(message: string, options?: AlertOptions): number {
    return this.show('success', message, options);
  }
  error(message: string, options?: AlertOptions): number {
    return this.show('error', message, options);
  }
  warning(message: string, options?: AlertOptions): number {
    return this.show('warning', message, options);
  }
  info(message: string, options?: AlertOptions): number {
    return this.show('info', message, options);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.timers.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  ngOnDestroy(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }
}
