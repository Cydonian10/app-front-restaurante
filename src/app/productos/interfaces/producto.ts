export type TipoProducto = 'PLATO_FONDO' | 'BEBIDA' | 'EXTRA' | 'POSTRE' | 'MENU' | 'BEBIDA_MENU';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  tipo: TipoProducto;
  principal: boolean;
  disponible: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginaProductos {
  items: Producto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FiltrosProductos {
  page: number;
  limit: number;
  tipo?: TipoProducto;
  nombre?: string;
}

export interface DatosProducto {
  nombre: string;
  descripcion?: string;
  precio: string;
  tipo: TipoProducto;
  imagen?: File;
}
