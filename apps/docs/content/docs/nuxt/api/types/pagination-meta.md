# `PaginationMeta`

```ts
interface PaginationMeta {
  itemCount: number;
  pageCount: number;
  [key: string]: unknown;
}
```

Pagination metadata returned alongside list items. Extra backend-specific keys are permitted, but `itemCount` and `pageCount` are required by [`useTable`](/docs/nuxt/api/table/use-table).
