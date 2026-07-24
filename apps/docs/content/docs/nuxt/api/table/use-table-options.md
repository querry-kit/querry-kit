# `UseTableOptions`

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

Configuration for [`useTable`](/docs/nuxt/api/table/use-table). At runtime, provide either `persistenceKey` or its deprecated `name` alias.

| Property | Purpose |
| --- | --- |
| `api`, `endpoint`, `columns` | Required client, endpoint, and reactive renderer-aware column definitions. |
| `persistenceKey` / `name` | Namespace local table preferences; `name` is retained for compatibility. |
| `staticFields`, `staticInclude`, `staticFilter`, `isArchived` | Fields and conditions merged into every Query Kit request. |
| `defaultItemsPerPage`, `storage`, `routePage` | Initial size and optional persistence/URL adapters. |
| `identityKey` | Row property used by `updateRow`; defaults to `id`. |
| `onInitialized`, `onRefreshed`, `onError` | Lifecycle callbacks for the initial request, latest successful request, and latest failure. |
