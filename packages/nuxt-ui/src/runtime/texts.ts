/** English fallback strings used when neither `texts` nor host-app i18n provides a value. */
export const defaultTableTexts = {
  grouping: {
    title: 'Group by',
    field: 'Select grouping field',
    noFields: 'No grouping fields available',
    add: 'Add grouping',
    remove: 'Remove grouping',
    clear: 'Clear grouping',
    reorder: 'Reorder {field}',
    moveUp: 'Move group up',
    moveDown: 'Move group down',
    count: '{formattedCount} items',
    rowLabel: '{label} {countLabel}',
    loading: 'Loading group…',
    itemsLoading: 'Loading items…',
    error: 'Unable to load group.',
    retry: 'Retry',
    loadMore: 'Load more',
    empty: 'No items',
    null: 'No value',
    noGroups: 'No matching groups',
    rootError: 'Could not load groups',
    itemsError: 'Could not load items',
    expandAll: 'Expand all groups',
    collapseAll: 'Collapse all groups',
  },
  search: { placeholder: 'Search' },
  toolbar: { close: 'Close', selection: 'Selection', selectedCount: '{count} selected' },
  sorting: {
    title: 'Sort',
    field: 'Select field',
    add: 'Add sort',
    clear: 'Clear sorting',
    remove: 'Remove sort',
    toggle: 'Toggle sort direction',
  },
  filtering: {
    title: 'Filter',
    field: 'Select field',
    add: 'Add filter',
    clear: 'Clear filters',
    remove: 'Remove filter',
    mode: 'Toggle filter mode',
    lookupPlaceholder: 'Select options',
    lookupError: 'Options could not be loaded.',
    operatorField: 'Operator for {field}',
    valueField: '{field}',
    operators: { in: '∈', notIn: '∉', equals: '=', not: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤' },
    operatorDescriptions: {
      in: 'Is one of',
      notIn: 'Is not one of',
      equals: 'Equals',
      not: 'Does not equal',
      gt: 'Greater than',
      gte: 'Greater than or equal to',
      lt: 'Less than',
      lte: 'Less than or equal to',
    },
  },
  options: {
    title: 'Table options',
    reset: 'Reset layout',
    pin: 'Pin column',
    left: 'Pin left',
    right: 'Pin right',
    center: 'Unpin',
    visibility: 'Toggle column visibility',
  },
  pagination: {
    pageSize: 'Items per page',
    summary: 'Showing {start}–{end} of {total}',
    mode: 'Row loading mode',
    paginated: 'Pagination',
    infinite: 'Infinite scroll',
    loaded: 'Loaded {count} of {total}',
    loadMore: 'Load more',
    loading: 'Loading rows…',
    error: 'Unable to load rows.',
    retry: 'Retry',
  },
} as const;

type TextPaths<T> = {
  [Key in keyof T & string]: T[Key] extends string ? Key : `${Key}.${TextPaths<T[Key]>}`;
}[keyof T & string];

/** Dot-delimited keys under the host application's querrykit.table namespace. */
export type TableTextKey = TextPaths<TableTexts>;

export type TableTexts = typeof defaultTableTexts;
type DeepTextOverrides<Value> = {
  [Key in keyof Value]?: Value[Key] extends string ? string : DeepTextOverrides<Value[Key]>;
};

/** Nested text overrides accepted by every public table component. */
export type TableTextOverrides = DeepTextOverrides<TableTexts>;
