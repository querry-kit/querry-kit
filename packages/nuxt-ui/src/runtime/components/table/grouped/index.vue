<template>
  <DefineBranchFooter v-slot="{ node, leaf }">
    <GroupedBranchControls :table="table" :node="node" :viewport="viewport" :leaf="leaf" :texts="texts">
      <slot name="branch" :node="node" />
      <template v-if="slots['branch-controls']" #controls="controls">
        <slot name="branch-controls" v-bind="controls" />
      </template>
      <template v-if="slots['branch-error']" #error="error">
        <slot name="branch-error" v-bind="error" />
      </template>
      <template v-if="slots.pagination" #pagination="pagination">
        <slot name="pagination" v-bind="pagination" />
      </template>
    </GroupedBranchControls>
  </DefineBranchFooter>

  <div class="flex min-h-0 min-w-0 flex-1 flex-col">
    <UDashboardToolbar v-if="root.error" class="min-w-0 py-3">
      <slot name="error" :error="root.error" :label="errorLabel" :retry="retry">
        <UAlert
          class="min-w-0"
          color="error"
          variant="soft"
          :title="errorLabel"
          :actions="[{ label: t('grouping.retry'), onClick: retry }]"
        />
      </slot>
    </UDashboardToolbar>
    <div
      ref="viewport"
      class="@container min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]"
      tabindex="0"
      role="region"
      :aria-label="label"
      @click="toggleGroupRow"
    >
      <UTable
        v-model:sorting="sorting"
        sticky
        :empty="emptyLabel"
        :data="rows"
        :columns="slots.leading ? [leadingColumn, ...displayColumns] : displayColumns"
        :column-pinning="displayPinning"
        :sorting-options="{ manualSorting: true }"
        :loading="root.loading"
        :get-row-id="getRowId"
        :meta="rowMeta"
        :style="grouping.length ? { '--q-grouped-table-width': `${groupedTableWidth}px` } : undefined"
        :ui="{
          root: 'overflow-visible',
          ...ui,
          base: [
            ui?.base,
            grouping.length
              ? [
                  'min-w-(--q-grouped-table-width) table-fixed overflow-visible',
                  flexibleColumn ? 'w-full' : 'w-(--q-grouped-table-width)',
                ].join(' ')
              : 'w-full overflow-visible',
          ]
            .filter(Boolean)
            .join(' '),
        }"
      >
        <template v-if="slots.loading" #loading>
          <slot
            name="loading"
            :grouped="Boolean(grouping.length)"
            :label="t(grouping.length ? 'grouping.loading' : 'grouping.itemsLoading')"
          />
        </template>
        <template v-if="slots.empty" #empty>
          <slot name="empty" :grouped="Boolean(grouping.length)" :label="emptyLabel" />
        </template>
        <template v-if="slots['leading-header']" #grouped-leading-header>
          <slot name="leading-header" :items="visibleItems" />
        </template>
        <template v-if="slots.leading" #grouped-leading-cell="{ row }">
          <BranchFooter v-if="row.original.kind === 'controls'" :node="row.original.node" :leaf="row.original.leaf" />
          <slot
            v-else
            name="leading"
            :item="row.original.kind === 'item' ? row.original.item : undefined"
            :node="row.original.kind === 'group' ? row.original.node : undefined"
          />
        </template>
        <template v-for="item in displayColumns" :key="item.id" #[`${item.id}-header`]="{ column }">
          <slot
            name="column-header"
            :field="item.id"
            :label="item.header"
            :sort="column.getIsSorted()"
            :toggle-sort="column.getToggleSortingHandler()"
          >
            <UButton
              v-if="column.getCanSort()"
              class="text-highlighted p-0 font-semibold"
              color="neutral"
              variant="ghost"
              :ui="grouping.includes(item.id) ? { label: 'whitespace-normal wrap-anywhere text-start' } : undefined"
              :label="String(item.header)"
              :trailing-icon="sortIcon(column.getIsSorted())"
              @click="column.getToggleSortingHandler()?.($event)"
            />
            <template v-else>
              {{ item.header }}
            </template>
          </slot>
        </template>
        <template v-for="column in displayColumns" :key="column.id" #[`${column.id}-cell`]="{ row }">
          <BranchFooter
            v-if="row.original.kind === 'controls' && !slots.leading && column.id === orderedColumns[0]?.id"
            :node="row.original.node"
            :leaf="row.original.leaf"
          />
          <template v-else-if="row.original.kind === 'group'">
            <slot
              v-if="column.id === row.original.node.field"
              name="group-toggle"
              :node="row.original.node"
              :trigger-props="groupToggleProps(row.original.node)"
            >
              <button
                class="text-default focus-visible:outline-primary inline-flex max-w-full cursor-pointer flex-wrap items-center gap-1 rounded-md py-1 text-start text-xs font-medium focus-visible:outline-2"
                v-bind="groupToggleProps(row.original.node)"
              >
                <UIcon
                  class="size-4 shrink-0"
                  aria-hidden="true"
                  :name="icon(row.original.node.expanded ? 'grouping.expanded' : 'grouping.collapsed')"
                />
                <span class="max-w-full min-w-0 wrap-anywhere whitespace-normal">
                  <slot name="group-value" :node="row.original.node">
                    {{ row.original.node.value ?? t('grouping.null') }}
                  </slot>
                </span>
                <slot name="group-count" :node="row.original.node" :label="formatNumber(row.original.node.count)">
                  <span class="text-muted shrink-0 tabular-nums">{{ formatNumber(row.original.node.count) }}</span>
                </slot>
              </button>
            </slot>
            <slot v-else name="group-cell" :node="row.original.node" :field="column.id" />
          </template>
          <slot
            v-else-if="row.original.kind === 'item' && !grouping.includes(column.id)"
            name="cell"
            :field="column.id"
            :item="row.original.item"
          >
            {{ row.original.item[column.id] }}
          </slot>
        </template>
      </UTable>
    </div>
    <slot
      v-if="grouping.length"
      name="group-footer"
      :expanded="allGroupsExpanded"
      :loading="root.loading || changingGroups"
      :has-more="root.hasMore && !root.error"
      :toggle-all="toggleAllGroups"
      :load-more="loadGroups"
    >
      <footer class="border-default flex flex-wrap items-center gap-3 border-t px-4 py-3">
        <slot name="footer-start" />
        <UTooltip :text="bulkGroupLabel">
          <UButton
            color="neutral"
            size="sm"
            variant="ghost"
            :icon="allGroupsExpanded ? icon('grouping.collapseAll') : icon('grouping.expandAll')"
            :aria-label="bulkGroupLabel"
            :disabled="!groups.length || root.loading"
            :loading="changingGroups"
            @click="toggleAllGroups"
          />
        </UTooltip>
        <QTableGroupLoadMore
          :texts="texts"
          :has-more="root.hasMore && !root.error && !changingGroups"
          :loading="root.loading"
          @load="loadGroups"
        />
        <slot name="footer-end" />
      </footer>
    </slot>
    <GroupedPagination v-else :table="table" :branch="root" :path="[]" :texts="texts">
      <slot name="footer-start" />
      <template v-if="slots['footer-end']" #end>
        <slot name="footer-end" />
      </template>
      <template v-if="slots.pagination" #pagination="pagination">
        <slot name="pagination" v-bind="pagination" />
      </template>
    </GroupedPagination>
  </div>
</template>

<script setup lang="ts" generic="TItem extends Record<string, unknown>">
import type { TableColumn, TableProps } from '@nuxt/ui';
import { breakpointsTailwind, createReusableTemplate, useBreakpoints, useInfiniteScroll } from '@vueuse/core';
import { computed, ref, useTemplateRef, type ButtonHTMLAttributes } from 'vue';
import { useTableI18n, useTableNumber } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type {
  GroupedTableColumn,
  GroupedTableNode,
  GroupedTableState,
  GroupedTablePaginationSlot,
} from '../../../types/grouped-table';
import QTableGroupLoadMore from '../group/load-more.vue';
import GroupedBranchControls from './branch-controls.vue';
import GroupedPagination from './pagination.vue';

const props = defineProps<{
  table: GroupedTableState<TItem>;
  columns: readonly GroupedTableColumn[];
  availableColumns?: readonly GroupedTableColumn[];
  getId: (item: TItem) => string | number;
  label: string;
  flexibleColumn?: string;
  showBranch?: boolean;
  ui?: TableProps<DisplayRow>['ui'];
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
}>();

type GroupTriggerProps = ButtonHTMLAttributes & { 'data-group-toggle': string };

const slots = defineSlots<{
  cell?: (props: { field: string; item: TItem }) => unknown;
  'column-header'?: (props: {
    field: string;
    label: string;
    sort: false | 'asc' | 'desc';
    toggleSort?: (event: unknown) => void;
  }) => unknown;
  'group-toggle'?: (props: { node: GroupedTableNode<TItem>; triggerProps: GroupTriggerProps }) => unknown;
  'group-count'?: (props: { node: GroupedTableNode<TItem>; label: string }) => unknown;
  error?: (props: { error: unknown; label: string; retry: () => void }) => unknown;
  loading?: (props: { grouped: boolean; label: string }) => unknown;
  empty?: (props: { grouped: boolean; label: string }) => unknown;
  'branch-controls'?: (props: { node: GroupedTableNode<TItem>; leaf: boolean; load: () => Promise<void> }) => unknown;
  'branch-error'?: (props: { node: GroupedTableNode<TItem>; error: unknown; retry: () => Promise<void> }) => unknown;
  'group-footer'?: (props: {
    expanded: boolean;
    loading: boolean;
    hasMore: boolean;
    toggleAll: () => Promise<void>;
    loadMore: () => void;
  }) => unknown;
  pagination?: (props: GroupedTablePaginationSlot) => unknown;
  'group-value'?: (props: { node: GroupedTableNode<TItem> }) => unknown;
  'group-cell'?: (props: { node: GroupedTableNode<TItem>; field: string }) => unknown;
  branch?: (props: { node: GroupedTableNode<TItem> }) => unknown;
  'leading-header'?: (props: { items: TItem[] }) => unknown;
  leading?: (props: { item?: TItem; node?: GroupedTableNode<TItem> }) => unknown;
  'footer-start'?: () => unknown;
  'footer-end'?: () => unknown;
}>();

const { table } = props;
const { root, groups, allGroupsExpanded, grouping, loadingMode, sorting, columnPinning } = table;
const [DefineBranchFooter, BranchFooter] = createReusableTemplate<{ node: GroupedTableNode<TItem>; leaf: boolean }>();
const viewport = useTemplateRef('viewport');
const t = useTableI18n(() => props.texts);
const formatNumber = useTableNumber();
const icon = useTableIcons(props.icons);
const emptyLabel = computed(() => t(grouping.value.length ? 'grouping.noGroups' : 'grouping.empty'));
const errorLabel = computed(() => t(grouping.value.length ? 'grouping.rootError' : 'grouping.itemsError'));
const changingGroups = ref(false);
const bulkGroupLabel = computed(() => t(allGroupsExpanded.value ? 'grouping.collapseAll' : 'grouping.expandAll'));

defineExpose({ focus: () => viewport.value?.focus() });

type DisplayRow =
  | { kind: 'item'; key: string; item: TItem }
  | { kind: 'group'; key: string; node: GroupedTableNode<TItem> }
  | { kind: 'controls'; key: string; node: GroupedTableNode<TItem>; leaf: boolean };

/** Gives each item a stable key independent of the current sort, page, or parent group. */
function itemRow(item: TItem): DisplayRow {
  return { kind: 'item', key: `item:${props.getId(item)}`, item };
}

/** Puts open groups, their records, and branch controls in a single row sequence. */
function appendGroup(rows: DisplayRow[], node: GroupedTableNode<TItem>): void {
  rows.push({ kind: 'group', key: `group:${node.key}`, node });
  if (!node.expanded) return;

  const leaf = node.path.length === grouping.value.length;
  if (leaf) rows.push(...node.items.map(itemRow));
  else for (const child of node.children) appendGroup(rows, child);

  if (
    leaf ||
    node.hasMore ||
    node.loading ||
    node.error ||
    slots['branch-controls'] ||
    (props.showBranch && slots.branch)
  ) {
    rows.push({ kind: 'controls', key: `controls:${node.key}`, node, leaf });
  }
}

const rows = computed<DisplayRow[]>(
  /** Renders the server tree without issuing requests for collapsed groups. */
  () => {
    if (!grouping.value.length) return root.items.map(itemRow);
    const visible: DisplayRow[] = [];
    for (const node of groups.value) appendGroup(visible, node);
    return visible;
  },
);
const visibleItems = computed(() => rows.value.flatMap((row) => (row.kind === 'item' ? [row.item] : [])));
const mobile = useBreakpoints(breakpointsTailwind).smaller('sm');
const displayPinning = computed(
  /** On small screens group columns scroll with the rows; saved pinning remains unchanged. */
  () =>
    grouping.value.length
      ? {
          left: [
            ...(slots.leading ? [leadingId] : []),
            ...(mobile.value ? [] : grouping.value),
            ...(columnPinning.value.left ?? []).filter((id) => !grouping.value.includes(id)),
          ],
          right: (columnPinning.value.right ?? []).filter(
            /** Keeps only non-group columns pinned at the right edge. */
            (id) => !grouping.value.includes(id),
          ),
        }
      : { ...columnPinning.value, left: [...(slots.leading ? [leadingId] : []), ...(columnPinning.value.left ?? [])] },
);
const orderedColumns = computed(
  /** Keeps grouping columns visible and ordered by group depth, even if saved as hidden. */
  () => {
    const leading = [...grouping.value, ...(grouping.value.length ? (columnPinning.value.left ?? []) : [])];
    const ids = new Set([...leading, ...props.columns.map(/** Reads the visible column ID. */ ({ id }) => id)]);
    return [...ids].flatMap(
      /** Resolves only visible columns and the required grouping fields. */
      (id) => {
        const allowed = grouping.value.includes(id) ? (props.availableColumns ?? props.columns) : props.columns;
        const column = allowed.find(/** Matches a declared column ID. */ (entry) => entry.id === id);
        return column ? [column] : [];
      },
    );
  },
);
const leadingId = 'grouped-leading';
const leadingWidth = 48;

function groupedColumnWidth(column: GroupedTableColumn): number {
  return column.width ?? 150;
}

const groupedTableWidth = computed(
  /** Reserves the same scroll width before and after groups or pages are opened. */
  () =>
    orderedColumns.value.reduce(
      /** Adds each visible column's width. */ (total, column) => total + groupedColumnWidth(column),
      slots.leading ? leadingWidth : 0,
    ),
);
const flexibleColumn = computed(() => {
  const pinned = new Set([...displayPinning.value.left, ...(displayPinning.value.right ?? [])]);
  return props.flexibleColumn &&
    !pinned.has(props.flexibleColumn) &&
    orderedColumns.value.some(({ id }) => id === props.flexibleColumn)
    ? props.flexibleColumn
    : orderedColumns.value.find(({ id }) => !pinned.has(id))?.id;
});
const leadingColumn: TableColumn<DisplayRow> = {
  id: leadingId,
  size: leadingWidth,
  enableSorting: false,
  meta: {
    class: {
      th: 'first:pl-3 w-12 bg-default',
      /** Lets group controls span the table without inheriting sticky positioning. */
      td: ({ row }) => {
        if (row.original.kind === 'controls') return 'static! p-0 first:pl-0';
        return row.original.kind === 'group' ? 'first:pl-3 w-12 bg-inherit' : 'first:pl-3 w-12 bg-default';
      },
    },
    colspan: {
      /** Spans the leading cell and all visible resource columns on control rows. */
      td: ({ row }) => (row.original.kind === 'controls' ? String(orderedColumns.value.length + 1) : '1'),
    },
  },
};
const displayColumns = computed(() =>
  orderedColumns.value.map((column, index): TableColumn<DisplayRow> & { id: string; header: string } => {
    const { id, header, align, groupedCellClass, sortable } = column;
    const alignment = align === 'right' ? 'text-right tabular-nums' : '';
    const groupedWidth = grouping.value.length ? groupedColumnWidth(column) : undefined;
    const cellLayout = groupedWidth ? (groupedCellClass ?? 'whitespace-normal wrap-anywhere') : '';
    const showControls = !slots.leading && index === 0;
    return {
      id,
      header,
      size: groupedWidth,
      enableSorting: sortable ?? true,
      sortDescFirst: false,
      /** Enables TanStack's sorting controls while the API orders the rows. */
      accessorFn: (row) => (row.kind === 'item' ? row.item[id] : undefined),
      meta: {
        class: {
          th: [alignment, grouping.value.includes(id) && 'bg-default!'].filter(Boolean).join(' '),
          td: ({ row }) => {
            if (row.original.kind === 'controls') return showControls ? 'static! p-0 first:pl-0' : 'hidden';
            return [
              alignment,
              cellLayout,
              row.original.kind === 'group' ? 'bg-inherit' : grouping.value.includes(id) && 'bg-default',
            ]
              .filter(Boolean)
              .join(' ');
          },
        },
        colspan: showControls
          ? { td: ({ row }) => (row.original.kind === 'controls' ? String(orderedColumns.value.length) : '1') }
          : undefined,
        style: groupedWidth && id !== flexibleColumn.value ? { th: { width: `${groupedWidth}px` } } : undefined,
      },
    };
  }),
);
const rowMeta: TableProps<DisplayRow>['meta'] = {
  class: {
    /** Distinguishes group rows from individual records. */
    tr: (row) => (row.original.kind === 'group' ? 'cursor-pointer bg-elevated hover:bg-accented' : ''),
  },
};

/** Supplies the resource or branch key to TanStack Table. */
function getRowId(row: DisplayRow): string {
  return row.key;
}

/** Makes the group value, count, and expansion state available to keyboard and screen reader users. */
function groupLabel(node: GroupedTableNode<TItem>): string {
  const values = { count: node.count, formattedCount: formatNumber(node.count) };
  return t(
    'grouping.rowLabel',
    {
      ...values,
      label: String(node.value ?? t('grouping.null')),
      countLabel: t('grouping.count', values, node.count),
    },
    node.count,
  );
}

/** Connects native and custom disclosure buttons to row and keyboard activation. */
function groupToggleProps(node: GroupedTableNode<TItem>): GroupTriggerProps {
  return {
    type: 'button',
    'data-group-toggle': '',
    'aria-expanded': node.expanded,
    'aria-label': groupLabel(node),
    onClick: () => void table.toggleGroup(node.path),
  };
}

/** Makes the entire group row activate the same disclosure button used by the keyboard. */
function toggleGroupRow(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element) || target.closest('button, a, input, select, textarea')) return;
  target.closest('tbody tr')?.querySelector<HTMLButtonElement>('button[data-group-toggle]')?.click();
}

/** Displays the current server sort direction at the column header. */
function sortIcon(direction: false | 'asc' | 'desc'): string {
  if (direction === 'asc') return icon('sorting.columnAscending');
  if (direction === 'desc') return icon('sorting.columnDescending');
  return icon('sorting.trigger');
}

useInfiniteScroll(
  viewport,
  /** Appends flat rows near the end of the shared viewport. */ () => table.loadMoreItems([]),
  {
    distance: 48,
    /** Group leaves load through their own visible control rows. */
    canLoadMore: () =>
      loadingMode.value === 'infinite' && !grouping.value.length && root.hasMore && !root.loading && !root.error,
  },
);

/** Retries the failed batch while retaining already loaded rows or groups. */
function retry(): void {
  if (grouping.value.length) loadGroups();
  else if (loadingMode.value === 'infinite') void table.loadMoreItems([]);
  else {
    const { page, requestedPage } = table.getItemPage();
    void table.loadItemsPage([], requestedPage ?? page);
  }
}

/** Appends the next batch of top-level groups. */
function loadGroups(): void {
  void table.loadMoreGroups();
}

/** Expands or collapses the current group tree through the headless table. */
async function toggleAllGroups(): Promise<void> {
  changingGroups.value = true;
  try {
    await table.setAllGroupsExpanded(!allGroupsExpanded.value);
  } finally {
    changingGroups.value = false;
  }
}
</script>
