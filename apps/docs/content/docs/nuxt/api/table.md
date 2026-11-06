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

## Server-backed nested groups

`useGroupedTable` loads complete groups independently of ordinary list pagination.
Each header shows the count of all matching accessible records. Child groups and
leaf records load only when opened; each branch has its own continuation state.

```ts
import { useGroupedTable } from '@querry-kit/nuxt';
import type { GroupPath } from '@querry-kit/nuxt/types';

const table = useGroupedTable<Task>({
  api,
  endpoint: 'tasks',
  persistenceKey: 'tasks',
  columns,
  groupableFields: [
    { value: 'status', label: 'Status' },
    { value: 'category', label: 'Category' },
  ],
  defaultGrouping: ['status', 'category'],
  groupBatchSize: 25,
  defaultItemsPerPage: 25,
});

await table.initialize();
await table.loadMoreGroups(); // more root groups
// For a rendered group node:
await table.toggleGroup(node.path);
await table.loadMoreGroups(node.path); // child groups at an intermediate level
await table.loadMoreItems(leaf.path); // records at the final level
```

`groups` is a computed ref. `root` and each node expose `children`, `items`, `loading`,
`error`, and `hasMore`. Nodes also expose `key`, typed `path`, `field`, `value`,
`count`, `expanded`, and `loaded`. Use `node.key` as the renderer key and preserve
`node.path` as data, rather than building string paths from display labels.

The composable returns `grouping`, `sorting`, `filtering`, `itemsPerPage`, `columns`,
`fields`, `columnOrder`, `columnVisibility`, and `columnPinning` using existing table
preference conventions. Only the grouping selection is persisted; expansion and
loaded data remain in memory. Empty grouping loads a flat list through
`loadMoreItems([])`. `refresh()` discards cached groups and resets expansion.
Changing filters, grouping, sorting, fields, or page size invalidates pending results.
Errors remain local to the affected branch; call its load-more action again to retry.
Callbacks `onInitialized`, `onRefreshed` (the branch's accumulated records), and
`onError` are optional. A unique `identityKey` defaults to `id` and provides a stable
record-sort tie-breaker. Group keys sort ascending; grouping fields can be reordered.

The API client also exposes `groupBy<TResult>(query)`, returning an Axios response
whose data is `TResult[]`, from `GET /:resource/group-by`. A request uses bracket
notation for `by`, ordering and selectors; `where` is JSON encoded to preserve
scalar key types. Group continuation fetches one lookahead group and does not need
a total group count. There is no global record page in grouped mode.

Configure the backend routes as described in the Nest Query Service grouping guide:
use the same static/tenant/access constraints for counts and records, allowlist scalar
fields, enable `preserveJsonWhereTypes`, and avoid `QueryTransformPipe` on these
routes. Client filtering is not authorization. Null keys remain real group values;
relations, date intervals, and snapshot-consistent pagination are outside this API.
After data mutations, call `refresh()` to reload counts and membership.
