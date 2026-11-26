import { Directive, computed, input } from '@angular/core';

type CardVariant = 'default' | 'secondary';

@Directive({
  selector: '[appCard]',
  host: { '[class]': 'classes()' },
})
export class Card {
  readonly variant = input<CardVariant>('default');
  protected readonly classes = computed(() => {
    const surfaces: Record<CardVariant, string> = {
      default: 'bg-base-200',
      secondary: 'bg-base-300',
    };
    return `block rounded-xl p-4 text-base-content ${surfaces[this.variant()]}`;
  });
}

@Directive({ selector: '[appCardHeader]', host: { class: 'mb-4' } })
export class CardHeader {}

@Directive({
  selector: '[appCardTitle]',
  host: { class: 'text-base font-medium' },
})
export class CardTitle {}

@Directive({
  selector: '[appCardDescription]',
  host: { class: 'text-sm text-base-content/60' },
})
export class CardDescription {}

@Directive({ selector: '[appCardContent]', host: { class: 'block' } })
export class CardContent {}

@Directive({
  selector: '[appCardFooter]',
  host: { class: 'mt-4 flex items-center gap-2' },
})
export class CardFooter {}
