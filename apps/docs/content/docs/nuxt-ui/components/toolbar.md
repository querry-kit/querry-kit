# Table toolbar

`QTableToolbar` arranges a breadcrumb, create region, search field, and the three table controls. It does not fetch data, perform filtering, or own table state; it forwards the models supplied by the application.

<DemosTableToolbar />

![Default toolbar](/docs/nuxt-ui/components/table-toolbar-default.png)

## Models and regions

| Model/prop                  | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `v-model:search`            | Free-text value. An empty default input emits `undefined`.              |
| `v-model:sorting`           | Forwarded to the default sorting control when `sortable-fields` exists. |
| `v-model:filtering`         | Forwarded to the default filtering control when `filter-fields` exists. |
| `v-model:column-order`      | Enables default column options together with its other models.          |
| `v-model:invisible-columns` | Hidden IDs for default column options.                                  |
| `v-model:column-pinning`    | Pinning state for default column options.                               |
| `breadcrumb-items`          | Items rendered by the default `UBreadcrumb`.                            |
| `search-placeholder`        | Replaces only the default search placeholder.                           |
| `texts`                     | Text overrides forwarded to the default child controls.                 |
| `shortcuts`                 | Enables or disables the default child-control shortcuts.                |
| `ui`                        | Classes for the root, primary, and secondary regions.                   |

The toolbar renders each default control only when it receives the necessary model and field/column definitions. It is therefore safe to use it for a search-only or partially configurable table.

## Slots

| Slot         | Slot props                            | Use it to replace                     |
| ------------ | ------------------------------------- | ------------------------------------- |
| `breadcrumb` | `items`                               | The breadcrumb region.                |
| `new`        | —                                     | Create or bulk-action controls.       |
| `search`     | `search`, `setSearch`                 | The search field or search behavior.  |
| `options`    | `sorting`, `filtering`, `columnOrder` | The complete group of table controls. |

```vue
<QTableToolbar v-model:search="search">
  <template #new><UButton label="Create project" /></template>
  <template #search="{ search, setSearch }">
    <UInput :model-value="search" placeholder="Find projects" @update:model-value="setSearch" />
  </template>
</QTableToolbar>
```
