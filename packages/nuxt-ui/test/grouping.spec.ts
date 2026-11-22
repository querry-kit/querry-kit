import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import QTableGroup from '../src/runtime/components/table/group/index.vue';
import QTableGroupLoadMore from '../src/runtime/components/table/group/load-more.vue';
import QTableGrouping from '../src/runtime/components/table/grouping/index.vue';
import QTableToolbar from '../src/runtime/components/table/toolbar/index.vue';

const stubs = {
  UButton: {
    props: ['label', 'disabled', 'loading', 'icon'],
    template: '<button :disabled="disabled" v-bind="$attrs">{{ label }}<slot /></button>',
  },
  UPopover: {
    name: 'UPopover',
    props: ['open'],
    emits: ['update:open'],
    template: '<div><slot/><slot name="content"/></div>',
  },
  USeparator: true,
  USelect: { name: 'USelect', props: ['modelValue', 'items'], emits: ['update:modelValue'], template: '<select />' },
  UDashboardToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' },
  UIcon: true,
  VueDraggable: { name: 'VueDraggable', template: '<ol><slot /></ol>' },
  QTableGrouping: true,
};

describe('server-backed grouping controls', () => {
  it('adds, removes and reorders permitted fields with keyboard-accessible buttons', async () => {
    const wrapper = mount(QTableGrouping, {
      props: {
        grouping: [],
        fields: [
          { value: 'status', label: 'Status' },
          { value: 'category', label: 'Category' },
          { value: 'private', label: 'Private', disabled: true },
        ],
      },
      global: { stubs },
    });
    expect(wrapper.findComponent({ name: 'USelect' }).props('items')).toHaveLength(2);
    await wrapper.findComponent({ name: 'USelect' }).vm.$emit('update:modelValue', 'status');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([['status']]);
    await wrapper.setProps({ grouping: ['status', 'category'] });
    expect(wrapper.get('[aria-label="Add grouping"]').attributes('disabled')).toBeDefined();
    expect(wrapper.findAll('.drag-handle')).toHaveLength(2);
    await wrapper.get('[aria-label="Reorder Status"]').trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([['category', 'status']]);
    await wrapper.get('[aria-label="Reorder Status"]').trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([['status', 'category']]);
    await wrapper.get('[aria-label="Reorder Status"]').trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('update:grouping')).toHaveLength(3);
    await wrapper.find('[aria-label="Remove grouping"]').trigger('click');
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([['category']]);
    const clear = wrapper.get('[aria-label="Clear grouping"]');
    expect(clear.element.parentElement?.querySelector('h3')?.textContent).toContain('Group by');
    await clear.trigger('click');
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([[]]);
    await wrapper.setProps({ grouping: ['unknown'], fields: [{ value: 'status', label: 'Status' }] });
    expect(wrapper.find('.drag-handle').exists()).toBe(false);
    expect(wrapper.text()).toContain('unknown');
    await wrapper.findComponent({ name: 'USelect' }).vm.$emit('update:modelValue', 'invalid');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([[]]);
    await wrapper.setProps({ grouping: ['status', 'category'] });
    await wrapper.findComponent({ name: 'VueDraggable' }).vm.$emit('update:modelValue', ['category', 'status']);
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([['category', 'status']]);
    wrapper.unmount();
  });

  it('exposes grouping actions to custom trigger, items, and field picker', async () => {
    const wrapper = mount(QTableGrouping, {
      props: {
        grouping: ['status'],
        fields: [
          { value: 'status', label: 'Status' },
          { value: 'priority', label: 'Priority' },
        ],
      },
      slots: {
        trigger: ({ open, setOpen }) => h('button', { onClick: () => setOpen(!open), 'aria-expanded': open }, 'Groups'),
        items: ({ grouping, setGrouping }) => h('button', { onClick: () => setGrouping([]) }, grouping.join(',')),
        add: ({ add }) =>
          h(
            'button',
            {
              onClick: () => {
                add('status');
                add('priority');
              },
            },
            'Add priority',
          ),
      },
      global: { stubs },
    });
    const [trigger, items, add] = wrapper.findAll('button').filter((button) => button.text());
    await trigger!.trigger('click');
    expect(trigger!.attributes('aria-expanded')).toBe('true');
    wrapper.getComponent({ name: 'UPopover' }).vm.$emit('update:open', false);
    await wrapper.vm.$nextTick();
    expect(trigger!.attributes('aria-expanded')).toBe('false');
    await add!.trigger('click');
    expect(wrapper.emitted('update:grouping')).toEqual([[['status', 'priority']]]);
    await items!.trigger('click');
    expect(wrapper.emitted('update:grouping')?.at(-1)).toEqual([[]]);
    wrapper.unmount();
  });

  it('renders counts, controlled expansion, loading, errors and slots', async () => {
    const wrapper = mount(QTableGroup, {
      props: { label: 'Open', count: 42, expanded: false },
      slots: { default: 'Leaf rows' },
      global: { stubs },
    });
    expect(wrapper.text()).toContain('42 items');
    expect(wrapper.text()).not.toContain('Leaf rows');
    await wrapper.find('[aria-expanded="false"]').trigger('click');
    expect(wrapper.emitted('toggle')).toHaveLength(1);
    await wrapper.setProps({ expanded: true, loading: true, error: new Error('failed') });
    expect(wrapper.find('[role="status"]').text()).toContain('Loading');
    expect(wrapper.find('[role="alert"]').text()).toContain('Unable');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Retry')!
      .trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
    expect(wrapper.text()).toContain('Leaf rows');
    wrapper.unmount();
    const localized = mount(QTableGroup, {
      props: { label: 'Offen', count: 2, expanded: true, texts: { grouping: { count: '{count} Einträge' } } },
      slots: { header: 'Custom group' },
      global: { stubs },
    });
    expect(localized.text()).toContain('Custom group');
    localized.unmount();
  });

  it('disables continuation while loading and switches to retry for failures', async () => {
    const wrapper = mount(QTableGroupLoadMore, {
      props: { hasMore: true, loading: true, texts: { grouping: { retry: 'Erneut versuchen' } } },
      global: { stubs },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    await wrapper.setProps({ loading: false });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('load')).toHaveLength(1);
    await wrapper.setProps({
      hasMore: false,
      error: new Error('failed'),
      texts: { grouping: { retry: 'Erneut versuchen' } },
    });
    expect(wrapper.text()).toBe('Erneut versuchen');
    await wrapper.setProps({ error: undefined });
    expect(wrapper.find('button').exists()).toBe(false);
    wrapper.unmount();
  });

  it('integrates grouping into the existing toolbar', async () => {
    const wrapper = mount(QTableToolbar, {
      props: { groupableFields: [{ value: 'status', label: 'Status' }], grouping: [] },
      global: { stubs },
    });
    expect(wrapper.findComponent({ name: 'QTableGrouping' }).exists()).toBe(true);
    await wrapper.findComponent({ name: 'QTableGrouping' }).vm.$emit('update:grouping', ['status']);
    expect(wrapper.emitted('update:grouping')).toEqual([[['status']]]);
    await wrapper.setProps({ groupableFields: [] });
    expect(wrapper.findComponent({ name: 'QTableGrouping' }).exists()).toBe(false);
    wrapper.unmount();
  });
});
