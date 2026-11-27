import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectMutation, QueryClient } from '@tanstack/angular-query';
import { ProductoForm } from '../../components/producto-form/producto-form';
import { DatosProducto } from '../../interfaces/producto';
import { ProductosService } from '../../services/productos.service';
import { ProductosNoticeService } from '../../services/productos-notice.service';

@Component({
  selector: 'app-crear-producto',
  imports: [ProductoForm],
  template: `<section class="mx-auto max-w-7xl">
    <h1 class="text-3xl font-semibold">Crear producto</h1>
    <app-producto-form
      [savingEnabled]="true"
      [saving]="mutation.isPending()"
      [error]="mutation.isError() ? 'No se pudo crear el producto. Inténtalo de nuevo.' : ''"
      (saved)="save($event)"
    />
  </section>`,
})
export class CrearProductoPage {
  private readonly service = inject(ProductosService);
  private readonly client = inject(QueryClient);
  private readonly router = inject(Router);
  private readonly notice = inject(ProductosNoticeService);
  protected readonly mutation = injectMutation(() => this.service.create());
  protected async save(data: DatosProducto): Promise<void> {
    try {
      await this.mutation.mutateAsync(data);
      await this.client.invalidateQueries({ queryKey: ['productos', 'list'] });
      this.notice.set('Producto creado correctamente.');
      await this.router.navigateByUrl('/admin/productos');
    } catch {
      /* La mutación conserva el error para el formulario. */
    }
  }
}
