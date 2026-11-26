import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-google-callback',
  imports: [RouterLink],
  template: `<main class="mx-auto max-w-md p-8 text-center">
    @if (error()) {
      <p role="alert">{{ error() }}</p>
      <a class="mt-4 inline-block text-secondary underline" routerLink="/auth/login"
        >Volver al inicio de sesión</a
      >
    } @else {
      <p role="status">Completando inicio de sesión con Google…</p>
    }
  </main>`,
})
export class GoogleCallbackPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly error = signal('');
  ngOnInit(): void {
    const code = new URLSearchParams(window.location.hash.slice(1)).get('code');
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
    if (!code) {
      this.error.set('No se recibió el código de Google. Intentá de nuevo.');
      return;
    }
    this.auth.exchangeGoogleCode(code).subscribe({
      next: () => void this.router.navigateByUrl('/admin'),
      error: () =>
        this.error.set('No se pudo completar el inicio de sesión con Google. Intentá de nuevo.'),
    });
  }
}
