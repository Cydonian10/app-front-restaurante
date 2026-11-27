import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductosNoticeService {
  private readonly message = signal('');
  set(message: string): void {
    this.message.set(message);
  }
  consume(): string {
    const value = this.message();
    this.message.set('');
    return value;
  }
}
