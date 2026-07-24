# `sortingToOrderBy`

```ts
function sortingToOrderBy(
  sorting: readonly SortingRule[],
): Record<string, unknown>[] | undefined;
```

Converts ordered table sorting rules to Query Kit's nested `orderBy` array. It returns `undefined` when no rule is active; dotted IDs become nested objects.

```ts
sortingToOrderBy([{ id: 'author.name', desc: true }]);
// [{ author: { name: 'desc' } }]
```
