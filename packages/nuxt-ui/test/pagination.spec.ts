import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import QTablePagination from '../src/runtime/components/table/pagination/index.vue';

/** Mounts a footer with stubbed Nuxt UI controls. */
const mountPagination = (props: Partial<InstanceType<typeof QTablePagination>['$props']> = {}) =>
  mount(QTablePagination, {
    props: { page: 2, itemsPerPage: 10, totalItems: 42, ...props },
    global: { stubs: { USelect: true, UPagination: true, UButton: true } },
  });

describe('QTablePagination', () => {
  it('renders its standalone result summary without a CRM layout dependency', () => {
    const wrapper = mountPagination();
    expect(wrapper.text()).toContain('Showing 11–20 of 42');
  });

  it('accepts an explicit text override without requiring i18n', () => {
    const wrapper = mountPagination({ texts: { pagination: { summary: 'Rows {start}–{end} / {total}' } } });

    expect(wrapper.text()).toContain('Rows 11–20 / 42');
  });

  it('moves between pages with the documented keyboard shortcuts', async () => {
    const wrapper = mountPagination();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, ctrlKey: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:page')?.[1]).toEqual([1]);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true }));
  });

  it('keeps the page within the new page count when its page size changes', async () => {
    const wrapper = mountPagination({ page: 5 });
    const select = wrapper.findComponent({ name: 'USelect' });
    await select.vm.$emit('update:modelValue', 25);
    expect(wrapper.emitted('update:itemsPerPage')?.[0]).toEqual([25]);
    expect(wrapper.emitted('update:page')?.[0]).toEqual([2]);
  });

  it('offers the mode selector only when supplied and disables numbered controls and shortcuts inside the grouped footer', async () => {
    const classic = mountPagination();
    expect(classic.findAllComponents({ name: 'USelect' })).toHaveLength(1);
    classic.unmount();

    const wrapper = mountPagination({ loadingMode: 'pagination', grouped: true });
    expect(wrapper.findComponent({ name: 'UPagination' }).exists()).toBe(false);
    const selector = wrapper.findAllComponents({ name: 'USelect' })[1]!;
    expect(selector.attributes('aria-label')).toBe('Row loading mode');
    await selector.vm.$emit('update:modelValue', 'infinite');
    expect(wrapper.emitted('update:loadingMode')).toEqual([['infinite']]);
    await wrapper.setProps({ loadingMode: 'infinite', hasMore: true });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    expect(wrapper.emitted('update:page')).toBeUndefined();
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'UButton' }).exists()).toBe(false);
    wrapper.unmount();
  });

  it('reobserves after a batch and pauses automatic loading on errors, in flight, and at exhaustion', async () => {
    const observers: Array<{ deliver: (intersecting: boolean) => void; disconnect: ReturnType<typeof vi.fn> }> = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();

        /**
         * Captures an observer so the test controls when its sentinel intersects.
         * @param {IntersectionObserverCallback} callback Observer delivery callback.
         */
        constructor(callback: IntersectionObserverCallback) {
          observers.push({
            deliver: (isIntersecting) =>
              callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver),
            disconnect: this.disconnect,
          });
        }
      },
    );
    const wrapper = mountPagination({ loadingMode: 'infinite', hasMore: true, loadedItems: 10 });
    try {
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('Loaded 10 of 42');
      const selector = wrapper.findAllComponents({ name: 'USelect' })[1]!;
      await selector.vm.$emit('update:open', true);
      observers[0]!.deliver(true);
      expect(wrapper.emitted('load-more')).toBeUndefined();
      await selector.vm.$emit('update:open', false);
      expect(observers).toHaveLength(2);
      observers.shift();
      observers[0]!.deliver(false);
      expect(wrapper.emitted('load-more')).toBeUndefined();
      observers[0]!.deliver(true);
      observers[0]!.deliver(true);
      expect(wrapper.emitted('load-more')).toHaveLength(1);
      await wrapper.setProps({ loading: true });
      expect(wrapper.get('[role="status"]').text()).toBe('Loading rows…');
      await wrapper.setProps({ loading: false, loadedItems: 20 });
      expect(observers).toHaveLength(2);
      observers[1]!.deliver(true);
      expect(wrapper.emitted('load-more')).toHaveLength(2);
      await wrapper.setProps({ error: new Error('offline'), hasMore: false });
      expect(observers).toHaveLength(2);
      expect(wrapper.get('[role="alert"]').text()).toBe('Unable to load rows.');
      const retry = wrapper.getComponent({ name: 'UButton' });
      expect(retry.attributes('label')).toBe('Retry');
      await retry.vm.$emit('click');
      expect(wrapper.emitted('load-more')).toHaveLength(3);
      await wrapper.setProps({ error: undefined, hasMore: false });
      expect(wrapper.findComponent({ name: 'UButton' }).exists()).toBe(false);
      expect(observers).toHaveLength(2);
    } finally {
      wrapper.unmount();
      vi.unstubAllGlobals();
    }
  });
});
