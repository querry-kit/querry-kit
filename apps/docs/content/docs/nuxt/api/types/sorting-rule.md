# `SortingRule`

```ts
interface SortingRule {
  id: string;
  desc: boolean;
}
```

A TanStack-compatible sorting entry. The `id` may be a dotted field path; `desc: true` becomes `desc`, otherwise [`sortingToOrderBy`](/docs/nuxt/api/utils/sorting-to-order-by) emits `asc`.
