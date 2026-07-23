# Pagination

`QTablePagination` is a standalone footer for page-based APIs. It emits page and page-size changes; the application fetches the corresponding data.

<DemosTablePagination />

![Default pagination](/docs/nuxt-ui/components/table-pagination-default.png)

![Pagination with a custom footer](/docs/nuxt-ui/components/table-pagination-custom-footer.png)

## Inputs and behavior

| Prop/model               | Default                   | Description                                                    |
| ------------------------ | ------------------------- | -------------------------------------------------------------- |
| `v-model:page`           | required                  | One-based current page.                                        |
| `v-model:items-per-page` | required                  | Current page size.                                             |
| `total-items`            | `0`                       | Total available rows. Hides the summary when zero.             |
| `page-sizes`             | `[1, 2, 10, 25, 50, 100]` | Selectable page sizes.                                         |
| `summary`                | localized                 | Replaces only the `Showing {start}–{end} of {total}` template. |
| `texts`                  | —                         | Explicit text overrides, ahead of i18n and English defaults.   |
| `shortcuts`              | `true`                    | Enables keyboard page navigation.                              |
| `ui`                     | —                         | Classes for the root, left, and right footer regions.          |

Changing the page size emits `update:items-per-page` and clamps the current page to the new page count. The default pagination control provides first, previous, next, and last navigation; keyboard shortcuts mirror these actions:

- <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> moves one page.
- <kbd>Shift</kbd> + <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd> moves to the first or last page.

## Slots

| Slot         | Slot props                                               | Use it to replace            |
| ------------ | -------------------------------------------------------- | ---------------------------- |
| `left`       | `page`, `itemsPerPage`, `totalItems`, `start`, `end`     | The result summary region.   |
| `page-size`  | `itemsPerPage`, `setItemsPerPage`                        | The page-size selector.      |
| `pagination` | `page`, `pageCount`, `first`, `previous`, `next`, `last` | The page navigation control. |
| `right`      | `page`, `pageCount`                                      | A trailing footer region.    |
