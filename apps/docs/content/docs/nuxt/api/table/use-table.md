# `useTable`

```ts
function useTable<
  TItem extends Record<string, unknown>,
  TColumn extends TableColumnInput<TItem, object> = TableColumnInput<TItem>,
>(options: UseTableOptions<TItem, TColumn>): TableState<TItem, TColumn>;
```

Creates portable, headless state for a remote Query Kit table. A new request version is assigned on every refresh, so an older response cannot overwrite newer data.

```ts
const table = useTable<Book>({
  api,
  endpoint: 'books',
  persistenceKey: 'books',
  columns,
  routePage,
});

await table.initialize();
```

| Returned value | Meaning |
| --- | --- |
| `page`, `itemsPerPage` | Current pagination; page can be synchronized through `routePage`. |
| `sorting`, `filtering` | Persisted Query Kit UI state. |
| `columnOrder`, `columnVisibility`, `columnPinning` | Persisted renderer metadata. |
| `columns`, `fields`, `queryParams` | Derived visible columns, fields projection, and outgoing request. |
| `items`, `totalItems`, `totalPages`, `loading`, `error` | Current response and request state. |
| `initialize()` | Syncs the initial page, fetches, then runs `onInitialized`. |
| `refresh()` | Fetches the current request; only the latest response is accepted. |
| `updateRow(row)` | Shallow-merges the matching row without refetching. |
