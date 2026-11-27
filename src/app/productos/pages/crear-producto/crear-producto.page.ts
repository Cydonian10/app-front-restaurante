import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { injectMutation, QueryClient } from '@tanstack/angular-query';
import { ProductoForm } from '../../components/producto-form/producto-form';
import { DatosProducto } from '../../interfaces/producto';
import { ProductosService } from '../../services/productos.service';
import { Button } from '../../../shared/components/button/button';
import { AlertService } from '../../../shared/services/alert';

@Component({
  selector: 'app-crear-producto',
  imports: [ProductoForm, RouterLink, Button, LucideArrowLeft],
  template: `<section class="mx-auto max-w-7xl">
    <a
      appButton
      routerLink="/admin/productos"
      variant="ghost"
      color="neutral"
      size="sm"
      class="-ml-3 mb-5"
    >
      <svg lucideArrowLeft class="size-4" aria-hidden="true"></svg> Volver a productos
    </a>
    <h1 class="text-3xl font-semibold tracking-tight">Crear producto</h1>
    <p class="mt-2 text-sm text-base-content/65">Añade un nuevo producto a tu carta.</p>
    <app-producto-form
      [savingEnabled]="true"
      [saving]="mutation.isPending()"
      (saved)="save($event)"
    />
  </section>`,
})
export class CrearProductoPage {
  private readonly service = inject(ProductosService);
  private readonly client = inject(QueryClient);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  protected readonly mutation = injectMutation(() => this.service.create());
  protected async save(data: DatosProducto): Promise<void> {
    try {
      await this.mutation.mutateAsync(data);
      await this.client.invalidateQueries({ queryKey: ['productos', 'list'] });
      this.alerts.success('Producto creado correctamente.');
      await this.router.navigateByUrl('/admin/productos');
    } catch {
      this.alerts.error('No se pudo crear el producto. Inténtalo de nuevo.');
    }
  }
}
