import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  signal,
} from '@angular/core';

type InputType =
  'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly name = input('');
  readonly autocomplete = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model('');
  protected readonly showPassword = signal(false);
}
