import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Input } from '../../../shared/components/input/input';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Producto, TipoProducto } from '../../interfaces/producto';
import { TIPOS_PRODUCTO } from '../../interfaces/tipos-producto';
import { ProductosService } from '../../services/productos.service';
import { ProductosNoticeService } from '../../services/productos-notice.service';

@Component({
  selector: 'app-productos-page',
  imports: [DecimalPipe, Input, Pagination, Table, RouterLink, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos.page.html',
})
export class ProductosPage {
  private readonly service = inject(ProductosService);
  private readonly client = inject(QueryClient);
  private readonly notice = inject(ProductosNoticeService);
  protected readonly message = signal(this.notice.consume());
  protected readonly actionError = signal('');
  protected readonly deleteError = signal('');
  protected readonly selected = signal<Producto | null>(null);
  protected readonly availabilityMutation = injectMutation(() => this.service.updateAvailability());
  protected readonly deleteMutation = injectMutation(() => this.service.delete());
  protected readonly page = signal(1);
  protected readonly nombre = signal('');
  protected readonly tipo = signal<TipoProducto | ''>('');
  protected readonly tipos = TIPOS_PRODUCTO;
  protected readonly columns: readonly TableColumn[] = [
    { key: 'imageUrl', label: 'Imagen' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'precio', label: 'Precio' },
    { key: 'disponible', label: 'Disponibilidad' },
    { key: 'acciones', label: 'Acciones' },
  ];
  protected readonly filters = computed(() => ({
    page: this.page(),
    limit: 10,
    ...(this.nombre().trim() ? { nombre: this.nombre().trim() } : {}),
    ...(this.tipo() ? { tipo: this.tipo() as TipoProducto } : {}),
  }));
  protected readonly query = injectQuery(() => this.service.list(this.filters()));

  protected changeSearch(value: string): void {
    this.page.set(1);
    this.nombre.set(value);
  }
  protected changeType(value: string): void {
    this.page.set(1);
    this.tipo.set(value as TipoProducto | '');
  }
  protected typeLabel(type: TipoProducto): string {
    return this.tipos.find((item) => item.value === type)?.label ?? type;
  }
  protected async changeAvailability(producto: Producto): Promise<void> {
    this.actionError.set('');
    this.message.set('');
    try {
      await this.availabilityMutation.mutateAsync({
        id: producto.id,
        disponible: !producto.disponible,
      });
      await this.client.invalidateQueries({ queryKey: ['productos'] });
      this.message.set('Disponibilidad actualizada correctamente.');
    } catch {
      this.actionError.set('No se pudo cambiar la disponibilidad. Inténtalo de nuevo.');
    }
  }
  protected selectForDeletion(producto: Producto): void {
    this.deleteError.set('');
    this.selected.set(producto);
  }
  protected async confirmDelete(): Promise<void> {
    const producto = this.selected();
    if (!producto || this.deleteMutation.isPending()) return;
    this.deleteError.set('');
    this.actionError.set('');
    this.message.set('');
    try {
      await this.deleteMutation.mutateAsync(producto.id);
      if (this.page() > 1 && this.query.data()?.items.length === 1)
        this.page.update((page) => page - 1);
      this.selected.set(null);
      await this.client.invalidateQueries({ queryKey: ['productos'] });
      this.message.set('Producto dado de baja correctamente.');
    } catch {
      this.deleteError.set('No se pudo dar de baja el producto. Inténtalo de nuevo.');
    }
  }
}
