import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query';
import { ProductoForm } from '../../components/producto-form/producto-form';
import { DatosProducto } from '../../interfaces/producto';
import { ProductosNoticeService } from '../../services/productos-notice.service';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-editar-producto',
  imports: [ProductoForm, RouterLink],
  template: `<section class="mx-auto max-w-7xl">
    <h1 class="text-3xl font-semibold">Editar producto</h1>
    @if (query.isPending()) {
      <p class="mt-4" role="status">Cargando producto…</p>
    } @else if (query.isError()) {
      <div class="mt-4" role="alert">
        {{ missing() ? 'No se encontró el producto.' : 'No se pudo cargar el producto.' }}
      </div>
      @if (!missing()) {
        <button type="button" class="mt-2 text-primary underline" (click)="query.refetch()">
          Reintentar
        </button>
      }
      <a routerLink="/admin/productos" class="ml-4 text-primary underline">Volver a productos</a>
    } @else if (query.data(); as producto) {
      <app-producto-form
        [producto]="producto"
        [savingEnabled]="true"
        [saving]="mutation.isPending()"
        [error]="mutation.isError() ? 'No se pudo guardar el producto. Inténtalo de nuevo.' : ''"
        (saved)="save($event)"
      />
    }
  </section>`,
})
export class EditarProductoPage {
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly service = inject(ProductosService);
  private readonly client = inject(QueryClient);
  private readonly router = inject(Router);
  private readonly notice = inject(ProductosNoticeService);
  protected readonly mutation = injectMutation(() => this.service.update());
  protected async save(data: DatosProducto): Promise<void> {
    try {
      await this.mutation.mutateAsync({ id: this.id, data });
      await this.client.invalidateQueries({ queryKey: ['productos'], refetchType: 'none' });
      this.notice.set('Producto actualizado correctamente.');
      await this.router.navigateByUrl('/admin/productos');
    } catch {
      /* La mutación conserva el error para el formulario. */
    }
  }
  protected readonly query = injectQuery(() => ({
    ...this.service.detail(this.id),
    retry: false,
    staleTime: Infinity,
  }));
  protected missing(): boolean {
    return (
      this.query.error() instanceof HttpErrorResponse &&
      (this.query.error() as HttpErrorResponse).status === 404
    );
  }
}
