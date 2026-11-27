import { Directive, computed, input } from '@angular/core';

type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const colors: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid: 'bg-primary text-primary-content hover:bg-primary/85',
    soft: 'bg-primary/15 text-primary hover:bg-primary/25',
    outline: 'text-primary outline-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-content hover:bg-secondary/85',
    soft: 'bg-secondary/15 text-secondary hover:bg-secondary/25',
    outline: 'text-secondary outline-secondary hover:bg-secondary/10',
    ghost: 'text-secondary hover:bg-secondary/10',
  },
  success: {
    solid: 'bg-success text-success-content hover:bg-success/85',
    soft: 'bg-success/15 text-success hover:bg-success/25',
    outline: 'text-success outline-success hover:bg-success/10',
    ghost: 'text-success hover:bg-success/10',
  },
  warning: {
    solid: 'bg-warning text-warning-content hover:bg-warning/85',
    soft: 'bg-warning/15 text-warning hover:bg-warning/25',
    outline: 'text-warning outline-warning hover:bg-warning/10',
    ghost: 'text-warning hover:bg-warning/10',
  },
  error: {
    solid: 'bg-error text-error-content hover:bg-error/85',
    soft: 'bg-error/15 text-error hover:bg-error/25',
    outline: 'text-error outline-error hover:bg-error/10',
    ghost: 'text-error hover:bg-error/10',
  },
  neutral: {
    solid: 'bg-neutral text-neutral-content hover:bg-neutral/85',
    soft: 'bg-base-content/10 text-base-content hover:bg-base-content/20',
    outline: 'text-base-content outline-base-content/40 hover:bg-base-content/10',
    ghost: 'text-base-content hover:bg-base-content/10',
  },
};

@Directive({
  selector: 'button[appButton], a[appButton]',
  host: {
    '[class]': 'classes()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('solid');
  readonly color = input<ButtonColor>('primary');
  readonly size = input<ButtonSize>('md');

  protected readonly classes = computed(() => {
    const sizes: Record<ButtonSize, string> = {
      sm: 'min-h-9 px-3 py-1.5 text-sm',
      md: 'min-h-10 px-4 py-2 text-sm',
      lg: 'px-6 py-3.5',
      icon: 'size-10 shrink-0',
    };
    return [
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50',
      colors[this.color()][this.variant()],
      sizes[this.size()],
      this.variant() === 'outline' ? 'outline outline-1 -outline-offset-1' : '',
    ].join(' ');
  });
}
