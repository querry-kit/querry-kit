# Utils

Utility functions are available from `@querry-kit/nuxt/utils` and re-exported by the package root.

## `andWhere`

```ts
function andWhere(...conditions: Array<Record<string, unknown> | undefined>): Record<string, unknown> | undefined;
```

Combines present Query Kit `where` fragments. No fragment returns `undefined`, one is returned unchanged, and multiple fragments are wrapped in `AND`.

```ts
const where = andWhere({ isArchived: false }, { author: { name: { contains: 'Ada' } } });
// { AND: [{ isArchived: false }, { author: { name: { contains: 'Ada' } } }] }
```

## `filteringToWhere`

```ts
function filteringToWhere(filtering: FilteringState): Record<string, unknown> | undefined;
```

Converts UI filtering state to a nested Query Kit `where` expression. Filters with `value === undefined` are ignored; dotted `field` paths are expanded with `unflatten`.

```ts
const where = filteringToWhere({
  operator: 'AND',
  filters: [{ id: 'title', field: 'title', operator: 'contains', value: 'Query' }],
});
// { title: { contains: 'Query' } }
```

## `isEqual`

```ts
function isEqual(left: unknown, right: unknown): boolean;
```

Performs a structural comparison of plain objects and arrays. Scalars are compared with `Object.is`; arrays are compared in order and object keys must match. The composables use it to avoid unnecessary reloads when reactive query state has not materially changed.

## `mergeQuery`

```ts
function mergeQuery<T extends Record<string, unknown>>(base: T, extra: Record<string, unknown>): T;
```

Deeply merges object-shaped query fragments. Later scalar values replace earlier values; nested non-array objects are merged recursively.

```ts
const query = mergeQuery(
  { include: { author: true }, where: { published: true } },
  { where: { id: { in: ['a', 'b'] } } },
);
```

## `parseJson`

```ts
function parseJson<T>(value: string | null | undefined, fallback: T): T;
```

Safely decodes persisted or URL JSON. It returns `fallback` when the value is absent, empty, or invalid instead of throwing.

```ts
const sorting = parseJson<SortingRule[]>(storage.getItem('table:books:sort'), []);
```

## `pathsToFieldsQuery`

```ts
function pathsToFieldsQuery(paths: Iterable<string>): string | undefined;
```

Builds Query Kit's compact `fields` grammar from dot-separated paths. Empty paths are ignored and no usable path returns `undefined`.

```ts
pathsToFieldsQuery(['id', 'title', 'author.name']);
// 'id,title,author{name}'
```

## `serializeQuery`

```ts
function serializeQuery(query?: QueryParameters): string;
```

Serializes a Query Kit request with `qs` bracket notation. It returns a leading `?` for non-empty payloads and an empty string for an empty payload.

```ts
serializeQuery({ page: 1, include: { author: true } });
// '?page=1&include[author]=true'
```

## `sortingToOrderBy`

```ts
function sortingToOrderBy(sorting: readonly SortingRule[]): Record<string, unknown>[] | undefined;
```

Converts ordered table sorting rules to Query Kit's nested `orderBy` array. It returns `undefined` when no rule is active; dotted IDs become nested objects.

```ts
sortingToOrderBy([{ id: 'author.name', desc: true }]);
// [{ author: { name: 'desc' } }]
```

## `unflatten`

```ts
function unflatten(value: Record<string, unknown>): Record<string, unknown>;
```

Expands dotted object keys into the nested form required by Query Kit. Empty path segments are ignored.

```ts
unflatten({ 'author.name': 'asc' });
// { author: { name: 'asc' } }
```
