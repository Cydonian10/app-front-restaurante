import { Component, input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
}
export type TableRow = Record<string, string | number>;

@Component({ selector: 'app-table', templateUrl: './table.html' })
export class Table {
  readonly columns = input.required<readonly TableColumn[]>();
  readonly rows = input.required<readonly TableRow[]>();
  readonly loading = input(false);
}
