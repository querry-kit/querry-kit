# Table toolbar

`QTableToolbar` arranges a breadcrumb, create region, search field, and the grouping, sorting, filtering, and column controls. It does not fetch data, perform filtering, or own table state; it forwards the models supplied by the application.

The selection toolbar, mobile search button, and full set of shortcuts described below are development features. They are available in the local UI preview; the released `4.2.0` package does not include them.

<DemosTableToolbar></DemosTableToolbar>

## Small screens

The default search control starts as a magnifier button below `sm`. Activate it or press **Shift+/** to focus the search field. Escape or leaving the field collapses it without clearing the query.

Below the toolbar’s `sm` breakpoint (640 px by default), each table control opens in a modal dialog. The header and footer stay visible while the body scrolls. Use the footer’s **Close** button or press Escape to dismiss the dialog. Translate the button with `querrykit.table.toolbar.close` or override it using `texts.toolbar.close`. On wider screens, the controls open in popovers.

## Models and regions

| Model/prop                  | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `v-model:search`            | Free-text value. An empty default input emits `undefined`.              |
| `v-model:grouping` | Optional ordered `string[]` of grouping field IDs. |
| `v-model:sorting`           | Forwarded to the default sorting control when `sortable-fields` exists. |
| `v-model:filtering`         | Forwarded to the default filtering control when `filter-fields` exists. |
| `v-model:column-order`      | Enables default column options together with its other models.          |
| `v-model:invisible-columns` | Hidden IDs for default column options.                                  |
| `v-model:column-pinning`    | Pinning state for default column options.                               |
| `groupable-fields` | Optional `GroupingField[]` for the grouping control. |
| `sortable-fields` | Optional `SortingField[]` for the sorting control. |
| `filter-fields` | Optional `FilterField[]` for the filtering control. |
| `filter-context-active` | Optional boolean for the application-owned filter; defaults to false when omitted. |
| `column-definitions` | Optional `ColumnDefinition[]` for column options. |
| `breadcrumb-items`          | Optional `Record<string, unknown>[]` rendered by the default `UBreadcrumb`.                            |
| `search-placeholder`        | Replaces only the default search placeholder.                           |
| `selected-count`            | Number selected across pages and groups. Defaults to `0`, hiding the bulk-action row. |
| `texts`                     | Text overrides forwarded to the default child controls.                 |
| `icons`                     | Nested icon overrides forwarded to the default child controls.          |
| `shortcuts`                 | Enables or disables the default child-control shortcuts.                |
| `ui`                        | Optional `{ root?: string, primary?: string, secondary?: string }` CSS classes.                   |

The toolbar renders each default control only when it receives the necessary model and field/column definitions. It is therefore safe to use it for a search-only or partially configurable table.

Enabled toolbar buttons show a pointer cursor. Hover or focus the default icon buttons to see their translated labels and keyboard shortcuts. The desktop search field shows its shortcut inline. Shortcut hints are hidden when shortcuts are disabled.

## Slots

| Slot             | Slot props                            | Use it to replace                                                               |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `breadcrumb`     | `items`                               | The breadcrumb region.                                                          |
| `new`            | —                                     | The create action in the main toolbar.                                          |
| `bulk-actions`   | `selectedCount`                       | Actions on the right of the separate selection toolbar.                         |
| `search`         | `search`, `setSearch`                 | The search field or search behavior.                                            |
| `options`        | `sorting`, `filtering`, `grouping`, `columnOrder` | The complete group of table controls.                                           |
| `filter-context` | —                                     | Adds controls above the rules in the filter panel.                            |
| `filter-item`    | `filter`, `field`, `remove`, `update` | Customizes a filter row. Fields without slot content keep their default editor. |

Set `filter-context-active` to highlight the filter trigger when an application-owned filter is active. Handle `clear-filters` to reset the controls in `filter-context` alongside the rule list.

```vue
<QTableToolbar v-model:search="search">
  <template #new><UButton label="Create project" /></template>
  <template #search="{ search, setSearch }">
    <UInput :model-value="search" placeholder="Find projects" @update:model-value="setSearch" />
  </template>
</QTableToolbar>
```

## Selection and bulk actions

Pass the full selection count (including other pages or collapsed groups) in `selected-count`. A positive value shows a separate toolbar with the count on the left and the `bulk-actions` slot on the right. At zero the row disappears. The application owns selection, permissions, and action handlers.

```vue
<QTableToolbar :selected-count="selectedIds.size">
  <template #bulk-actions="{ selectedCount }">
    <UButton label="Export selected" @click="exportSelected(selectedCount)" />
  </template>
</QTableToolbar>
```

## Grouping

Bind `v-model:grouping` and pass selectable fields through `groupable-fields` to show the grouping control. Omit the fields or pass an empty array to hide it. A bound empty grouping array lets users select their first group. The `options` slot also receives `grouping`.

```vue
<QTableToolbar v-model:grouping="table.grouping.value" :groupable-fields="groupableFields" />
```

See [Grouping](/docs/nuxt-ui/components/grouping) for the live grouping examples.

## Replace the toolbar layout

`#layout` receives `isSmall` and the `breadcrumb`, `search`, `options`, and
`actions` render components. Place them in your own layout with
`<component :is="…" />`. Without the slot, the toolbar keeps its desktop and
mobile layouts.

Use `#grouping`, `#sorting`, `#filtering`, and `#column-options` to replace
individual controls inside the default options region. Each slot receives its
current model and setters. For example, `#filtering` receives `filtering`,
`fields`, and `setFiltering`. The existing `#options` slot replaces the
whole control region.

The `search` model is a string or `undefined`. Its setter accepts a string, a number (converted to a string), or `undefined` (clear). Unbound models are omitted by default. `ui` accepts optional CSS class strings.

### Keyboard shortcuts

Shortcuts are enabled by default for the available controls: **Shift+G** for Group by, **Shift+F** for Filter, **Shift+S** for Sort, **Shift+O** for Table options, **Shift+N** for New, and **Shift+/** to focus the search input. Typing in an input does not activate them. Use `:shortcuts="false"` to disable the toolbar shortcuts.

Place a single create button or link in `#new` for automatic activation. If the slot contains additional actions, add `data-qk-new` to the create trigger; without it, the shortcut does nothing when the target is ambiguous.

| Region slot | Additional scope | Default |
| --- | --- | --- |
| `layout` | `isSmall: boolean` and four Vue render components | Two rows on small screens and one on wider screens. |
| `grouping` | `grouping`, `fields`, `setGrouping(value: string[])` | A grouping control when bound with available fields. |
| `sorting` | `sorting`, `fields`, `setSorting(value: SortingState)` | A sorting control when bound with available fields. |
| `filtering` | `filtering`, `fields`, `setFiltering(value: Filtering)` | A filtering control, including the filter slots below. |
| `column-options` | `columns`, `columnOrder`, `invisibleColumns`, `columnPinning`, `setColumnOrder`, `setInvisibleColumns`, `setColumnPinning` | Column options when definitions and all three models are bound. |

`filter-context` and `filter-item` forward the corresponding filtering slots. `new` and `filter-context` have empty fallbacks. With no custom breadcrumb, a supplied item list is passed to Nuxt UI's breadcrumb. The default search is a labeled input whenever its model has a value. Each model emits its matching `update:<model>` event. `clear-filters` takes no arguments.
