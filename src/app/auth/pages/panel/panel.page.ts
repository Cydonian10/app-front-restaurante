import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../../shared/components/button/button';
@Component({
  selector: 'app-panel-page',
  imports: [Button],
  template: `<main class="mx-auto max-w-3xl p-8">
    <h1 class="text-2xl font-semibold">Tu panel</h1>
    @if (auth.profile.isLoading()) {
      <p class="mt-4" role="status">Cargando perfil…</p>
    } @else if (auth.user(); as user) {
      <p class="mt-4">Bienvenido, {{ user.name }}.</p>
    } @else if (auth.profile.error()) {
      <p class="mt-4" role="alert">No se pudo cargar tu perfil.</p>
      <button type="button" class="mt-2 text-secondary underline" (click)="auth.profile.reload()">
        Reintentar
      </button>
    }
    <button appButton class="mt-6" type="button" (click)="auth.logout()">Cerrar sesión</button>
  </main>`,
})
export class PanelPage {
  protected readonly auth = inject(AuthService);
}
