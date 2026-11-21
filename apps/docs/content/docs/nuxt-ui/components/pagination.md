# Pagination

`QTablePagination` is a standalone footer for page-based APIs. It emits page and page-size changes; the application fetches the corresponding data.

<DemosTablePagination></DemosTablePagination>

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

## Replace the summary

`#summary` receives `start`, `end`, and `totalItems`. Use it to replace just
the range text while retaining the page-size picker and navigation. The default
summary uses `pagination.summary` and the page-size picker uses
`pagination.pageSize` as its accessible name.

## Loading modes and summary slot

`v-model:loading-mode` is optional and accepts `'pagination'` or `'infinite'`. Omit it for numbered pages without a mode switch. A switch emits `update:loadingMode`. The other models emit `update:page` and `update:itemsPerPage`.

For flat infinite lists, bind `loaded-items: number` (defaults to zero), `has-more: boolean`, `loading: boolean` and `error: unknown`. The last three are optional and disabled or unset by default. The footer requests another batch near the viewport and also provides a manual action. Handle `load-more` without arguments, including when the user retries after an error. `grouped: boolean` defaults to false. Enable it to retain only global page size and mode controls while the grouped renderer manages branch controls.

The `summary` slot receives numeric `start`, `end` and `totalItems`. It defaults to the displayed page range or loaded count for flat infinite mode. The outer `left` slot replaces this entire region. `page-size` defaults to the size picker, `pagination` to numbered navigation in flat pagination mode, and `right` to an empty region.
