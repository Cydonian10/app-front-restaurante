import { Component } from '@angular/core';
import { ProductoForm } from '../../components/producto-form/producto-form';

@Component({
  selector: 'app-crear-producto',
  imports: [ProductoForm],
  template: `<section class="mx-auto max-w-7xl">
    <h1 class="text-3xl font-semibold">Crear producto</h1>
    <app-producto-form />
  </section>`,
})
export class CrearProductoPage {}
