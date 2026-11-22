import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, markRaw, nextTick } from 'vue';
import QTableFiltering from '../src/runtime/components/table/filtering/index.vue';
import QTableGrouping from '../src/runtime/components/table/grouping/index.vue';
import QTableOptions from '../src/runtime/components/table/options/index.vue';
import QTableSorting from '../src/runtime/components/table/sorting/index.vue';
import QTableToolbar from '../src/runtime/components/table/toolbar/index.vue';
import { FilterFieldType, FilteringMode, type TableIconOverrides } from '../src/runtime/types/table';

const stubs = {
  UButton: { props: ['label'], template: '<button v-bind="$attrs">{{ label }}<slot /></button>' },
  UCheckbox: { template: '<input type="checkbox" v-bind="$attrs" />' },
  UDashboardToolbar: {
    name: 'UDashboardToolbar',
    template: '<section><div><slot name="left" /></div><div><slot name="right" /></div></section>',
  },
  UIcon: true,
  UInput: true,
  UKbd: { props: ['value'], template: '<kbd>{{ value }}</kbd>' },
  UInputNumber: true,
  UModal: {
    name: 'UModal',
    props: ['title', 'open', 'ui'],
    emits: ['update:open'],
    template: `<div>
      <div @click="$emit('update:open', true)"><slot /></div>
      <div v-if="open" role="dialog" :aria-label="title">
        <header><slot name="actions" /></header>
        <main><slot name="body" /></main>
        <footer><slot name="footer" :close="() => $emit('update:open', false)" /></footer>
      </div>
    </div>`,
  },
  UPopover: { name: 'UPopover', props: ['ui', 'content'], template: '<div><slot /><slot name="content" /></div>' },
  USelect: true,
  USelectMenu: true,
  USeparator: true,
  USwitch: true,
  UTooltip: { template: '<span><slot /></span>' },
  UBreadcrumb: true,
  VueDraggable: {
    name: 'VueDraggable',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<ul><slot /></ul>',
  },
  QTableSorting: true,
  QTableFiltering: true,
  QTableOptions: true,
};

const mounted: Array<{ unmount: () => void }> = [];
const track = <T extends { unmount: () => void }>(wrapper: T): T => {
  mounted.push(wrapper);
  return wrapper;
};

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
});

describe('table controls', () => {
  it('shows a separate selection toolbar only while records are selected', async () => {
    const wrapper = track(
      mount(QTableToolbar, {
        slots: {
          new: () => h('button', 'Create'),
          'bulk-actions': ({ selectedCount }) => h('button', `Export ${selectedCount}`),
        },
        global: { stubs },
      }),
    );
    const selector = '[role="toolbar"][aria-label="Selection"]';
    expect(wrapper.find(selector).exists()).toBe(false);
    await wrapper.setProps({ selectedCount: 246 });
    expect(wrapper.get(selector).get('[role="status"]').text()).toBe('246 selected');
    expect(wrapper.get(selector).get('button').text()).toBe('Export 246');
    expect(wrapper.get(selector).text()).not.toContain('Create');
    await wrapper.setProps({ selectedCount: 1 });
    expect(wrapper.get(selector).get('button').text()).toBe('Export 1');
    await wrapper.setProps({ selectedCount: 0 });
    expect(wrapper.find(selector).exists()).toBe(false);
  });

  it('focuses search and activates only the intended create action by default', async () => {
    let clicks = 0;
    const wrapper = track(
      mount(QTableToolbar, {
        attachTo: document.body,
        props: { search: '' },
        slots: {
          new: () => h('button', { onClick: () => clicks++ }, 'Create'),
        },
        global: { stubs: { ...stubs, UInput: { template: '<div><input /><slot name="trailing" /></div>' } } },
      }),
    );
    const press = (key: string, target: EventTarget = document, extra: KeyboardEventInit = {}) =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key, shiftKey: true, bubbles: true, cancelable: true, ...extra }),
      );
    expect(press('N')).toBe(false);
    expect(clicks).toBe(1);
    expect(press('?', document, { ctrlKey: true })).toBe(true);
    expect(press('?')).toBe(false);
    const input = wrapper.get('input').element;
    expect(wrapper.findAll('kbd').map((key) => key.text())).toEqual(['Shift', '/']);
    expect(document.activeElement).toBe(input);
    await wrapper.get('input').trigger('keydown', { key: 'Escape' });
    expect(document.activeElement).toBe(input);
    expect(press('N', input)).toBe(true);
    input.blur();
    expect(press('/')).toBe(false);
    await wrapper.setProps({ shortcuts: false });
    expect(wrapper.find('kbd').exists()).toBe(false);
    expect(press('N')).toBe(true);
    expect(press('?')).toBe(true);
    expect(clicks).toBe(1);
  });

  it('does not guess among multiple actions or claim shortcuts for missing or disabled controls', () => {
    const wrapper = track(
      mount(QTableToolbar, {
        slots: { new: () => [h('button', 'Delete'), h('button', 'Create')] },
        global: { stubs },
      }),
    );
    const press = (key: string) =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey: true, cancelable: true }));
    expect(press('/')).toBe(true);
    expect(press('N')).toBe(true);
    const create = wrapper.findAll('button')[1]!.element;
    create.dataset.qkNew = '';
    create.disabled = true;
    expect(press('N')).toBe(true);
    create.disabled = false;
    let clicked = false;
    create.onclick = () => {
      clicked = true;
    };
    expect(press('N')).toBe(false);
    expect(clicked).toBe(true);
  });

  it('handles Shift+G on a standalone grouping control unless opted out', async () => {
    const wrapper = track(mount(QTableGrouping, { props: { grouping: [], fields: [] }, global: { stubs } }));
    const press = () =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'G', shiftKey: true, cancelable: true }));
    expect(press()).toBe(false);
    await wrapper.setProps({ shortcuts: false });
    expect(press()).toBe(true);
  });

  it('sets minimum widths on the toolbar control popovers', () => {
    const sorting = track(
      mount(QTableSorting, {
        props: { sorting: [], fields: [{ value: 'name', label: 'Name' }] },
        global: { stubs },
      }),
    );
    const filtering = track(
      mount(QTableFiltering, {
        props: {
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          fields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
        },
        global: { stubs },
      }),
    );
    const options = track(
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

    expect(sorting.findComponent({ name: 'UPopover' }).props('content')).toMatchObject({ 'aria-label': 'Sort' });
    expect(filtering.findComponent({ name: 'UPopover' }).props('content')).toMatchObject({ 'aria-label': 'Filter' });
    expect(options.findComponent({ name: 'UPopover' }).props('content')).toMatchObject({
      'aria-label': 'Table options',
    });
    expect(sorting.findComponent({ name: 'UPopover' }).props('ui')).toEqual({
      content: 'qk-table-sorting-popover',
    });
    expect(filtering.findComponent({ name: 'UPopover' }).props('ui')).toEqual({
      content: 'qk-table-filtering-popover',
    });
    expect(options.findComponent({ name: 'UPopover' }).props('ui')).toEqual({
      content: 'qk-table-options-popover',
    });
  });

  it('mounts sorting with its existing v-model contract and fields', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: {
          sorting: [{ id: 'name', desc: false }],
          fields: [
            { value: 'name', label: 'Name' },
            { value: 'createdAt', label: 'Created' },
          ],
        },
        slots: {
          add: ({ add }) => h('button', { onClick: () => add('createdAt') }, 'Add'),
          items: ({ move, remove, toggleDirection }) =>
            h(
              'button',
              {
                onClick: () => {
                  toggleDirection('name');
                  move(0, 0);
                  remove('missing');
                },
              },
              'Items',
            ),
        },
        global: { stubs },
      }),
    );
    expect(wrapper.text()).toContain('Sort');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', shiftKey: true }));
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').at(-1)?.trigger('click');
    await wrapper.findAll('button').at(-2)?.trigger('click');
    expect(wrapper.emitted('update:sorting')).toBeTruthy();
  });

  it('adds a selected sort through the default control', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: { sorting: [], fields: [{ value: 'name', label: 'Name' }] },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'USelect' }).vm.$emit('update:modelValue', 'name');
    await nextTick();
    await wrapper.get('button[aria-label="Add sort"]').trigger('click');

    expect(wrapper.emitted('update:sorting')?.[0]).toEqual([[{ id: 'name', desc: false }]]);
  });

  it('reorders sorting rules through the drag list', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: {
          sorting: [
            { id: 'name', desc: false },
            { id: 'createdAt', desc: true },
          ],
          fields: [
            { value: 'name', label: 'Name' },
            { value: 'createdAt', label: 'Created' },
          ],
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'VueDraggable' }).vm.$emit('update:modelValue', [
      { id: 'createdAt', desc: true },
      { id: 'name', desc: false },
    ]);

    expect(wrapper.emitted('update:sorting')?.at(-1)).toEqual([
      [
        { id: 'createdAt', desc: true },
        { id: 'name', desc: false },
      ],
    ]);
  });

  it('resolves nested sorting icons and keeps the flat trigger icon authoritative', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: {
          sorting: [{ id: 'name', desc: false }],
          fields: [
            { value: 'name', label: 'Name' },
            { value: 'createdAt', label: 'Created' },
          ],
          icon: 'flat-sort-trigger',
          icons: {
            sorting: {
              trigger: 'nested-sort-trigger',
              header: 'custom-sort-header',
              clear: 'custom-sort-clear',
              add: 'custom-sort-add',
              ascending: 'custom-sort-ascending',
              descending: 'custom-sort-descending',
              remove: 'custom-sort-remove',
            },
          },
        },
        global: { stubs },
      }),
    );

    expect(wrapper.html()).toContain('flat-sort-trigger');
    expect(wrapper.html()).not.toContain('nested-sort-trigger');
    expect(wrapper.html()).toContain('custom-sort-header');
    expect(wrapper.html()).toContain('custom-sort-clear');
    expect(wrapper.html()).toContain('custom-sort-add');
    expect(wrapper.html()).toContain('custom-sort-ascending');
    expect(wrapper.html()).toContain('custom-sort-remove');

    await wrapper.setProps({ sorting: [{ id: 'name', desc: true }] });
    expect(wrapper.html()).toContain('custom-sort-descending');
  });

  it('mounts filtering with Query Kit AND/OR state and field definitions', async () => {
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
          header: ({ clear, toggleMode }) =>
            h(
              'button',
              {
                onClick: () => {
                  toggleMode();
                  clear();
                },
              },
              'Header',
            ),
          add: ({ add }) => h('button', { onClick: () => add('active') }, 'Add'),
          items: ({ remove, update }) =>
            h(
              'button',
              {
                onClick: () => {
                  update('active', { value: false });
                  remove('active');
                },
              },
              'Items',
            ),
        },
        global: { stubs },
      }),
    );
    expect(wrapper.text()).toContain('Header');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', shiftKey: true }));
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').at(-1)?.trigger('click');
    await wrapper.findAll('button').at(-2)?.trigger('click');
    await wrapper.findAll('button').at(-3)?.trigger('click');
    expect(wrapper.emitted('update:filtering')).toBeTruthy();
  });

  it('adds a selected filter through the default control', async () => {
    const wrapper = track(
      mount(QTableFiltering, {
        props: {
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          fields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'USelect' }).vm.$emit('update:modelValue', 'active');
    await nextTick();
    await wrapper.get('button[aria-label="Add filter"]').trigger('click');

    expect(wrapper.emitted('update:filtering')?.[0]?.[0]).toMatchObject({
      filters: [{ field: 'active', type: FilterFieldType.Boolean, value: true }],
    });
  });

  it('resolves nested filtering icons, including both filter modes', async () => {
    const wrapper = track(
      mount(QTableFiltering, {
        props: {
          filtering: {
            operator: FilteringMode.Intersect,
            filters: [{ id: 'active', field: 'active', type: FilterFieldType.Boolean, value: true }],
          },
          fields: [
            { value: 'active', label: 'Active', type: FilterFieldType.Boolean },
            { value: 'rank', label: 'Rank', type: FilterFieldType.Number },
          ],
          icons: {
            filtering: {
              trigger: 'custom-filter-trigger',
              header: 'custom-filter-header',
              intersect: 'custom-filter-intersect',
              union: 'custom-filter-union',
              clear: 'custom-filter-clear',
              add: 'custom-filter-add',
              remove: 'custom-filter-remove',
            },
          },
        },
        global: { stubs },
      }),
    );

    expect(wrapper.html()).toContain('custom-filter-trigger');
    expect(wrapper.html()).toContain('custom-filter-header');
    expect(wrapper.html()).toContain('custom-filter-intersect');
    expect(wrapper.html()).toContain('custom-filter-clear');
    expect(wrapper.html()).toContain('custom-filter-add');
    expect(wrapper.html()).toContain('custom-filter-remove');

    await wrapper.setProps({ filtering: { operator: FilteringMode.Union, filters: [] } });
    expect(wrapper.html()).toContain('custom-filter-union');
  });

  it('renders each default filter editor variant with bounded value selects', () => {
    const customEditor = markRaw({ name: 'CustomEditor', template: '<button>Custom editor</button>' });
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

    expect(wrapper.text()).toContain('Custom editor');
    expect(wrapper.findComponent({ name: 'USelectMenu' }).classes()).toContain('qk-table-filtering-value');
    expect(wrapper.findAllComponents({ name: 'CustomEditor' })).toHaveLength(2);
    for (const editor of wrapper.findAllComponents({ name: 'CustomEditor' })) {
      expect(editor.classes()).toContain('qk-table-filtering-value');
    }
  });

  it('mounts options with order, visibility and pinning models', async () => {
    const wrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [{ id: 'name', header: 'Name' }],
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
        },
        slots: {
          items: ({ move, pin, toggleVisibility }) =>
            h(
              'button',
              {
                onClick: () => {
                  move(0, 0);
                  pin('name', 'left');
                  pin('name', 'right');
                  pin('name', 'center');
                  toggleVisibility('name');
                },
              },
              'Move',
            ),
          item: ({ column, pin, toggleVisibility }) =>
            h(
              'button',
              {
                onClick: () => {
                  pin('left');
                  toggleVisibility();
                },
              },
              column.header,
            ),
        },
        global: { stubs },
      }),
    );
    expect(wrapper.text()).toContain('Table options');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', shiftKey: true }));
    await wrapper.vm.$nextTick();
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Move')
      ?.trigger('click');
    await wrapper.setProps({ invisibleColumns: ['name'] });
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Move')
      ?.trigger('click');
    expect(wrapper.text()).toContain('Move');
  });

  it('uses default options controls for visibility, pinning, and reordering', async () => {
    const wrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [
            { id: 'name', header: 'Name' },
            { id: 'email', header: 'Email' },
            { id: 'fixed', header: 'Fixed', enableHiding: false },
          ],
          columnOrder: ['name', 'email', 'fixed'],
          invisibleColumns: [],
          columnPinning: {},
        },
        global: { stubs },
      }),
    );

    await wrapper.findComponent({ name: 'USwitch' }).vm.$emit('update:modelValue', false);
    await wrapper.findAllComponents({ name: 'USwitch' }).at(2)?.vm.$emit('update:modelValue', false);
    await wrapper.setProps({ invisibleColumns: ['name'] });
    await wrapper.findComponent({ name: 'USwitch' }).vm.$emit('update:modelValue', true);
    await wrapper.findComponent({ name: 'VueDraggable' }).vm.$emit('update:modelValue', [
      { type: 'placeholder', id: '__options-placeholder-left', side: 'left' },
      { type: 'item', id: 'email', header: 'Email' },
      { type: 'separator', id: '__options-separator-left' },
      { type: 'placeholder', id: '__options-placeholder-center', side: 'center' },
      { type: 'item', id: 'name', header: 'Name' },
      { type: 'item', id: 'fixed', header: 'Fixed', enableHiding: false },
      { type: 'separator', id: '__options-separator-right' },
      { type: 'placeholder', id: '__options-placeholder-right', side: 'right' },
    ]);
    await nextTick();

    expect(wrapper.emitted('update:invisibleColumns')).toBeTruthy();
    expect(wrapper.emitted('update:columnOrder')?.at(-1)).toEqual([['email', 'name', 'fixed']]);
    expect(wrapper.emitted('update:columnPinning')?.at(-1)).toEqual([{ left: ['email'], right: [] }]);

    await wrapper.setProps({
      columnOrder: ['email', 'name', 'fixed'],
      invisibleColumns: ['name'],
      columnPinning: { left: ['email'] },
    });
    const reset = wrapper.get('button[aria-label="Reset layout"]');
    expect(reset.text()).toBe('');
    expect(reset.attributes('color')).toBe('error');
    await reset.trigger('click');
    expect(wrapper.emitted('update:columnOrder')?.at(-1)).toEqual([['name', 'email', 'fixed']]);
    expect(wrapper.emitted('update:invisibleColumns')?.at(-1)).toEqual([[]]);
    expect(wrapper.emitted('update:columnPinning')?.at(-1)).toEqual([{}]);
    await wrapper.setProps({
      columnOrder: ['name', 'email', 'fixed'],
      invisibleColumns: [],
      columnPinning: { left: [] },
    });
    expect(wrapper.find('button[aria-label="Reset layout"]').exists()).toBe(false);
  });

  it('supports pinning and unpinning from a customized column item', async () => {
    const wrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [{ id: 'name', header: 'Name' }],
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
        },
        slots: {
          item: ({ pin, toggleVisibility }) =>
            h('div', [
              h('button', { onClick: () => pin('left') }, 'Pin left'),
              h('button', { onClick: () => pin('right') }, 'Pin right'),
              h('button', { onClick: () => pin('center') }, 'Unpin'),
              h('button', { onClick: toggleVisibility }, 'Toggle visibility'),
            ]),
        },
        global: { stubs },
      }),
    );

    for (const label of ['Pin left', 'Pin right', 'Unpin', 'Toggle visibility']) {
      await wrapper
        .findAll('button')
        .find((button) => button.text() === label)
        ?.trigger('click');
    }
    await wrapper.setProps({ invisibleColumns: ['name'], columnPinning: { left: ['name'] } });
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Toggle visibility')
      ?.trigger('click');
    await wrapper.setProps({ columnPinning: { left: ['name'], right: [] } });

    expect(wrapper.text()).toContain('Unpin');
    expect(wrapper.emitted('update:columnPinning')).toHaveLength(3);
    expect(wrapper.emitted('update:invisibleColumns')).toHaveLength(2);
  });

  it('resolves nested options icons', () => {
    const wrapper = track(
      mount(QTableOptions, {
        props: {
          columns: [
            { id: 'name', header: 'Name' },
            { id: 'email', header: 'Email' },
          ],
          columnOrder: ['name', 'email'],
          invisibleColumns: [],
          columnPinning: {},
          icons: {
            options: {
              trigger: 'custom-options-trigger',
              header: 'custom-options-header',
              pin: 'custom-options-pin',
              drag: 'custom-options-drag',
            },
          },
        },
        global: { stubs },
      }),
    );

    expect(wrapper.html()).toContain('custom-options-trigger');
    expect(wrapper.html()).toContain('custom-options-header');
    expect(wrapper.html()).toContain('custom-options-pin');
    expect(wrapper.html()).toContain('custom-options-drag');
  });

  it('passes all public toolbar models to consumer slots', () => {
    const wrapper = track(
      mount(QTableToolbar, {
        props: {
          search: 'Ada',
          sorting: [],
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
          sortableFields: [{ value: 'name', label: 'Name' }],
          filterFields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
          columnDefinitions: [{ id: 'name', header: 'Name' }],
          breadcrumbItems: [{ label: 'People' }],
        },
        slots: { new: '<span>Create</span>' },
        global: { stubs },
      }),
    );
    expect(wrapper.text()).toContain('Create');
    expect(wrapper.findAllComponents({ name: 'UDashboardToolbar' })).toHaveLength(1);
  });

  it('marks contextual filters active and clears them from the toolbar', async () => {
    const wrapper = track(
      mount(QTableToolbar, {
        props: {
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          filterFields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
          filterContextActive: true,
        },
        slots: { 'filter-context': '<span>Project picker</span>' },
        global: { components: { QTableFiltering }, stubs: { ...stubs, QTableFiltering: false } },
      }),
    );

    expect(wrapper.text()).toContain('Project picker');
    expect(wrapper.get('button[aria-label="Filter"]').attributes('color')).toBe('primary');
    await wrapper.get('button[aria-label="Clear filters"]').trigger('click');
    expect(wrapper.emitted('clear-filters')).toHaveLength(1);
    await wrapper.setProps({ filterContextActive: false });
    expect(wrapper.get('button[aria-label="Filter"]').attributes('color')).toBe('neutral');
    expect(wrapper.find('button[aria-label="Clear filters"]').exists()).toBe(false);
  });

  it('forwards custom filter rows while retaining the default editor for other fields', () => {
    const wrapper = track(
      mount(QTableToolbar, {
        props: {
          filtering: {
            operator: FilteringMode.Intersect,
            filters: [
              { id: 'project', field: 'project', type: FilterFieldType.Boolean, value: true },
              { id: 'active', field: 'active', type: FilterFieldType.Boolean, value: true },
            ],
          },
          filterFields: [
            { value: 'project', label: 'Project', type: FilterFieldType.Boolean },
            { value: 'active', label: 'Active', type: FilterFieldType.Boolean },
          ],
        },
        slots: {
          'filter-item': ({ filter }) => (filter.field === 'project' ? h('span', 'Project picker') : undefined),
        },
        global: { components: { QTableFiltering }, stubs: { ...stubs, QTableFiltering: false } },
      }),
    );

    expect(wrapper.text()).toContain('Project picker');
    expect(wrapper.text()).toContain('Active');
    expect(wrapper.findAll('button[aria-label="Remove filter"]')).toHaveLength(1);
  });

  it('rearranges the toolbar while independent control slots retain their models', async () => {
    const wrapper = track(
      mount(QTableToolbar, {
        props: {
          grouping: [],
          sorting: [],
          filtering: { operator: FilteringMode.Intersect, filters: [] },
          columnOrder: ['name'],
          invisibleColumns: [],
          columnPinning: {},
        },
        slots: {
          layout: ({ options, actions }) => h('nav', [h(actions), h(options)]),
          new: () => h('span', 'Create task'),
          grouping: ({ setGrouping }) => h('button', { onClick: () => setGrouping(['name']) }, 'Custom grouping'),
          sorting: ({ setSorting }) =>
            h('button', { onClick: () => setSorting([{ id: 'name', desc: true }]) }, 'Custom sorting'),
          filtering: ({ setFiltering }) =>
            h(
              'button',
              { onClick: () => setFiltering({ operator: FilteringMode.Union, filters: [] }) },
              'Custom filtering',
            ),
          'column-options': ({ setColumnOrder, setInvisibleColumns, setColumnPinning }) =>
            h(
              'button',
              {
                onClick: () => {
                  setColumnOrder(['active', 'name']);
                  setInvisibleColumns(['name']);
                  setColumnPinning({ left: ['active'] });
                },
              },
              'Custom columns',
            ),
        },
        global: { stubs },
      }),
    );
    expect(wrapper.get('nav').text()).toContain('Create taskCustom grouping');
    for (const button of wrapper.findAll('nav button')) await button.trigger('click');
    expect(wrapper.emitted('update:grouping')).toEqual([[['name']]]);
    expect(wrapper.emitted('update:sorting')).toEqual([[[{ id: 'name', desc: true }]]]);
    expect(wrapper.emitted('update:filtering')).toEqual([[{ operator: FilteringMode.Union, filters: [] }]]);
    expect(wrapper.emitted('update:columnOrder')).toEqual([[['active', 'name']]]);
    expect(wrapper.emitted('update:invisibleColumns')).toEqual([[['name']]]);
    expect(wrapper.emitted('update:columnPinning')).toEqual([[{ left: ['active'] }]]);
  });

  it('splits the toolbar and uses closable dialogs below the small breakpoint', async () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    })) as typeof window.matchMedia;

    try {
      const wrapper = track(
        mount(QTableToolbar, {
          props: {
            grouping: ['name'],
            groupableFields: [{ value: 'name', label: 'Name' }],
            texts: { toolbar: { close: 'Schließen' } },
            search: 'report',
            sorting: [],
            filtering: { operator: FilteringMode.Intersect, filters: [] },
            columnOrder: ['name'],
            invisibleColumns: [],
            columnPinning: {},
            sortableFields: [{ value: 'name', label: 'Name' }],
            filterFields: [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }],
            columnDefinitions: [{ id: 'name', header: 'Name' }],
          },
          slots: { new: '<span>Create</span>' },
          global: {
            components: { QTableGrouping, QTableSorting, QTableFiltering, QTableOptions },
            stubs: {
              ...stubs,
              UInput: { template: '<input />' },
              QTableSorting: false,
              QTableFiltering: false,
              QTableOptions: false,
            },
          },
        }),
      );
      await nextTick();
      await nextTick();

      expect(wrapper.findAllComponents({ name: 'UDashboardToolbar' })).toHaveLength(2);
      expect(wrapper.find('input[aria-label="Search"]').exists()).toBe(false);
      await wrapper.get('button[aria-label="Search"]').trigger('click');
      await wrapper.get('input[aria-label="Search"]').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('button[aria-label="Search"]').exists()).toBe(true);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true, cancelable: true }));
      await nextTick();
      await wrapper.get('input[aria-label="Search"]').trigger('blur');
      expect(wrapper.find('button[aria-label="Search"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Create');
      expect(wrapper.findAllComponents({ name: 'UPopover' })).toHaveLength(0);
      const modals = wrapper.findAllComponents({ name: 'UModal' });
      expect(modals.map((modal) => modal.props('title'))).toEqual(['Group by', 'Sort', 'Filter', 'Table options']);

      for (const title of ['Group by', 'Sort', 'Filter', 'Table options']) {
        await wrapper.get(`button[aria-label="${title}"]`).trigger('click');
        const dialog = wrapper.get(`[role="dialog"][aria-label="${title}"]`);
        expect(dialog.get('header').text()).toContain(title);
        expect(dialog.find('main').exists()).toBe(true);
        const close = dialog.get('footer button');
        expect(close.text()).toBe('Schließen');
        await close.trigger('click');
        expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
      }
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it('forwards nested icons to the default toolbar controls', () => {
    const icons = {
      search: { input: 'custom-search' },
      sorting: { trigger: 'custom-sorting' },
      filtering: { trigger: 'custom-filtering' },
      options: { trigger: 'custom-options' },
    } satisfies TableIconOverrides;
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
          icons,
        },
        global: {
          stubs: {
            ...stubs,
            QTableSorting: { name: 'QTableSorting', props: ['icons'], template: '<div />' },
            QTableFiltering: { name: 'QTableFiltering', props: ['icons'], template: '<div />' },
            QTableOptions: { name: 'QTableOptions', props: ['icons'], template: '<div />' },
          },
        },
      }),
    );

    expect(wrapper.html()).toContain('custom-search');
    expect(wrapper.findComponent({ name: 'QTableSorting' }).props('icons')).toEqual(icons);
    expect(wrapper.findComponent({ name: 'QTableFiltering' }).props('icons')).toEqual(icons);
    expect(wrapper.findComponent({ name: 'QTableOptions' }).props('icons')).toEqual(icons);
  });

  it('does not open controls while a consumer is typing', async () => {
    const wrapper = track(
      mount(QTableSorting, {
        props: { sorting: [], fields: [{ value: 'name', label: 'Name' }] },
        global: { stubs },
      }),
    );
    const input = document.createElement('input');
    document.body.append(input);

    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 's', shiftKey: true }));
    await nextTick();

    expect(wrapper.text()).not.toContain('Clear sorting');
  });
});
