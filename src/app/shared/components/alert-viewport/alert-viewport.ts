import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlertService } from '../../services/alert';
import { Alert } from '../alert/alert';

@Component({
  selector: 'app-alert-viewport',
  imports: [Alert],
  templateUrl: './alert-viewport.html',
  styleUrl: './alert-viewport.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertViewport {
  protected readonly service = inject(AlertService);
  protected readonly left = computed(() =>
    this.service.alerts().filter((alert) => alert.position === 'top-left'),
  );
  protected readonly right = computed(() =>
    this.service.alerts().filter((alert) => alert.position === 'top-right'),
  );
}
