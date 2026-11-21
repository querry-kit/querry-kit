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

## Server-backed grouping controls

Use `QTableGrouping` with `v-model:grouping` (an ordered string array) and
`fields` (`{ value, label, disabled? }[]`). Selected and disabled fields are excluded
from the add selector. Arrow buttons reorder levels; remove and clear actions emit
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
