# Grouping

<DemosTableGrouping></DemosTableGrouping>

The Group by icon uses the primary color when a grouping is active.

### Render groups as table rows

`QTableGrouped` renders the state returned by `useGroupedTable`. Start the query with
`table.initialize()` when the view mounts. Supply the current visible columns and use
`available-columns` when a grouped column can be hidden in the saved layout.

```vue
<QTableGrouped
  :table="table"
  :columns="visibleColumns"
  :available-columns="allColumns"
  :get-id="(item) => item.id"
  label="Tasks"
>
  <template #cell="{ item, field }">{{ item[field] }}</template>
</QTableGrouped>
```

Add the package's `dist/runtime` directory as a Tailwind `@source` in your
application's stylesheet. Use a path relative to that stylesheet.

Each column needs an `id` and `header`. The renderer handles expansion, server sorting,
branch paging, and infinite loading. Use `group-value` and `group-cell` to customize group
rows, `leading` and `leading-header` for selection controls, and `branch` with `show-branch`
for extra content under expanded groups. The `footer-start` slot can hold a loading-mode switch.

## Pagination and batch loading

Pass `loading: {}` to `useGroupedTable` to start in Pagination. Bind its `loadingMode`
to the global `QTablePagination` and set `grouped` while grouping fields are active.
Use the global footer to change the mode and page size.

- In Pagination, render a footer inside every expanded leaf. Bind the page and total
  from `getItemPage(node.path)` and handle `update:page` with `loadItemsPage(node.path, page)`.
  Pass `:shortcuts="false"` for leaf footers and `:page-sizes="[]"` for a shared page size.
- In Infinite scroll, render `QTableGroupLoadMore` below each expanded leaf's rows,
  with `node.hasMore` and `node.loading`. On `load`, call `loadMoreItems(node.path)`.
  Configure `initialGroupItems` and `groupLoadMoreItems` under `loading` to pick the two
  batch sizes. Visible leaf headers preload even when collapsed. Set
  `preloadGroupItems: false` to defer the initial request until expansion.

The root and intermediate group lists can continue using `loadMoreGroups()`.
When the user clears grouping, connect the flat footer to `getItemPage([])`,
`loadItemsPage([], page)`, and `loadMoreItems([])`, using the root branch for
its row count, loading, error, and continuation props.

## Server-backed grouping controls

Use `QTableGrouping` with `v-model:grouping` (an ordered string array) and
`fields` (`{ value, label, disabled? }[]`). Selected and disabled fields are excluded
from the add selector. Select a field and press **Add grouping** to append it.
The add form stays visible with its controls disabled when no fields are available.
Drag the handle or press Up or Down on it to reorder levels. Remove and clear actions emit new state. The control does not fetch data. `QTableToolbar` accepts the same model
and `groupableFields` for optional integration.

`QTableGroup` takes `label`, `count`, `expanded`, optional `loading`/`error`, `texts`,
and `icons`. It emits `toggle` and `retry`; its default slot renders branch content.
The `header` slot receives `label`, `count`, and `expanded`. Expansion is controlled
by the parent; the trigger reports `aria-expanded` and native button keyboard behavior.

`QTableGroupLoadMore` takes `hasMore`, optional `loading`/`error`, and `texts`, and emits
`load`. It disables requests while loading and renders a retry action after errors.
Use it independently for the root, nested group lists, and leaf records.

```vue
<QTableToolbar v-model:grouping="table.grouping.value" :groupable-fields="groupableFields" />
<QTableGroup
  v-for="node in table.groups.value"
  :key="node.key"
  :label="String(node.value ?? 'No value')"
  :count="node.count"
  :expanded="node.expanded"
  :loading="node.loading"
  :error="node.error"
  @toggle="table.toggleGroup(node.path)"
  @retry="table.loadMoreGroups(node.path)"
>
  <!-- Render nested groups or application-owned leaf records here. -->
</QTableGroup>
<QTableGroupLoadMore
  :has-more="table.root.hasMore"
  :loading="table.root.loading"
  :error="table.root.error"
  @load="table.loadMoreGroups()"
/>
```

The example root has child grouping levels; at a leaf use `loadMoreItems(node.path)`
for retry and continuation. Group headers display full matching record counts, not
loaded record counts, when connected to `useGroupedTable` from `@querry-kit/nuxt`.
The application still owns table markup, columns, records, authentication, and API routes.

See the [text and icon reference](/docs/nuxt-ui/guide/getting-started#text-and-icon-reference) for all group labels and icon defaults. Supply field labels in the app locale. Override `grouping.null` for the renderer’s empty group value.

## Expandable table with counts, sums, and preloaded rows

<DemosTableGroupTotals></DemosTableGroupTotals>

The outer `UTable` displays one row per status with the project count and the sum of estimated hours.
Select any cell in a group row, or press Enter or Space when the row has focus, to toggle its details.
The chevron provides the same action and announces the expanded state. The `expanded` slot renders a nested
`UTable` with the preloaded detail rows. A dash indicates that every estimate in a group is missing.

The demo uses synthetic records. In an application, pass your configured Axios client as the `api` prop.
The list and [`group-by` route](/docs/nest/api/query-service#scalar-grouping) should use the same access
rules. Allow grouping by `status` and summing `estimatedHours` for callers with permission to read those fields.

```vue
<template>
  <UAlert
    v-if="error"
    color="error"
    title="Could not load projects"
    :actions="[{ label: 'Retry', onClick: () => refresh() }]"
  />
  <UTable
    v-else
    v-model:expanded="expanded"
    :data="groups ?? []"
    :columns="columns"
    :get-row-id="(group) => group.status"
    :expanded-options="{ getRowCanExpand: (row) => row.original.rows.length > 0 }"
    :loading="status === 'pending'"
    empty="No active projects."
    caption="Projects grouped by status"
    :ui="{ caption: 'sr-only', td: 'align-middle [&[colspan]]:p-0', tr: 'data-[selectable=true]:cursor-pointer' }"
    @select="(_, row) => row.getCanExpand() && row.toggleExpanded()"
  >
    <template #status-cell="{ row }">
      <div class="flex items-center gap-2">
        <UButton
          v-if="row.getCanExpand()"
          size="xs"
          variant="ghost"
          color="neutral"
          :icon="row.getIsExpanded() ? 'i-tabler-chevron-down' : 'i-tabler-chevron-right'"
          :aria-label="`Projects: ${row.original.status}`"
          :aria-expanded="row.getIsExpanded()"
          @click.stop="row.toggleExpanded()"
        />
        <UBadge color="neutral" variant="subtle" :label="row.original.status" />
      </div>
    </template>
    <template #expanded="{ row }">
      <UTable
        :data="row.original.rows"
        :columns="detailColumns"
        :caption="`Project details: ${row.original.status}`"
        :ui="{ root: 'bg-elevated/40 ps-4', caption: 'sr-only' }"
      />
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useModuleApi } from '@querry-kit/nuxt/api';
import type { EndpointDefinition, EndpointMap } from '@querry-kit/nuxt/types';
import type { ExpandedState } from '@tanstack/table-core';
import type { AxiosInstance } from 'axios';

type Project = {
  id: string;
  title: string;
  status: string;
  estimatedHours: number | null;
};

type GroupTotal = {
  status: string;
  _count: { _all: number };
  _sum: { estimatedHours: number | null };
};

type ProjectGroup = GroupTotal & { rows: Project[] };
type Endpoints = EndpointMap & { projects: EndpointDefinition<Project> };

const props = defineProps<{ api: AxiosInstance }>();
const projects = useModuleApi<Endpoints, 'projects'>(props.api, 'projects');
const columns: TableColumn<ProjectGroup>[] = [
  { accessorKey: 'status', header: 'Status' },
  { id: 'count', accessorFn: (group) => group._count._all, header: 'Projects' },
  { id: 'hours', accessorFn: (group) => group._sum.estimatedHours ?? '—', header: 'Estimated hours' },
];
const detailColumns: TableColumn<Project>[] = [
  { accessorKey: 'title', header: 'Project' },
  { id: 'hours', accessorFn: (project) => project.estimatedHours ?? '—', header: 'Estimated hours' },
];
const expanded = ref<ExpandedState>({});
const where = { archived: false };
const perPage = 25;

/**
 * Loads all matching project records in stable order before displaying groups.
 *
 * @returns {Promise<Project[]>} Project rows across all list pages.
 */
async function loadRows(): Promise<Project[]> {
  const orderBy = { id: 'asc' };
  const first = await projects.query({ where, orderBy, page: 1, perPage });
  const rows = [...first.data.items];

  for (let page = 2; page <= first.data.meta.pageCount; page += 1) {
    const result = await projects.query({ where, orderBy, page, perPage });
    rows.push(...result.data.items);
  }

  return rows;
}

const {
  data: groups,
  status,
  error,
  refresh,
} = await useAsyncData<ProjectGroup[]>(
  'project-groups',
  async () => {
    const [{ data: totals }, rows] = await Promise.all([
      projects.groupBy<GroupTotal>({
        by: ['status'],
        where,
        orderBy: { status: 'asc' },
        _count: { _all: true },
        _sum: { estimatedHours: true },
      }),
      loadRows(),
    ]);
    const rowsByStatus = Map.groupBy(rows, (row) => row.status);

    return totals.map((total) => ({ ...total, rows: rowsByStatus.get(total.status) ?? [] }));
  },
  { lazy: true, server: false },
);
</script>
```

Use this approach for a small, bounded result set. It fetches every detail page before rendering the totals, so expansion makes no further requests. For larger result sets, use the independently paged leaf groups in the first demo, or use its Infinite scroll mode to preload only the first batch per visible leaf.

## Replace grouped table regions

`QTableGrouping` offers `#trigger`, `#header`, `#clear`, `#items`, `#item`,
and `#add`. The default popover still handles activation of a custom trigger.
The item slot receives the field, its label, index, drag-handle class,
`move(index, direction)`, and `remove(field)`. The add slot receives
`availableFields` and `add(field)`.

Use the grouped renderer's scoped slots to retain its table state and actions.

| Region | Slots |
| --- | --- |
| Column headings | `column-header` with sort state and `toggleSort` |
| Group heading | `group-toggle`, `group-value`, `group-count` |
| Root request states | `loading`, `empty`, `error` |
| Expanded group | `branch`, `branch-controls`, `branch-error` |
| Footers | `group-footer`, `pagination`, `footer-start`, `footer-end` |

Bind `triggerProps` from `#group-toggle` to a native button so keyboard
activation and the row click both work. `#pagination` receives page state and
actions for the flat table and each expanded leaf. Use its `path` to tell them
apart. The `footer-start` and `footer-end` slots appear in both default footers.

## Component reference

### QTableGrouping

Requires an ordered `v-model:grouping` (`string[]`) and `fields: readonly GroupingField[]`. It emits `update:grouping` with field IDs. `texts` and `icons` are optional overrides. `ui.popover` and `ui.content` accept extra classes for the desktop popover and the control content. A toolbar switches the panel to a dialog on small screens.

| Slot | Scope | Fallback |
| --- | --- | --- |
| `trigger` | `open: boolean`, `active: boolean`, `setOpen(open: boolean)` | Grouping icon button. |
| `header` | `grouping`, `clear()` | Icon and heading. |
| `clear` | `grouping`, `clear()` | Clear action when grouped. |
| `items` | `grouping`, `move(index, direction)`, `remove(field)`, `setGrouping(fields)` | Draggable ordered list. |
| `item` | `field`, `label`, `index`, `move`, `remove`, `handleClass` | Row with keyboard reorder and removal actions. |
| `add` | `availableFields`, `add(field)` | Field picker and add button. |

### QTableGroup and QTableGroupLoadMore

`QTableGroup` requires `label: string`, `count: number` and `expanded: boolean`. Optional `loading: boolean` and `error: unknown` control expanded status. `texts` and `icons` override defaults. Its `toggle` and `retry` events have no payload. `trigger` receives `label`, `count`, `expanded`, and `toggle()`, with an accessible disclosure button as fallback. The button's `header` slot receives the same data except `toggle`, with the localized label and count as fallback. The unnamed slot renders expanded content. `loading` is unscoped and renders a status by default. `error` receives `error` and `retry()` and renders a retry alert by default.

`QTableGroupLoadMore` requires `hasMore: boolean`. It accepts optional `loading: boolean`, `error: unknown`, and `texts`. Its unnamed slot receives `hasMore`, `loading`, `error`, `attrs`, and `load()`. It renders when the branch has another batch or a request failed. The default button forwards attributes, disables itself while loading, and says Load more or Retry. The `load` event has no payload.

### QTableGrouped

| Prop | Type and default | Behavior |
| --- | --- | --- |
| `table` | Required `GroupedTableState<TItem>` | Reactive rows, group state, requests, pagination, and sorting. |
| `columns` | Required readonly `GroupedTableColumn[]` | Displayed columns. |
| `available-columns` | Optional readonly `GroupedTableColumn[]` | Supplies headers for grouping fields absent from displayed columns. Defaults to displayed columns. |
| `get-id` | Required `(item: TItem) => string \| number` | Stable record key. |
| `label` | Required `string` | Accessible table name. |
| `flexible-column` | Optional column ID | Column that fills available space in grouped mode. Defaults to the first displayed column. |
| `show-branch` | Optional `boolean` | Enables the branch-content slot above branch actions when supplied. |
| `ui` | Optional Nuxt UI Table `ui` | Styles the underlying table. |
| `texts`, `icons` | Optional shared overrides | Localized labels and Iconify icons. |

| Slot | Scope | Fallback |
| --- | --- | --- |
| `cell` | `field`, `item` | Record field value. |
| `column-header` | `field`, `label`, `sort`, optional `toggleSort(event)` | Sortable heading button or plain heading. |
| `leading-header`, `leading` | `items` in the header, optional `item` or `node` in rows | Empty. Adding these slots reserves a leading control column. |
| `group-toggle` | `node`, `triggerProps` | Accessible disclosure button. Spread `triggerProps` on a button when replacing it. |
| `group-value`, `group-count` | `node`, plus formatted `label` for `group-count` | Group value and count, rendered inside the default disclosure. |
| `group-cell` | `node`, `field` | Empty cell outside the grouping label, useful for aggregates. |
| `branch` | `node` | Empty branch content. |
| `branch-controls` | `node`, `leaf`, `load()` | Request more groups or records where supported. |
| `branch-error` | `node`, `error`, `retry()` | Branch retry alert. |
| `loading`, `empty` | `grouped`, `label` | Loading indicator or localized empty label. |
| `error` | `error`, `label`, `retry()` | Root retry alert. |
| `group-footer` | `expanded`, `loading`, `hasMore`, `toggleAll()`, `loadMore()` | Group footer with root actions. |
| `footer-start`, `footer-end` | None | Empty regions on either side of the default footer. |
| `pagination` | `GroupedTablePaginationSlot` | Numbered pages or load-more controls for flat rows and expanded leaves. A custom slot replaces the default pagination region. |

The renderer invokes the supplied table actions and has no additional component events. `GroupedTablePaginationSlot.path` is empty for flat records. It also exposes `page`, `totalItems`, `itemsPerPage`, `loadedItems`, `loading`, `error`, `infinite`, `hasMore`, `setPage(page)`, `setItemsPerPage(size)`, and `loadMore()`.
