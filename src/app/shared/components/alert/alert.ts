import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideInfo,
  LucideTriangleExclamationPoint,
  LucideX,
} from '@lucide/angular';
import { Button } from '../button/button';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  imports: [
    Button,
    LucideCircleCheck,
    LucideCircleX,
    LucideInfo,
    LucideTriangleExclamationPoint,
    LucideX,
  ],
  templateUrl: './alert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Alert {
  readonly type = input<AlertType>('info');
  readonly title = input('');
  readonly message = input.required<string>();
  readonly dismissible = input(false);
  readonly floating = input(false);
  readonly closed = output<void>();
}
