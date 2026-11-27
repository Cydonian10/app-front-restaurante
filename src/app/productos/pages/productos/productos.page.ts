import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query';
import { Input } from '../../../shared/components/input/input';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { TipoProducto } from '../../interfaces/producto';
import { TIPOS_PRODUCTO } from '../../interfaces/tipos-producto';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-productos-page',
  imports: [DecimalPipe, Input, Pagination, Table, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos.page.html',
})
export class ProductosPage {
  private readonly service = inject(ProductosService);
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
}
