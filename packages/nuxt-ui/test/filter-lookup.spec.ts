import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import QTableFilterLookup from '../src/runtime/components/table/filtering/lookup.vue';
import type { FilterChoice } from '../src/runtime/types/table';

const stubs = {
  USelectMenu: {
    name: 'USelectMenu',
    props: {
      items: Array,
      loading: Boolean,
      modelValue: Array,
      placeholder: String,
      multiple: Boolean,
      ignoreFilter: Boolean,
      searchTerm: String,
    },
    emits: ['update:modelValue', 'update:searchTerm'],
    template: `<div>
      <slot :open="true" />
      <slot v-if="items?.length" name="item" :item="items[0]" :index="0" />
      <slot v-else name="empty" :search-term="searchTerm" />
    </div>`,
  },
};

describe('QTableFilterLookup', () => {
  afterEach(() => vi.useRealTimers());

  it('hydrates selected values separately, dedupes options, and enforces the consumer limit', async () => {
    const alpha = { value: 1, label: 'Alpha' };
    const beta = { value: 2, label: 'Beta' };
    const initial = Promise.withResolvers<FilterChoice[]>();
    const source = {
      resolve: vi.fn(async () => [alpha]),
      search: vi.fn(() => initial.promise),
    };
    const wrapper = mount(QTableFilterLookup, {
      props: { modelValue: [1], source, maxSelections: 1 },
      attrs: { 'aria-label': 'Project' },
      global: { stubs },
    });
    const menu = wrapper.getComponent({ name: 'USelectMenu' });
    await nextTick();
    expect(menu.props('loading')).toBe(true);
    initial.resolve([alpha, beta]);
    await flushPromises();
    expect(menu.props('loading')).toBe(false);
    expect(source.resolve).toHaveBeenCalledWith([1]);
    expect(source.search).toHaveBeenCalledWith('');
    expect(menu.props('multiple')).toBe(true);
    expect(menu.props('ignoreFilter')).toBe(true);
    expect(menu.attributes('aria-label')).toBe('Project');
    expect(menu.props('items')).toEqual([
      { ...alpha, disabled: false },
      { ...beta, disabled: true },
    ]);
    menu.vm.$emit('update:modelValue', [1, 2]);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    menu.vm.$emit('update:modelValue', []);
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]]);
    await wrapper.setProps({ modelValue: [] });
    await flushPromises();
    expect(source.resolve).toHaveBeenCalledTimes(1);
    expect(menu.props('items')).toEqual([
      { ...alpha, disabled: false },
      { ...beta, disabled: false },
    ]);
    wrapper.unmount();
  });

  it('debounces search, ignores stale results, and recovers after a lookup error', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const old = Promise.withResolvers<FilterChoice[]>();
    const source = {
      resolve: vi.fn(async () => [{ value: 'x', label: 'Selected' }]),
      search: vi.fn(async (term: string) => {
        if (term === 'old') return old.promise;
        if (term === 'error') throw new Error('Lookup failed');
        return [{ value: term || 'first', label: term || 'First' }];
      }),
    };
    const wrapper = mount(QTableFilterLookup, {
      props: { modelValue: ['x'], source, texts: { filtering: { lookupError: 'Search unavailable' } } },
      global: { stubs },
    });
    const menu = wrapper.getComponent({ name: 'USelectMenu' });
    await flushPromises();
    menu.vm.$emit('update:searchTerm', 'old');
    await vi.advanceTimersByTimeAsync(249);
    expect(source.search).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(source.search).toHaveBeenLastCalledWith('old');

    menu.vm.$emit('update:searchTerm', 'error');
    await vi.advanceTimersByTimeAsync(250);
    expect(wrapper.get('[role="status"]').text()).toBe('Search unavailable');
    old.resolve([{ value: 'old', label: 'Stale' }]);
    await flushPromises();
    expect(menu.props('items')).toEqual([{ value: 'x', label: 'Selected', disabled: false }]);

    menu.vm.$emit('update:searchTerm', 'fresh');
    await vi.advanceTimersByTimeAsync(250);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(source.resolve).toHaveBeenCalledTimes(1);
    expect(menu.props('items')).toEqual([
      { value: 'x', label: 'Selected', disabled: false },
      { value: 'fresh', label: 'fresh', disabled: false },
    ]);
    wrapper.unmount();
  });

  it('renders custom selection, option, empty, and retry slots', async () => {
    const search = vi
      .fn<() => Promise<FilterChoice[]>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'it', label: 'Italy' }]);
    const wrapper = mount(QTableFilterLookup, {
      props: { modelValue: [], source: { search, resolve: async () => [] } },
      slots: {
        selection: ({ open }) => h('span', open ? 'Open countries' : 'Countries'),
        option: ({ item }) => h('span', `Country ${item.label}`),
        empty: () => h('span', 'Empty countries'),
        error: ({ retry, searchError }) =>
          h('button', { onClick: retry }, searchError ? 'Retry search' : 'Retry selection'),
      },
      global: { stubs },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Empty countries');
    expect(wrapper.text()).toContain('Open countries');
    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Country Italy');
    expect(wrapper.text()).not.toContain('Retry search');
    wrapper.unmount();
  });
});
