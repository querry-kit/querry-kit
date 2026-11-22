import { describe, expect, it } from 'vitest';

describe('runtime exports', () => {
  it('exposes the public table components', async () => {
    const runtime = await import('../src/runtime');

    expect(runtime.QTableGrouping).toBeDefined();
    expect(runtime.QTableGroup).toBeDefined();
    expect(runtime.QTableGroupLoadMore).toBeDefined();
    expect(runtime.QTableFiltering).toBeDefined();
    expect(runtime.QTableFilterLookup).toBeDefined();
    expect(runtime.QTableOptions).toBeDefined();
    expect(runtime.QTablePagination).toBeDefined();
    expect(runtime.QTableSorting).toBeDefined();
    expect(runtime.QTableToolbar).toBeDefined();
  });
});
