import { Component, computed, input, output } from '@angular/core';

export function pageItems(current: number, total: number): (number | string)[] {
  const count = Math.max(0, Math.floor(total));
  if (!count) return [];
  const page = Math.min(count, Math.max(1, Math.floor(current)));
  const numbers = [
    ...new Set([1, page - 1, page, page + 1, count].filter((n) => n >= 1 && n <= count)),
  ].sort((a, b) => a - b);
  const result: (number | string)[] = [];
  numbers.forEach((n, i) => {
    const previous = numbers[i - 1];
    if (i && n - previous === 2) result.push(previous + 1);
    else if (i && n - previous > 2) result.push(`gap-${previous}`);
    result.push(n);
  });
  return result;
}

@Component({ selector: 'app-pagination', templateUrl: './pagination.html' })
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly disabled = input(false);
  readonly pageChange = output<number>();
  protected readonly items = computed(() => pageItems(this.page(), this.totalPages()));
  protected select(page: number): void {
    if (!this.disabled() && page >= 1 && page <= this.totalPages() && page !== this.page())
      this.pageChange.emit(page);
  }
}
