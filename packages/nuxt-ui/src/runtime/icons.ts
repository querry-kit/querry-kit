/** Default Iconify names used by the table controls. */
export const defaultTableIcons = {
  grouping: {
    trigger: 'i-tabler-list-tree',
    up: 'i-tabler-chevron-up',
    down: 'i-tabler-chevron-down',
    remove: 'i-tabler-x',
    clear: 'i-tabler-cancel',
    add: 'i-tabler-plus',
    expanded: 'i-tabler-chevron-down',
    collapsed: 'i-tabler-chevron-right',
    expandAll: 'i-tabler-fold-down',
    collapseAll: 'i-tabler-fold-up',
  },
  search: { input: 'i-tabler-search' },
  sorting: {
    trigger: 'i-tabler-arrows-sort',
    header: 'i-tabler-arrows-sort',
    clear: 'i-tabler-cancel',
    add: 'i-tabler-plus',
    ascending: 'i-tabler-sort-ascending',
    descending: 'i-tabler-sort-descending',
    columnAscending: 'i-tabler-arrow-up',
    columnDescending: 'i-tabler-arrow-down',
    remove: 'i-tabler-x',
  },
  filtering: {
    trigger: 'i-tabler-filter',
    header: 'i-tabler-filter-2',
    intersect: 'i-tabler-layers-intersect-2',
    union: 'i-tabler-layers-union',
    clear: 'i-tabler-cancel',
    add: 'i-tabler-plus',
    remove: 'i-tabler-x',
  },
  options: {
    trigger: 'i-tabler-adjustments',
    header: 'i-tabler-adjustments',
    reset: 'i-tabler-restore',
    pin: 'i-tabler-pin',
    unpin: 'i-tabler-pin-off',
    drag: 'i-tabler-grip-vertical',
    visible: 'i-tabler-eye',
    hidden: 'i-tabler-eye-off',
  },
} as const;

export type TableIcons = typeof defaultTableIcons;

export type TableIconKey =
  | 'grouping.trigger'
  | 'grouping.up'
  | 'grouping.down'
  | 'grouping.remove'
  | 'grouping.clear'
  | 'grouping.add'
  | 'grouping.expanded'
  | 'grouping.collapsed'
  | 'grouping.expandAll'
  | 'grouping.collapseAll'
  | 'search.input'
  | 'sorting.trigger'
  | 'sorting.header'
  | 'sorting.clear'
  | 'sorting.add'
  | 'sorting.ascending'
  | 'sorting.descending'
  | 'sorting.columnAscending'
  | 'sorting.columnDescending'
  | 'sorting.remove'
  | 'filtering.trigger'
  | 'filtering.header'
  | 'filtering.intersect'
  | 'filtering.union'
  | 'filtering.clear'
  | 'filtering.add'
  | 'filtering.remove'
  | 'options.trigger'
  | 'options.header'
  | 'options.reset'
  | 'options.pin'
  | 'options.unpin'
  | 'options.drag'
  | 'options.visible'
  | 'options.hidden';

type DeepIconOverrides<Value> = {
  [Key in keyof Value]?: Value[Key] extends string ? string : DeepIconOverrides<Value[Key]>;
};

/** Nested Iconify-name overrides accepted by the table controls. */
export type TableIconOverrides = DeepIconOverrides<TableIcons>;
