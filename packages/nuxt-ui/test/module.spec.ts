import { beforeEach, describe, expect, it, vi } from 'vitest';

const addComponent = vi.fn();

vi.mock('@nuxt/kit', () => ({
  addComponent,
  createResolver: () => ({ resolve: (path: string) => `/module/${path}` }),
  defineNuxtModule: <T>(definition: T) => definition,
}));

describe('Nuxt module registration', () => {
  beforeEach(() => {
    addComponent.mockClear();
  });

  it('registers collision-safe components by default', async () => {
    const module = await import('../src/module');
    (module.default as any).setup({ autoImports: true });
    for (const [name, path] of [
      ['QTableGrouping', 'grouping/index.vue'],
      ['QTableGrouped', 'grouped/index.vue'],
      ['QTableFilterLookup', 'filtering/lookup.vue'],
      ['QTableGroup', 'group/index.vue'],
      ['QTableGroupLoadMore', 'group/load-more.vue'],
    ]) {
      expect(addComponent).toHaveBeenCalledWith({
        name,
        filePath: `/module/runtime/components/table/${path}`,
        priority: 0,
      });
    }
    expect(addComponent).toHaveBeenCalledWith({
      name: 'QTableFiltering',
      filePath: '/module/runtime/components/table/filtering/index.vue',
      priority: 0,
    });
    expect(addComponent).toHaveBeenCalledWith({
      name: 'QTableOptions',
      filePath: '/module/runtime/components/table/options/index.vue',
      priority: 0,
    });
    expect(addComponent).toHaveBeenCalledWith({
      name: 'QTablePagination',
      filePath: '/module/runtime/components/table/pagination/index.vue',
      priority: 0,
    });
    expect(addComponent).toHaveBeenCalledWith({
      name: 'QTableSorting',
      filePath: '/module/runtime/components/table/sorting/index.vue',
      priority: 0,
    });
    expect(addComponent).toHaveBeenCalledWith({
      name: 'QTableToolbar',
      filePath: '/module/runtime/components/table/toolbar/index.vue',
      priority: 0,
    });
  });

  it('leaves both integrations out when consumers disable them', async () => {
    const module = await import('../src/module');
    (module.default as any).setup({ autoImports: false });
    expect(addComponent).not.toHaveBeenCalled();
  });
});
