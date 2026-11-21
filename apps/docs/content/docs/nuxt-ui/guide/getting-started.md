# Getting started

## Runtime requirements

The next major release requires Node.js 26.13.0 or newer and drops Node.js 24 support. Upgrade application runtimes and CI before updating. Published package versions remain unchanged until the release workflow runs.

## Install

```bash
pnpm add @querry-kit/nuxt @querry-kit/nuxt-ui @nuxt/ui @iconify-json/tabler
```

Register Nuxt UI before this module. The controls use Tabler icons by default, so install `@iconify-json/tabler` in the host application. Components read the host application's `querrykit.table.*` i18n keys when present and otherwise use English fallback strings.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@querry-kit/nuxt-ui'],
  querryKitUi: { autoImports: true },
});
```

Set `autoImports` to `false` when the application registers the components itself. The module never installs, configures, or ships an i18n provider.

## Compose a table toolbar

All state remains in the consuming application. Bind only the models needed by the controls you render.

```vue
<QTableToolbar
  v-model:search="search"
  v-model:sorting="sorting"
  v-model:filtering="filtering"
  v-model:column-order="columnOrder"
  v-model:invisible-columns="invisibleColumns"
  v-model:column-pinning="columnPinning"
  :sortable-fields="sortableFields"
  :filter-fields="filterFields"
  :column-definitions="columns"
/>
```

The controls emit immutable replacement values through their `v-model`s. This keeps them independent from a particular table implementation or application store.

## Keyboard shortcuts

| Control        | Shortcut                                                               |
| -------------- | ---------------------------------------------------------------------- |
| Sorting        | <kbd>Shift</kbd> + <kbd>S</kbd>                                        |
| Filtering      | <kbd>Shift</kbd> + <kbd>F</kbd>                                        |
| Column options | <kbd>Shift</kbd> + <kbd>O</kbd>                                        |
| Pagination     | <kbd>Shift</kbd> + arrow keys; add <kbd>Ctrl</kbd> for first/last page |

Pass `:shortcuts="false"` to an individual component to disable its listener.

Querry Kit table controls do not require a direct TanStack Table peer. Your table renderer (for example Nuxt UI) determines its supported TanStack version.

## Translate table controls

The table controls resolve explicit `texts` overrides, the host application's
`querrykit.table.*` messages, and English defaults in that order. Bind a reactive
`texts` object to change overrides while a component is mounted. Field names,
column headers, and resource labels come from the consuming application.

Filter rows use `filtering.operatorField` and `filtering.valueField` as separate
accessible names. Both accept `{field}`. Use `filtering.operators` for the visible
symbols and `filtering.operatorDescriptions` for their spoken descriptions.

Grouped row labels accept `{label}`, `{count}`, `{formattedCount}`, and
`{countLabel}`. The translator receives the numeric count for plural selection.
When the host exposes `$n`, counts and pagination numbers use that formatter.
Set the locale on `UApp` for the underlying Nuxt UI search, empty-state, and
page navigation messages.

## Text and icon reference

Pass a nested `texts` object for component-specific overrides. Library text resolves from explicit overrides, then the app's `$t`, then the English defaults below. Keys for `$t` use the `querrykit.table.` prefix. Numeric display uses `$n` when provided. Native Nuxt UI strings, including built-in SelectMenu empty text, follow the locale passed to `UApp`.

Component `icons` overrides app-wide `appConfig.querryKit.table.icons`, then the package defaults. The flat `icon` prop on filtering, sorting and column options takes precedence for the trigger. Values are Iconify names.

### Text keys

| Key | Default |
| --- | --- |
| `grouping.title` | `Group by` |
| `grouping.field` | `Select grouping field` |
| `grouping.noFields` | `No grouping fields available` |
| `grouping.add` | `Add grouping` |
| `grouping.remove` | `Remove grouping` |
| `grouping.clear` | `Clear grouping` |
| `grouping.reorder` | `Reorder {field}` |
| `grouping.moveUp` | `Move group up` |
| `grouping.moveDown` | `Move group down` |
| `grouping.count` | `{formattedCount} items` |
| `grouping.rowLabel` | `{label} {countLabel}` |
| `grouping.loading` | `Loading group…` |
| `grouping.itemsLoading` | `Loading items…` |
| `grouping.error` | `Unable to load group.` |
| `grouping.retry` | `Retry` |
| `grouping.loadMore` | `Load more` |
| `grouping.empty` | `No items` |
| `grouping.null` | `No value` |
| `grouping.noGroups` | `No matching groups` |
| `grouping.rootError` | `Could not load groups` |
| `grouping.itemsError` | `Could not load items` |
| `grouping.expandAll` | `Expand all groups` |
| `grouping.collapseAll` | `Collapse all groups` |
| `search.placeholder` | `Search` |
| `toolbar.close` | `Close` |
| `sorting.title` | `Sort` |
| `sorting.field` | `Select field` |
| `sorting.add` | `Add sort` |
| `sorting.clear` | `Clear sorting` |
| `sorting.remove` | `Remove sort` |
| `sorting.toggle` | `Toggle sort direction` |
| `filtering.title` | `Filter` |
| `filtering.field` | `Select field` |
| `filtering.add` | `Add filter` |
| `filtering.clear` | `Clear filters` |
| `filtering.remove` | `Remove filter` |
| `filtering.mode` | `Toggle filter mode` |
| `filtering.lookupPlaceholder` | `Select options` |
| `filtering.lookupError` | `Options could not be loaded.` |
| `filtering.operatorField` | `Operator for {field}` |
| `filtering.valueField` | `{field}` |
| `filtering.operators.in` | `∈` |
| `filtering.operators.notIn` | `∉` |
| `filtering.operators.equals` | `=` |
| `filtering.operators.not` | `≠` |
| `filtering.operators.gt` | `>` |
| `filtering.operators.gte` | `≥` |
| `filtering.operators.lt` | `<` |
| `filtering.operators.lte` | `≤` |
| `filtering.operatorDescriptions.in` | `Is one of` |
| `filtering.operatorDescriptions.notIn` | `Is not one of` |
| `filtering.operatorDescriptions.equals` | `Equals` |
| `filtering.operatorDescriptions.not` | `Does not equal` |
| `filtering.operatorDescriptions.gt` | `Greater than` |
| `filtering.operatorDescriptions.gte` | `Greater than or equal to` |
| `filtering.operatorDescriptions.lt` | `Less than` |
| `filtering.operatorDescriptions.lte` | `Less than or equal to` |
| `options.title` | `Table options` |
| `options.reset` | `Reset layout` |
| `options.pin` | `Pin column` |
| `options.left` | `Pin left` |
| `options.right` | `Pin right` |
| `options.center` | `Unpin` |
| `options.visibility` | `Toggle column visibility` |
| `pagination.pageSize` | `Items per page` |
| `pagination.summary` | `Showing {start}–{end} of {total}` |
| `pagination.mode` | `Row loading mode` |
| `pagination.paginated` | `Pagination` |
| `pagination.infinite` | `Infinite scroll` |
| `pagination.loaded` | `Loaded {count} of {total}` |
| `pagination.loadMore` | `Load more` |
| `pagination.loading` | `Loading rows…` |
| `pagination.error` | `Unable to load rows.` |
| `pagination.retry` | `Retry` |

### Icon keys

| Key | Default |
| --- | --- |
| `grouping.trigger` | `i-tabler-list-tree` |
| `grouping.up` | `i-tabler-chevron-up` |
| `grouping.down` | `i-tabler-chevron-down` |
| `grouping.remove` | `i-tabler-x` |
| `grouping.clear` | `i-tabler-cancel` |
| `grouping.add` | `i-tabler-plus` |
| `grouping.expanded` | `i-tabler-chevron-down` |
| `grouping.collapsed` | `i-tabler-chevron-right` |
| `grouping.expandAll` | `i-tabler-fold-down` |
| `grouping.collapseAll` | `i-tabler-fold-up` |
| `search.input` | `i-tabler-search` |
| `sorting.trigger` | `i-tabler-arrows-sort` |
| `sorting.header` | `i-tabler-arrows-sort` |
| `sorting.clear` | `i-tabler-cancel` |
| `sorting.add` | `i-tabler-plus` |
| `sorting.ascending` | `i-tabler-sort-ascending` |
| `sorting.descending` | `i-tabler-sort-descending` |
| `sorting.columnAscending` | `i-tabler-arrow-up` |
| `sorting.columnDescending` | `i-tabler-arrow-down` |
| `sorting.remove` | `i-tabler-x` |
| `filtering.trigger` | `i-tabler-filter` |
| `filtering.header` | `i-tabler-filter-2` |
| `filtering.intersect` | `i-tabler-layers-intersect-2` |
| `filtering.union` | `i-tabler-layers-union` |
| `filtering.clear` | `i-tabler-cancel` |
| `filtering.add` | `i-tabler-plus` |
| `filtering.remove` | `i-tabler-x` |
| `options.trigger` | `i-tabler-adjustments` |
| `options.header` | `i-tabler-adjustments` |
| `options.reset` | `i-tabler-restore` |
| `options.pin` | `i-tabler-pin` |
| `options.unpin` | `i-tabler-pin-off` |
| `options.drag` | `i-tabler-grip-vertical` |
| `options.visible` | `i-tabler-eye` |
| `options.hidden` | `i-tabler-eye-off` |
