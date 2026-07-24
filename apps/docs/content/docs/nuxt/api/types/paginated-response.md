# `PaginatedResponse`

```ts
interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
```

The required response shape for a Query Kit list endpoint. Both [`useTable`](/docs/nuxt/api/table/use-table) and [`useAutocomplete`](/docs/nuxt/api/autocomplete/use-autocomplete) read `items`; the table also reads the pagination metadata.
