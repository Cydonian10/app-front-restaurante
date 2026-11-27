import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query';
import { ProductoForm } from '../../components/producto-form/producto-form';
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
      <app-producto-form [producto]="producto" />
    }
  </section>`,
})
export class EditarProductoPage {
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly service = inject(ProductosService);
  protected readonly query = injectQuery(() => ({ ...this.service.detail(this.id), retry: false }));
  protected missing(): boolean {
    return (
      this.query.error() instanceof HttpErrorResponse &&
      (this.query.error() as HttpErrorResponse).status === 404
    );
  }
}
