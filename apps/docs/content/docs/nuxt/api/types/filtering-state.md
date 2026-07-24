# `FilteringState`

```ts
interface FilteringState {
  operator: 'AND' | 'OR';
  filters: FilteringField[];
}
```

The table's complete UI filtering state. [`filteringToWhere`](/docs/nuxt/api/utils/filtering-to-where) ignores filters without a `value` and combines the remaining conditions using `operator`.
