import { pageItems } from './pagination';

describe('pageItems', () => {
  it('handles empty and small totals', () => {
    expect(pageItems(1, 0)).toEqual([]);
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
  });
  it('shows the current page, neighbors, and endpoints with gaps', () => {
    expect(pageItems(15, 60)).toEqual([1, 'gap-1', 14, 15, 16, 'gap-16', 60]);
    expect(pageItems(1, 60)).toEqual([1, 2, 'gap-2', 60]);
    expect(pageItems(60, 60)).toEqual([1, 'gap-1', 59, 60]);
  });
  it('fills single-page gaps', () => {
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
