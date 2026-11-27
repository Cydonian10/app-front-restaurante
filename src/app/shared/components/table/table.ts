import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
}
export type TableRow = Record<string, string | number | boolean | null>;

@Component({ selector: 'app-table', imports: [NgTemplateOutlet], templateUrl: './table.html' })
export class Table<T extends object = TableRow> {
  readonly columns = input.required<readonly TableColumn[]>();
  readonly rows = input.required<readonly T[]>();
  readonly loading = input(false);
  readonly cellTemplates = input<Partial<Record<string, TemplateRef<{ $implicit: T }>>>>({});
}
