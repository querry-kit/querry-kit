# Table

The headless table composable owns Query Kit request state, but consumers retain their table renderer, router, and storage adapters.

## `UseTableOptions`

```ts
interface UseTableOptions<
  TItem extends Record<string, unknown>,
  TColumn extends TableColumnInput<TItem, object> = TableColumnInput<TItem>,
> {
  api: AxiosInstance;
  endpoint: string;
  persistenceKey?: string;
  name?: string;
  columns: Ref<readonly TColumn[]>;
  staticFields?: string[];
  staticInclude?: Record<string, unknown>;
  staticFilter?: MaybeRef<Record<string, unknown> | undefined>;
  isArchived?: boolean;
  defaultItemsPerPage?: number;
  storage?: StorageLike;
  routePage?: RoutePageRef;
  identityKey?: keyof TItem & string;
  onInitialized?: () => void | Promise<void>;
  onRefreshed?: (items: TItem[]) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
}
```

| Property | Purpose |
| --- | --- |
| `api`, `endpoint`, `columns` | Required client, endpoint, and reactive renderer-aware column definitions. |
| `persistenceKey` / `name` | Namespace local table preferences; `name` is retained for compatibility. |
| `staticFields`, `staticInclude`, `staticFilter`, `isArchived` | Fields and conditions merged into every Query Kit request. |
| `defaultItemsPerPage`, `storage`, `routePage` | Initial size and optional persistence/URL adapters. |
| `identityKey` | Row property used by `updateRow`; defaults to `id`. |
| `onInitialized`, `onRefreshed`, `onError` | Lifecycle callbacks for the initial request, latest successful request, and latest failure. |

## `useTable`

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
