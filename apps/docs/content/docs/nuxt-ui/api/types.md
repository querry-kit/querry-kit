# Types and text customization

Import public state types from the package types entrypoint:

```ts
import {
  FilterFieldType,
  FilteringMode,
  type ColumnPinning,
  type ColumnDefinition,
  type FilterField,
  type Filtering,
  type SortingState,
  type TableIconOverrides,
} from '@querry-kit/nuxt-ui/types';
```

`SortingState` is an ordered list of `{ id, desc }`. `Filtering` combines `FilteringMode.Intersect` (`AND`) or `FilteringMode.Union` (`OR`) with typed filter entries. `FilterField` is the discriminated component configuration for boolean, number, enum and custom-select editors. `ColumnDefinition` and `ColumnPinning` model the values accepted by column options.

## Texts without i18n

`@querry-kit/nuxt-ui` has no i18n runtime dependency. Every text is resolved in this order: nested `texts` override, host-app i18n key, then an English fallback. Pass the optional `texts` prop to any table control, or to `QTableToolbar` to forward the same overrides to its default sorting, filtering, and column-option controls.

```vue
<QTableToolbar
  v-model:search="search"
  :texts="{
    search: { placeholder: 'Find projects' },
    sorting: { title: 'Order by', add: 'Add order' },
    pagination: { summary: 'Rows {start}–{end} of {total}' },
  }"
/>
```

Explicit `texts` values have priority over host-app i18n and English defaults. `QTablePagination` also keeps its `summary` prop for changing only the result-summary template.

Slots replace a complete display region when a text override is not enough. For example, replace the sorting trigger while retaining its open state and behavior:

```vue
<QTableSorting v-model:sorting="sorting" :fields="sortableFields">
  <template #trigger="{ toggle, active }">
    <UButton :color="active ? 'primary' : 'neutral'" label="Order projects" @click="toggle" />
  </template>
</QTableSorting>
```

The toolbar exposes `breadcrumb`, `search`, `options`, and `new`; sorting, filtering, and options expose `trigger`, `header`, `items`, `item`, and `add` where applicable; pagination exposes `left`, `page-size`, `pagination`, and `right`.

## Icons

Pass `icons` to any icon-bearing table control, or to `QTableToolbar` to forward it to its default sorting, filtering, and column-option controls. Each value is a Nuxt UI/Iconify icon name. Partial overrides preserve every other package default; the existing flat `icon` prop on sorting, filtering, and options still takes priority for that control's trigger.

The package defaults use Tabler, so the host application must install that Iconify collection:

```sh
pnpm add @iconify-json/tabler
```

Install an additional collection before using its icon names. For example, install Lucide before applying the Lucide overrides below:

```sh
pnpm add @iconify-json/lucide
```

```vue
<QTableToolbar
  v-model:search="search"
  :icons="{
    search: { input: 'i-lucide-search' },
    sorting: { trigger: 'i-lucide-arrow-up-down', add: 'i-lucide-plus' },
    filtering: { trigger: 'i-lucide-list-filter', intersect: 'i-lucide-list-filter-plus' },
    options: { trigger: 'i-lucide-settings-2', pin: 'i-lucide-pin' },
  }"
/>
```

The prefix selects the collection, so the same API can use another icon pack. For example, after installing `@iconify-json/tabler`, use `i-tabler-*` names:

```vue
<QTableToolbar
  v-model:search="search"
  :icons="{
    search: { input: 'i-tabler-search' },
    sorting: { trigger: 'i-tabler-arrows-sort' },
    filtering: { trigger: 'i-tabler-filter' },
    options: { trigger: 'i-tabler-adjustments' },
  }"
/>
```

The complete `icons` shape is `TableIconOverrides` with these defaults:

```ts
{
  search: { input: 'i-tabler-search' },
  sorting: {
    trigger: 'i-tabler-arrows-sort', header: 'i-tabler-arrows-sort', clear: 'i-tabler-cancel',
    add: 'i-tabler-plus', ascending: 'i-tabler-sort-ascending', descending: 'i-tabler-sort-descending',
    remove: 'i-tabler-x',
  },
  filtering: {
    trigger: 'i-tabler-filter', header: 'i-tabler-filter-2', intersect: 'i-tabler-layers-intersect-2',
    union: 'i-tabler-layers-union', clear: 'i-tabler-cancel', add: 'i-tabler-plus', remove: 'i-tabler-x',
  },
  options: {
    trigger: 'i-tabler-adjustments', header: 'i-tabler-adjustments', pin: 'i-tabler-pin',
    drag: 'i-tabler-grip-vertical',
  },
}
```

## Host-app i18n keys

Install and configure an i18n provider only when the application needs translations:

```sh
pnpm add @nuxtjs/i18n vue-i18n
```

Register it before `@querry-kit/nuxt-ui`. The package does not merge messages or ship locale payloads; define the keys in the host application's locale files.

```ts
export default defineNuxtConfig({ modules: ['@nuxt/ui', '@nuxtjs/i18n', '@querry-kit/nuxt-ui'] });
```

All package keys are namespaced below `querrykit.table`, avoiding collisions with application messages.

## Complete message JSON

Use this complete shape in an application locale file. The `texts` prop accepts the same nested shape without the outer `querrykit.table` wrapper.

```json
{
  "querrykit": {
    "table": {
      "search": {
        "placeholder": "Search"
      },
      "sorting": {
        "title": "Sort",
        "field": "Select field",
        "add": "Add sort",
        "clear": "Clear sorting",
        "remove": "Remove sort",
        "toggle": "Toggle sort direction"
      },
      "filtering": {
        "title": "Filter",
        "field": "Select field",
        "add": "Add filter",
        "clear": "Clear filters",
        "remove": "Remove filter",
        "mode": "Toggle filter mode"
      },
      "options": {
        "title": "Table options",
        "pin": "Pin column",
        "left": "Left",
        "right": "Right",
        "center": "Unpin",
        "visibility": "Toggle column visibility"
      },
      "pagination": {
        "summary": "Showing {start}–{end} of {total}"
      }
    }
  }
}
```
