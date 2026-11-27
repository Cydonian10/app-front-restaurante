import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-productos-access',
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.profile.isLoading()) {
      <p role="status">Comprobando acceso…</p>
    } @else if (auth.profile.error()) {
      <div role="alert">No se pudo comprobar tu acceso.</div>
      <button type="button" class="mt-2 text-primary underline" (click)="auth.profile.reload()">
        Reintentar
      </button>
    } @else if (auth.user()?.role === 'ADMIN') {
      <router-outlet />
    } @else {
      <h1 class="text-2xl font-semibold">Acceso denegado</h1>
      <p class="mt-2">Necesitas permisos de administrador para gestionar productos.</p>
      <a class="mt-4 inline-block text-primary underline" routerLink="/admin">Volver al panel</a>
    }
  `,
})
export class ProductosAccessPage {
  protected readonly auth = inject(AuthService);
}
