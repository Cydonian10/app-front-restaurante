import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Button } from '../button/button';

export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
}

@Component({
  selector: 'app-dropdown',
  imports: [Button, Menu, MenuContent, MenuItem, MenuTrigger, NgTemplateOutlet],
  templateUrl: './dropdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  readonly label = input('Acciones');
  readonly variant = input<'solid' | 'soft' | 'outline' | 'ghost'>('soft');
  readonly color = input<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'>(
    'primary',
  );
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly triggerContent = input<TemplateRef<unknown> | null>(null);
  readonly items = input.required<readonly DropdownItem[]>();
  readonly selected = output<string>();

  protected select(value: string | undefined): void {
    if (value !== undefined) this.selected.emit(value);
  }
}
