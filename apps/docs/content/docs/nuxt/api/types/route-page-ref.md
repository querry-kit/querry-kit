# `RoutePageRef`

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
