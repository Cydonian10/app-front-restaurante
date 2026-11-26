import { booleanAttribute, Component, computed, input, model, output, signal } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
type InputType =
  'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
@Component({
  selector: 'app-input',
  imports: [LucideEye, LucideEyeOff],
  templateUrl: './input.html',
  host: { class: 'block' },
})
export class Input implements FormValueControl<string> {
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly name = input('');
  readonly inputId = input('');
  readonly autocomplete = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model('');
  readonly error = input('');
  readonly touched = input(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly submitted = input(false);
  readonly touch = output<void>();
  protected readonly displayedError = computed(() => this.error() || ((this.touched() || this.submitted()) ? this.errors()[0]?.message ?? '' : ''));
  protected readonly id = computed(() => this.inputId() || this.name());
  protected readonly showPassword = signal(false);
}
