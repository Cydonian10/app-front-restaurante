import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mutationOptions, queryOptions } from '@tanstack/angular-query';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatosProducto, FiltrosProductos, PaginaProductos, Producto } from '../interfaces/producto';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.api.replace(/\/$/, '')}/products`;

  list(filtros: FiltrosProductos) {
    let params = new HttpParams().set('page', filtros.page).set('limit', filtros.limit);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.nombre?.trim()) params = params.set('nombre', filtros.nombre.trim());
    return queryOptions({
      queryKey: ['productos', 'list', filtros] as const,
      queryFn: () => lastValueFrom(this.http.get<PaginaProductos>(`${this.url}/admin`, { params })),
    });
  }

  detail(id: string) {
    return queryOptions({
      queryKey: ['productos', 'detail', id] as const,
      queryFn: () => lastValueFrom(this.http.get<Producto>(`${this.url}/admin/${id}`)),
    });
  }

  create() {
    return mutationOptions({
      mutationFn: (data: DatosProducto) =>
        lastValueFrom(this.http.post<Producto>(this.url, this.formData(data))),
    });
  }

  update() {
    return mutationOptions({
      mutationFn: ({ id, data }: { id: string; data: DatosProducto }) =>
        lastValueFrom(this.http.patch<{ id: string }>(`${this.url}/${id}`, this.formData(data))),
    });
  }

  delete() {
    return mutationOptions({
      mutationFn: (id: string) =>
        lastValueFrom(this.http.delete<{ id: string }>(`${this.url}/${id}`)),
    });
  }

  updateAvailability() {
    return mutationOptions({
      mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) =>
        lastValueFrom(
          this.http.patch<{ id: string; disponible: boolean }>(`${this.url}/${id}/disponibilidad`, {
            disponible,
          }),
        ),
    });
  }

  private formData(data: DatosProducto): FormData {
    const body = new FormData();
    body.set('nombre', data.nombre);
    body.set('precio', data.precio);
    body.set('tipo', data.tipo);
    if (data.descripcion?.trim()) body.set('descripcion', data.descripcion);
    if (data.imagen) body.set('imagen', data.imagen);
    return body;
  }
}
