# Pagination

`QTablePagination` shows numbered pages and can offer an Infinite scroll mode. The application supplies the rows and handles the footer's requests.

<DemosTablePagination></DemosTablePagination>

## Inputs and behavior

The footer stays on one line. It shows the summary only when the entire text fits beside the controls. On narrow footers, numbered navigation keeps the current page and the previous/next buttons. Use `#start` for controls that should stay visible beside the optional `#summary`.

| Prop/model               | Default                   | Description                                                    |
| ------------------------ | ------------------------- | -------------------------------------------------------------- |
| `v-model:page`           | required                  | One-based current page.                                        |
| `v-model:items-per-page` | required                  | Current page size.                                             |
| `v-model:loading-mode`   | omitted                   | Shows a mode selector when bound to `'pagination'` or `'infinite'`. |
| `total-items`            | `0`                       | Total available rows. Hides the numbered summary when zero.    |
| `page-sizes`             | `[1, 2, 10, 25, 50, 100]` | Selectable page sizes. Use `[]` to hide the default selector. |
| `loaded-items`           | `0`                       | Loaded rows in the flat Infinite scroll summary.              |
| `has-more`               | `false`                   | Whether the flat table has more rows to load.                  |
| `loading`                | `false`                   | A request is pending. Pauses loading and numbered navigation. |
| `error`                  | —                         | Flat Infinite scroll error. Pauses the observer and offers retry. |
| `grouped`                | `false`                   | Use the footer for the grouped table's mode and page size.      |
| `summary`                | localized                 | Replaces only the `Showing {start}–{end} of {total}` template. |
| `texts`                  | —                         | Explicit text overrides, ahead of i18n and English defaults.   |
| `shortcuts`              | `true`                    | Enables keyboard page navigation.                              |
| `ui`                     | —                         | Classes for the root, left, and right footer regions.          |

Changing the page size emits `update:items-per-page` and clamps the current page to the new page count. The default pagination control provides first, previous, next, and last navigation; keyboard shortcuts mirror these actions:

- <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> moves one page.
- <kbd>Shift</kbd> + <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd> moves to the first or last page.

## Infinite scroll

Bind the footer to [`useTable`](/docs/nuxt/api/table) to switch modes and append rows. The footer emits `load-more` when it nears the viewport and when the user activates **Load more** or **Retry**.

```vue
<QTablePagination
  v-model:page="table.page.value"
  v-model:items-per-page="table.itemsPerPage.value"
  v-model:loading-mode="table.loadingMode.value"
  :loaded-items="table.items.value.length"
  :total-items="table.totalItems.value"
  :has-more="table.hasMore.value"
  :loading="table.loading.value"
  :error="table.error.value"
  @load-more="table.loadMore()"
/>
```

Override the mode, loaded count, and load/retry labels via `texts.pagination` or host translations under `querrykit.table.pagination`. Use `mode`, `paginated`, `infinite`, `loaded` (with `{count}` and `{total}`), `loadMore`, `loading`, `error`, and `retry`. See [Grouping](/docs/nuxt-ui/components/grouping) for per-group controls.

## Slots

| Slot         | Slot props                                               | Use it to replace            |
| ------------ | -------------------------------------------------------- | ---------------------------- |
| `left`       | `page`, `itemsPerPage`, `totalItems`, `start`, `end`     | The result summary region.   |
| `start`      | —                                                        | Persistent controls before the optional summary. |
| `summary`    | `start`, `end`, `totalItems`                             | The text hidden when space is insufficient. |
| `page-size`  | `itemsPerPage`, `setItemsPerPage`                        | The page-size selector.      |
| `pagination` | `page`, `pageCount`, `first`, `previous`, `next`, `last` | The page navigation control. |
| `right`      | `page`, `pageCount`                                      | A trailing footer region.    |

## Replace the summary

`#summary` receives numeric `start`, `end` and `totalItems`. It defaults to the localized page range or loaded count for flat infinite mode. `#left` replaces the entire left region, including `#start`. The page-size picker uses `pagination.pageSize` for both its accessible name and its non-selectable menu heading (**Items per page** in English). Page navigation, page size, and **Load more** use small controls.
