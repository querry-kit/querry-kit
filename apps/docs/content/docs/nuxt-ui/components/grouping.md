# Grouping

<DemosTableGrouping></DemosTableGrouping>

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
from the add selector. Drag a field's reorder handle or use the arrow keys on it
to reorder levels. Remove and clear actions emit
new state. The control does not fetch data. `QTableToolbar` accepts the same model
and `groupableFields` for optional integration.

`QTableGroup` takes `label`, `count`, `expanded`, optional `loading`/`error`, `texts`,
and `icons`. It emits `toggle` and `retry`; its default slot renders branch content.
The `header` slot receives `label`, `count`, and `expanded`. Expansion is controlled
by the parent; the trigger reports `aria-expanded` and native button keyboard behavior.

`QTableGroupLoadMore` takes `hasMore`, optional `loading`/`error`, and `texts`, and emits
`load`. It disables requests while loading and renders a retry action after errors.
Use it independently for the root, nested group lists, and leaf records.

```vue
<QTableGrouping v-model:grouping="table.grouping.value" :fields="groupableFields" />
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

All labels live under `querrykit.table.grouping` for host i18n. `texts.grouping` supports
`title`, `field`, `add`, `remove`, `clear`, `moveUp`, `moveDown`, `count` (with `{count}`),
`loading`, `error`, `retry`, `loadMore`, `empty`, and `null`. `icons.grouping` supports
`trigger`, `up`, `down`, `remove`, `add`, `expanded`, and `collapsed` using existing
component/app-config/default precedence. Field labels and null-value labels are
application-owned; use the same locale as the rest of the table.
