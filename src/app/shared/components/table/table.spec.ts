import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Table, TableColumn } from './table';

@Component({
  imports: [Table],
  template: `
    <ng-template #actions let-row
      ><button (click)="selected = row.name">Editar {{ row.name }}</button></ng-template
    >
    <app-table [columns]="columns" [rows]="rows" [cellTemplates]="{ actions: actions }" />
  `,
})
class Host {
  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'actions', label: 'Acciones' },
  ];
  readonly rows = [{ name: 'Lomo' }];
  selected = '';
}

describe('Table', () => {
  it('muestra valores y plantillas con acceso a la fila', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Lomo');
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.selected).toBe('Lomo');
  });
});
