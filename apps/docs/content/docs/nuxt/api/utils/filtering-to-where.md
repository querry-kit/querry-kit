# `filteringToWhere`

```ts
function filteringToWhere(
  filtering: FilteringState,
): Record<string, unknown> | undefined;
```

Converts UI filtering state to a nested Query Kit `where` expression. Filters with `value === undefined` are ignored; dotted `field` paths are expanded with [`unflatten`](/docs/nuxt/api/utils/unflatten).

```ts
const where = filteringToWhere({
  operator: 'AND',
  filters: [{ id: 'title', field: 'title', operator: 'contains', value: 'Query' }],
});
// { title: { contains: 'Query' } }
```
