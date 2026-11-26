import {
  LucideDynamicIcon,
  LucideMenu,
  LucideX,
  LucideChevronDown,
  type LucideIconInput,
} from '@lucide/angular';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export interface SidebarLink {
  label: string;
  route: string;
  icon?: LucideIconInput;
}
export interface SidebarGroup {
  label: string;
  icon?: LucideIconInput;
  children: readonly SidebarLink[];
}
export interface SidebarSection {
  label: string;
  items: readonly (SidebarLink | SidebarGroup)[];
}

@Component({
  selector: 'app-sidebar-menu-link',
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="item().route"
      routerLinkActive="bg-primary/15 text-primary"
      [routerLinkActiveOptions]="{ exact: true }"
      (click)="selected.emit()"
      class="text-base-content no-underline transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
      [class]="
        nested()
          ? 'block rounded-lg px-3 py-2.75 text-[13px] opacity-80'
          : 'flex w-full items-center gap-3 rounded-[9px] px-3 py-2.75 text-sm'
      "
    >
      @if (!nested()) {
        <span class="w-4.5 shrink-0 text-primary">
          @if (item().icon; as icon) {
            <svg [lucideIcon]="icon" [size]="18" aria-hidden="true"></svg>
          }
        </span>
      }
      {{ item().label }}
    </a>
  `,
})
class SidebarMenuLink {
  readonly item = input.required<SidebarLink>();
  readonly nested = input(false);
  readonly selected = output<void>();
}

@Component({
  selector: 'app-sidebar-menu-group',
  imports: [SidebarMenuLink, LucideDynamicIcon, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="flex w-full cursor-pointer items-center gap-3 rounded-[9px] border-0 bg-transparent px-3 py-2.75 text-left text-sm text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
      type="button"
      (click)="toggled.emit()"
      [attr.aria-expanded]="open()"
    >
      <span class="w-4.5 shrink-0 text-primary">
        @if (group().icon; as icon) {
          <svg [lucideIcon]="icon" [size]="18" aria-hidden="true"></svg>
        }
      </span>
      <span>{{ group().label }}</span>
      <span
        class="ml-auto transition-transform duration-200 motion-reduce:transition-none"
        [class.rotate-180]="open()"
      >
        <svg lucideChevronDown [size]="16" aria-hidden="true"></svg>
      </span>
    </button>
    <div
      class="grid transition-[grid-template-rows] duration-250 ease-in-out motion-reduce:transition-none"
      [class]="open() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div class="ml-4.5 border-l border-base-300 pl-2.5">
          @for (child of group().children; track child.route) {
            <app-sidebar-menu-link [item]="child" [nested]="true" (selected)="selected.emit()" />
          }
        </div>
      </div>
    </div>
  `,
})
class SidebarMenuGroup {
  readonly group = input.required<SidebarGroup>();
  readonly open = input.required<boolean>();
  readonly toggled = output<void>();
  readonly selected = output<void>();
}

@Component({
  selector: 'app-sidebar',
  imports: [SidebarMenuLink, SidebarMenuGroup, LucideMenu, LucideX],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
})
export class Sidebar {
  readonly sections = input.required<readonly SidebarSection[]>();
  protected readonly mobileOpen = signal(false);
  private readonly expanded = signal<Record<string, boolean>>({});
  private readonly router = inject(Router);
  private readonly navigation = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
  protected readonly currentUrl = computed(() => {
    this.navigation();
    return this.router.url.split('?')[0];
  });
  protected isGroup(item: SidebarLink | SidebarGroup): item is SidebarGroup {
    return 'children' in item;
  }
  protected isOpen(group: SidebarGroup): boolean {
    return (
      this.expanded()[group.label] ??
      group.children.some((child) => child.route === this.currentUrl())
    );
  }
  protected toggle(group: SidebarGroup): void {
    this.expanded.update((value) => ({ ...value, [group.label]: !this.isOpen(group) }));
  }
  protected close(): void {
    this.mobileOpen.set(false);
  }
}
