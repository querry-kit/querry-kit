/** Query Kit-compatible filtering popover. */
export { default as QTableFiltering } from './components/table/filtering/index.vue';
/** Searchable multi-select with application-provided option requests. */
export { default as QTableFilterLookup } from './components/table/filtering/lookup.vue';
/** Column visibility, pinning and ordering popover. */
export { default as QTableOptions } from './components/table/options/index.vue';
/** Page-size selector and page navigation footer. */
export { default as QTablePagination } from './components/table/pagination/index.vue';
/** Ordered sorting popover. */
export { default as QTableSorting } from './components/table/sorting/index.vue';
/** Composite search, breadcrumb and table-controls toolbar. */
export { default as QTableToolbar } from './components/table/toolbar/index.vue';
export type { TableIconKey, TableIconOverrides, TableIcons } from './icons';
export type { TableTextKey, TableTextOverrides, TableTexts } from './texts';
export * from './types/table';

/** Server-backed grouping UI building block. */
export { default as QTableGrouping } from './components/table/grouping/index.vue';

/** Server-backed grouping UI building block. */
export { default as QTableGroup } from './components/table/group/index.vue';

/** Server-backed grouping UI building block. */
export { default as QTableGroupLoadMore } from './components/table/group/load-more.vue';

/** Server-backed flat and grouped table renderer. */
export { default as QTableGrouped } from './components/table/grouped/index.vue';
