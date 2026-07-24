# Types

Shared contracts are available from `@querry-kit/nuxt/types` and re-exported by `@querry-kit/nuxt`.

## Resource API

### `EndpointDefinition`

```ts
interface EndpointDefinition<TItem = unknown, TCreate = Partial<TItem>, TUpdate = Partial<TItem>> {
  item: TItem;
  create: TCreate;
  update: TUpdate;
}
```

Associates one endpoint with its returned resource and mutation payloads. `useModuleApi` infers its method arguments and response data from this contract.

```ts
type BookEndpoint = EndpointDefinition<Book, CreateBook, UpdateBook>;
```

### `EndpointMap`

```ts
type EndpointMap = Record<string, EndpointDefinition>;
```

Maps endpoint names to contracts and is the first generic of `useModuleApi`.

```ts
type Endpoints = {
  books: EndpointDefinition<Book, CreateBook, UpdateBook>;
  authors: EndpointDefinition<Author>;
};
```

### `PaginatedResponse`

```ts
interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
```

The required response shape for a Query Kit list endpoint. Both `useTable` and `useAutocomplete` read `items`; the table also reads the pagination metadata.

### `PaginationMeta`

```ts
interface PaginationMeta {
  itemCount: number;
  pageCount: number;
  [key: string]: unknown;
}
```

Extra backend-specific keys are permitted, but `itemCount` and `pageCount` are required by `useTable`.

### `QueryParameters`

```ts
type QueryParameters = Record<string, unknown>;
```

The open query-payload contract used by API methods and autocomplete. Values are serialized in Query Kit's bracket notation by `serializeQuery`.

```ts
const query: QueryParameters = {
  page: 1,
  perPage: 25,
  where: { status: 'active' },
};
```

## Table state

### `FilteringField`

```ts
interface FilteringField {
  id: string;
  field: string;
  type?: string;
  operator?: string;
  value?: unknown;
}
```

Describes one UI filter before it is converted to a Query Kit `where` payload. `field` supports dotted paths such as `author.name`; `operator` becomes the nested Query Kit operator when supplied.

### `FilteringState`

```ts
interface FilteringState {
  operator: 'AND' | 'OR';
  filters: FilteringField[];
}
```

The table's complete UI filtering state. `filteringToWhere` ignores filters without a `value` and combines the remaining conditions using `operator`.

### `RoutePageRef`

```ts
type RoutePageRef = Ref<number | string | null | undefined>;
```

A consumer-owned reactive page value. Pass it to `UseTableOptions.routePage` to synchronize table pagination without coupling the package to Vue Router.

```ts
const routePage = computed({
  get: () => route.query.page,
  set: (page) => router.replace({ query: { ...route.query, page } }),
});
```

### `SortingRule`

```ts
interface SortingRule {
  id: string;
  desc: boolean;
}
```

A TanStack-compatible sorting entry. The `id` may be a dotted field path; `desc: true` becomes `desc`, otherwise `sortingToOrderBy` emits `asc`.

### `StorageLike`

```ts
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
```

The minimal persistence adapter accepted by `UseTableOptions.storage`. It is compatible with `localStorage`, but lets SSR or embedded applications provide a safer implementation.

### `TableColumnInput`

```ts
type TableColumnInput<TItem, TMeta extends object = Record<string, unknown>> = TMeta & {
  id?: string;
  fields?: string[];
};
```

A renderer-agnostic input column for `useTable`. Supply application-specific metadata through `TMeta`; the package keeps it intact without depending on a UI library. Omit `id` to exclude a conditional column from table selection and persistence.

```ts
type AppColumn = TableColumnInput<Book, { label: string; sortable?: boolean }>;
```

### `TableColumn`

```ts
type TableColumn<TItem, TMeta extends object = Record<string, unknown>> = TableColumnInput<TItem, TMeta> & {
  id: string;
};
```

A visible table column with a resolved identifier. `fields` lists nested properties required for rendering; `useTable` turns them into the Query Kit fields grammar.

```ts
const columns: Ref<readonly TableColumn<Book, { label: string }>[]> = ref([
  { id: 'title', label: 'Title' },
  { id: 'author', fields: ['name'], label: 'Author' },
]);
```
