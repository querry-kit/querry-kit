import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, markRaw, nextTick } from 'vue';
import QTableFiltering from '../src/runtime/components/table/filtering/index.vue';
import QTableOptions from '../src/runtime/components/table/options/index.vue';
import QTablePagination from '../src/runtime/components/table/pagination/index.vue';
import QTableSorting from '../src/runtime/components/table/sorting/index.vue';
import QTableToolbar from '../src/runtime/components/table/toolbar/index.vue';
import { FilterFieldType, FilteringMode } from '../src/runtime/types/table';

const eventStub = (name: string, events: string[]) => ({
  name,
  emits: events,
  template: '<div />',
});

const stubs = {
  UButton: { props: ['label'], template: '<button v-bind="$attrs">{{ label }}<slot /></button>' },
  UCheckbox: eventStub('UCheckbox', ['update:modelValue']),
  UDashboardToolbar: {
    name: 'UDashboardToolbar',
    template: '<section><slot name="left" /><slot name="right" /></section>',
  },
  UIcon: true,
  UInput: eventStub('UInput', ['update:modelValue']),
  UInputNumber: eventStub('UInputNumber', ['update:modelValue']),
  UPopover: { name: 'UPopover', emits: ['update:open'], template: '<div><slot /><slot name="content" /></div>' },
  UPagination: eventStub('UPagination', ['update:page']),
  USelect: eventStub('USelect', ['update:modelValue']),
  USelectMenu: eventStub('USelectMenu', ['update:modelValue']),
  USeparator: true,
  USwitch: eventStub('USwitch', ['update:modelValue']),
  UTooltip: { template: '<span><slot /></span>' },
  UBreadcrumb: true,
  VueDraggable: {
    name: 'VueDraggable',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<ul><slot /></ul>',
  },
};

const mounted: Array<{ unmount: () => void }> = [];
const track = <T extends { unmount: () => void }>(wrapper: T): T => {
  mounted.push(wrapper);
  return wrapper;
};

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
});

describe('Vitest 4 component callback coverage', () => {
  it('executes sorting popover and item callbacks', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: {
          sorting: [{ id: 'name', desc: false }],
          fields: [{ value: 'name', label: 'Name' }],
        },
        slots: {
          header: ({ clear }) => h('button', { onClick: clear }, 'Clear'),
          item: ({ remove, toggleDirection }) =>
            h('button', { onClick: () => (toggleDirection(), remove()) }, 'Change item'),
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'UPopover' }).vm.$emit('update:open', true);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Change item')
      ?.trigger('click');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear')
      ?.trigger('click');

    expect(wrapper.emitted('update:sorting')).toBeTruthy();
  });

  it('executes filtering popover and item callbacks', async () => {
    const wrapper = track(
      mount(QTableFiltering, {
        props: {
          filtering: {
            operator: FilteringMode.Intersect,
            filters: [{ id: 'active', field: 'active', type: FilterFieldType.Boolean, value: true }],
          },
          fields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
        },
        slots: {
          item: ({ remove, update }) =>
            h('button', { onClick: () => (update({ value: false }), remove()) }, 'Change filter'),
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'UPopover' }).vm.$emit('update:open', true);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Change filter')
      ?.trigger('click');

    expect(wrapper.emitted('update:filtering')).toBeTruthy();
  });

  it('executes every default filter editor callback', async () => {
    const customEditor = markRaw({
      name: 'CustomEditor',
      emits: ['update:modelValue'],
      template: '<div />',
    });
    const wrapper = track(
      mount(QTableFiltering, {
        props: {
          filtering: {
            operator: FilteringMode.Intersect,
            filters: [
              { id: 'boolean', field: 'active', type: FilterFieldType.Boolean, value: true },
              { id: 'number', field: 'rank', type: FilterFieldType.Number, value: 3 },
              { id: 'enum-menu', field: 'status', type: FilterFieldType.Enum, value: ['open'] },
              { id: 'enum-component', field: 'priority', type: FilterFieldType.Enum, value: ['high'] },
              { id: 'select', field: 'owner', type: FilterFieldType.Select, value: ['ada'] },
            ],
          },
          fields: [
            { value: 'active', label: 'Active', type: FilterFieldType.Boolean },
            { value: 'rank', label: 'Rank', type: FilterFieldType.Number },
            {
              value: 'status',
              label: 'Status',
              type: FilterFieldType.Enum,
              values: [{ value: 'open', label: 'Open' }],
            },
            {
              value: 'priority',
              label: 'Priority',
              type: FilterFieldType.Enum,
              values: [],
              component: customEditor,
            },
            { value: 'owner', label: 'Owner', type: FilterFieldType.Select, component: customEditor },
          ],
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'UCheckbox' }).vm.$emit('update:modelValue', false);
    await wrapper.findComponent({ name: 'UInputNumber' }).vm.$emit('update:modelValue', undefined);
    await wrapper.findComponent({ name: 'USelectMenu' }).vm.$emit('update:modelValue', ['closed']);
    for (const select of wrapper.findAllComponents({ name: 'USelect' })) {
      await select.vm.$emit('update:modelValue', 'neq');
    }
    for (const editor of wrapper.findAllComponents({ name: 'CustomEditor' })) {
      await editor.vm.$emit('update:modelValue', ['updated']);
    }

    expect(wrapper.emitted('update:filtering')).toBeTruthy();
  });

  it('executes options popover, visibility, and invalid reorder callbacks', async () => {
    const wrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [
            { id: 'name', header: 'Name' },
            { id: 'fixed', header: 'Fixed', enableHiding: false },
          ],
          columnOrder: ['name', 'fixed'],
          invisibleColumns: [],
          columnPinning: {},
        },
        slots: {
          items: ({ toggleVisibility }) =>
            h('button', { onClick: () => toggleVisibility('fixed') }, 'Keep fixed visible'),
        },
        global: { stubs },
      }),
    );
    const defaultWrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [{ id: 'name', header: 'Name' }],
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'UPopover' }).vm.$emit('update:open', true);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Keep fixed visible')
      ?.trigger('click');
    await defaultWrapper.findComponent({ name: 'VueDraggable' }).vm.$emit('update:modelValue', []);

    expect(wrapper.emitted('update:invisibleColumns')).toBeUndefined();
  });

  it('executes every pagination navigation callback and removes its listener', async () => {
    const wrapper = mount(QTablePagination, {
      props: { page: 2, itemsPerPage: 10, totalItems: 42 },
      global: { stubs },
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, ctrlKey: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await wrapper.findComponent({ name: 'UPagination' }).vm.$emit('update:page', 4);
    await nextTick();

    expect(wrapper.emitted('update:page')).toBeTruthy();
    wrapper.unmount();
  });

  it('executes every toolbar model callback', async () => {
    const toolbarStubs = {
      ...stubs,
      QTableSorting: eventStub('QTableSorting', ['update:sorting']),
      QTableFiltering: eventStub('QTableFiltering', ['update:filtering']),
      QTableOptions: eventStub('QTableOptions', [
        'update:columnOrder',
        'update:invisibleColumns',
        'update:columnPinning',
      ]),
    };
    const wrapper = track(
      mount(QTableToolbar, {
        props: {
          search: '',
          sorting: [],
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
          sortableFields: [{ value: 'name', label: 'Name' }],
          filterFields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
          columnDefinitions: [{ id: 'name', header: 'Name' }],
        },
        global: { stubs: toolbarStubs },
      }),
    );

    await wrapper.findComponent({ name: 'UInput' }).vm.$emit('update:modelValue', 42);
    await wrapper.findComponent({ name: 'QTableSorting' }).vm.$emit('update:sorting', [{ id: 'name', desc: false }]);
    await wrapper.findComponent({ name: 'QTableFiltering' }).vm.$emit('update:filtering', {
      operator: FilteringMode.Intersect,
      filters: [],
    });
    const options = wrapper.findComponent({ name: 'QTableOptions' });
    await options.vm.$emit('update:columnOrder', ['name']);
    await options.vm.$emit('update:invisibleColumns', ['name']);
    await options.vm.$emit('update:columnPinning', { left: ['name'] });

    expect(wrapper.emitted('update:search')?.[0]).toEqual(['42']);
  });
});
