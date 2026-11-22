import type { AppConfigInput } from '@nuxt/schema';
import { afterEach, describe, expect, it } from 'vitest';
import type {} from '../src/module';
import { useTableIcons } from '../src/runtime/composables/use-table-icons';
import { setAppConfig } from './nuxt-app';

const typedAppConfig = {
  querryKit: {
    table: {
      icons: { sorting: { trigger: 'typed-app-config-icon' } },
    },
  },
} satisfies AppConfigInput;

afterEach(() => {
  setAppConfig({});
});

describe('table icon configuration', () => {
  it('exposes typed app.config options', () => {
    expect(typedAppConfig.querryKit.table.icons.sorting.trigger).toBe('typed-app-config-icon');
  });

  it('uses app.config icons before package defaults', () => {
    setAppConfig({
      querryKit: {
        table: {
          icons: {
            sorting: { trigger: 'app-sort-trigger' },
            filtering: { add: 'app-filter-add' },
          },
        },
      },
    });

    const icon = useTableIcons();

    expect(icon('sorting.trigger')).toBe('app-sort-trigger');
    expect(icon('filtering.add')).toBe('app-filter-add');
    expect(icon('options.drag')).toBe('i-tabler-grip-vertical');
  });

  it('keeps component icons ahead of app.config icons', () => {
    setAppConfig({
      querryKit: {
        table: {
          icons: {
            sorting: { trigger: 'app-sort-trigger' },
          },
        },
      },
    });

    const icon = useTableIcons({ sorting: { trigger: 'component-sort-trigger' } });

    expect(icon('sorting.trigger')).toBe('component-sort-trigger');
  });
});
