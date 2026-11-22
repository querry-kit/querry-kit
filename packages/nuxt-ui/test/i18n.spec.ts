import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const { getCurrentInstance } = vi.hoisted(() => ({ getCurrentInstance: vi.fn() }));

vi.mock('vue', async (importOriginal) => ({ ...(await importOriginal<typeof import('vue')>()), getCurrentInstance }));

import { useTableI18n, useTableNumber } from '../src/runtime/composables/use-table-i18n';

describe('useTableI18n', () => {
  beforeEach(() => getCurrentInstance.mockReset());

  it('uses a namespaced host-app translation when one is available', () => {
    getCurrentInstance.mockReturnValue({
      appContext: { config: { globalProperties: { $t: (key: string) => `translated:${key}` } } },
    });

    expect(useTableI18n()('sorting.title')).toBe('translated:querrykit.table.sorting.title');
  });

  it('returns the English fallback without i18n or for an unresolved key', () => {
    expect(useTableI18n()('sorting.title')).toBe('Sort');

    getCurrentInstance.mockReturnValue({
      appContext: { config: { globalProperties: { $t: (key: string) => key } } },
    });
    expect(useTableI18n()('sorting.title')).toBe('Sort');
  });

  it('gives explicit text overrides precedence and interpolates English-style placeholders', () => {
    getCurrentInstance.mockReturnValue({
      appContext: { config: { globalProperties: { $t: () => 'translated' } } },
    });

    const t = useTableI18n({
      sorting: { title: 'Order' },
      pagination: { summary: 'Rows {start} through {end} out of {total}' },
    });

    expect(t('sorting.title')).toBe('Order');
    expect(t('pagination.summary', { start: 1, end: 10, total: 42 })).toBe('Rows 1 through 10 out of 42');
  });

  it('reads replaced overrides and forwards plural counts to the active locale', () => {
    const locale = ref('en-US');
    const overrides = ref<{ grouping?: { rowLabel?: string } }>({});
    const translate = vi.fn((key: string, values: { count: number }, plural: number) => {
      if (key !== 'querrykit.table.grouping.rowLabel') return key;
      const noun = locale.value === 'de-DE' ? (plural === 1 ? 'Eintrag' : 'Einträge') : 'items';
      return `${values.count} ${noun}`;
    });
    getCurrentInstance.mockReturnValue({
      appContext: {
        config: {
          globalProperties: { $t: translate, $n: (value: number) => new Intl.NumberFormat(locale.value).format(value) },
        },
      },
    });
    const t = useTableI18n(overrides);
    const formatNumber = useTableNumber();
    expect(t('grouping.rowLabel', { count: 1 }, 1)).toBe('1 items');
    expect(formatNumber(1234)).toBe('1,234');
    locale.value = 'de-DE';
    expect(t('grouping.rowLabel', { count: 1 }, 1)).toBe('1 Eintrag');
    expect(t('grouping.rowLabel', { count: 2 }, 2)).toBe('2 Einträge');
    expect(formatNumber(1234)).toBe('1.234');
    overrides.value = { grouping: { rowLabel: 'Count {count}' } };
    expect(t('grouping.rowLabel', { count: 2 }, 2)).toBe('Count 2');
  });
});
