import { TipoProducto } from './producto';

export const TIPOS_PRODUCTO: readonly { value: TipoProducto; label: string }[] = [
  { value: 'PLATO_FONDO', label: 'Plato de fondo' },
  { value: 'BEBIDA', label: 'Bebida' },
  { value: 'EXTRA', label: 'Extra' },
  { value: 'POSTRE', label: 'Postre' },
  { value: 'MENU', label: 'Menú' },
  { value: 'BEBIDA_MENU', label: 'Bebida de menú' },
];
