import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideHouse, LucideUtensils } from '@lucide/angular';
import { Sidebar, SidebarSection } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sidebar [sections]="sections" />
    <div class="min-h-screen px-4 pt-16 pb-8 md:ml-58.75 md:px-8 md:pt-8">
      <router-outlet />
    </div>
  `,
})
export class AdminLayout {
  protected readonly sections: readonly SidebarSection[] = [
    {
      label: 'Administración',
      items: [
        { label: 'Panel', route: '/admin', icon: LucideHouse },
        { label: 'Productos', route: '/admin/productos', icon: LucideUtensils },
      ],
    },
  ];
}
