import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query';
import { ProductoForm } from '../../components/producto-form/producto-form';
import { DatosProducto } from '../../interfaces/producto';
import { ProductosService } from '../../services/productos.service';
import { Button } from '../../../shared/components/button/button';
import { AlertService } from '../../../shared/services/alert';

@Component({
  selector: 'app-editar-producto',
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
    <h1 class="text-3xl font-semibold tracking-tight">Editar producto</h1>
    <p class="mt-2 text-sm text-base-content/65">Actualiza los detalles de tu producto.</p>
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
  private readonly alerts = inject(AlertService);
  protected readonly mutation = injectMutation(() => this.service.update());
  protected async save(data: DatosProducto): Promise<void> {
    try {
      await this.mutation.mutateAsync({ id: this.id, data });
      await this.client.invalidateQueries({ queryKey: ['productos'], refetchType: 'none' });
      this.alerts.success('Producto actualizado correctamente.');
      await this.router.navigateByUrl('/admin/productos');
    } catch {
      this.alerts.error('No se pudo guardar el producto. Inténtalo de nuevo.');
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
