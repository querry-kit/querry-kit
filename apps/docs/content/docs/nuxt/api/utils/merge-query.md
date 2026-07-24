# `mergeQuery`

```ts
function mergeQuery<T extends Record<string, unknown>>(
  base: T,
  extra: Record<string, unknown>,
): T;
```

Deeply merges object-shaped query fragments. Later scalar values replace earlier values; nested non-array objects are merged recursively.

```ts
const query = mergeQuery(
  { include: { author: true }, where: { published: true } },
  { where: { id: { in: ['a', 'b'] } } },
);
// { include: { author: true }, where: { published: true, id: { in: ['a', 'b'] } } }
```
