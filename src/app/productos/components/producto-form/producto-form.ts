import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { FormField, form, maxLength, pattern, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideSave } from '@lucide/angular';
import { Button } from '../../../shared/components/button/button';
import { ImageSelection, ImageUpload } from '../../../shared/components/image-upload/image-upload';
import { Input } from '../../../shared/components/input/input';
import { DatosProducto, Producto, TipoProducto } from '../../interfaces/producto';
import { TIPOS_PRODUCTO } from '../../interfaces/tipos-producto';

@Component({
  selector: 'app-producto-form',
  imports: [FormField, Input, Button, RouterLink, ImageUpload, LucideSave],
  templateUrl: './producto-form.html',
})
export class ProductoForm {
  readonly producto = input<Producto | null>(null);
  readonly savingEnabled = input(false);
  readonly saving = input(false);
  readonly error = input('');
  readonly saved = output<DatosProducto>();
  protected readonly tipos = TIPOS_PRODUCTO;
  protected readonly attempted = signal(false);
  protected readonly imageError = signal('');
  protected readonly image = signal<File | null>(null);
  private readonly model = linkedSignal(() => {
    const producto = this.producto();
    return {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio: producto?.precio ?? '',
      tipo: producto?.tipo ?? ('' as TipoProducto | ''),
    };
  });
  protected readonly fields = form(this.model, (schema) => {
    required(schema.nombre, { message: 'Ingresa el nombre.' });
    pattern(schema.nombre, /^.*\S.*$/, { message: 'Ingresa un nombre válido.' });
    maxLength(schema.nombre, 255, { message: 'El nombre no debe superar 255 caracteres.' });
    required(schema.precio, { message: 'Ingresa el precio.' });
    pattern(schema.precio, /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
      message: 'Ingresa un precio válido con hasta dos decimales.',
    });
    required(schema.tipo, { message: 'Selecciona un tipo.' });
  });

  protected imageChanged(selection: ImageSelection): void {
    this.image.set(selection.file);
    this.imageError.set(selection.error);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    if (this.fields().invalid() || this.imageError() || this.saving() || !this.savingEnabled())
      return;
    const value = this.model();
    this.saved.emit({
      nombre: value.nombre.trim(),
      precio: value.precio,
      tipo: value.tipo as TipoProducto,
      ...(value.descripcion.trim() ? { descripcion: value.descripcion.trim() } : {}),
      ...(this.image() ? { imagen: this.image()! } : {}),
    });
  }
}
