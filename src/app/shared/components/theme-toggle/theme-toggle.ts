import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
@Component({
  selector: 'app-theme-toggle',
  imports: [LucideMoon, LucideSun],
  template: ` <button
    type="button"
    class="fixed right-5 bottom-5 z-10 inline-flex items-center gap-2 rounded-xl border border-base-content/15 bg-base-200 px-4 py-3 text-xs text-base-content hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-primary"
    (click)="toggle()"
    [attr.aria-label]="dark() ? 'Activar tema claro' : 'Activar tema oscuro'"
  >
    @if (dark()) {
      <svg lucideSun class="size-4" aria-hidden="true"></svg> Tema claro
    } @else {
      <svg lucideMoon class="size-4" aria-hidden="true"></svg> Tema oscuro
    }
  </button>`,
})
export class ThemeToggle {
  private readonly doc = inject(DOCUMENT);
  protected readonly dark = signal(this.read());
  constructor() {
    this.apply();
  }
  protected toggle(): void {
    this.dark.update((v) => !v);
    this.apply();
    try {
      localStorage.setItem('restaurant.theme', this.dark() ? 'dark' : 'light');
    } catch {}
  }
  private read(): boolean {
    try {
      return localStorage.getItem('restaurant.theme') !== 'light';
    } catch {
      return true;
    }
  }
  private apply(): void {
    this.doc.documentElement.setAttribute('data-theme', this.dark() ? 'dark' : 'light');
  }
}
