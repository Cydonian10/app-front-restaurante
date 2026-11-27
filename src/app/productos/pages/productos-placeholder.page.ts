import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-productos-placeholder',
  template: `<h1 class="text-2xl font-semibold">{{ title }}</h1>`,
})
export class ProductosPlaceholderPage {
  protected readonly title = inject(ActivatedRoute).snapshot.data['title'] as string;
}
