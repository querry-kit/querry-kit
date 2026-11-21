# Table toolbar

`QTableToolbar` arranges a breadcrumb, create region, search field, and the grouping, sorting, filtering, and column controls. It does not fetch data, perform filtering, or own table state; it forwards the models supplied by the application.

<DemosTableToolbar></DemosTableToolbar>

## Small screens

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
| `breadcrumb-items`          | Items rendered by the default `UBreadcrumb`.                            |
| `search-placeholder`        | Replaces only the default search placeholder.                           |
| `texts`                     | Text overrides forwarded to the default child controls.                 |
| `icons`                     | Nested icon overrides forwarded to the default child controls.          |
| `shortcuts`                 | Enables or disables the default child-control shortcuts.                |
| `ui`                        | Classes for the root, primary, and secondary regions.                   |

The toolbar renders each default control only when it receives the necessary model and field/column definitions. It is therefore safe to use it for a search-only or partially configurable table.

## Slots

| Slot             | Slot props                            | Use it to replace                                                               |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `breadcrumb`     | `items`                               | The breadcrumb region.                                                          |
| `new`            | —                                     | Create or bulk-action controls.                                                 |
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

## Grouping

Pass `groupableFields` and `v-model:grouping` to show `QTableGrouping`. The `options` slot also receives `grouping`. See [Grouping](/docs/nuxt-ui/components/grouping) for lazy-loading group controls.

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

The `search` model is a string or `undefined`. Its setter accepts a string, a number (converted to a string), or `undefined` (clear). Unbound models are omitted by default. The `shortcuts` flag defaults to each child control's default (`true`), and `ui` accepts optional CSS class strings.

| Region slot | Additional scope | Default |
| --- | --- | --- |
| `layout` | `isSmall: boolean` and four Vue render components | Two rows on small screens and one on wider screens. |
| `grouping` | `grouping`, `fields`, `setGrouping(value: string[])` | A grouping control when bound with available fields. |
| `sorting` | `sorting`, `fields`, `setSorting(value: SortingState)` | A sorting control when bound with available fields. |
| `filtering` | `filtering`, `fields`, `setFiltering(value: Filtering)` | A filtering control, including the filter slots below. |
| `column-options` | `columns`, `columnOrder`, `invisibleColumns`, `columnPinning`, `setColumnOrder`, `setInvisibleColumns`, `setColumnPinning` | Column options when definitions and all three models are bound. |

`filter-context` and `filter-item` forward the corresponding filtering slots. `new` and `filter-context` have empty fallbacks. With no custom breadcrumb, a supplied item list is passed to Nuxt UI's breadcrumb. The default search is a labeled input whenever its model has a value. Each model emits its matching `update:<model>` event. `clear-filters` takes no arguments.
