# `andWhere`

```ts
function andWhere(
  ...conditions: Array<Record<string, unknown> | undefined>
): Record<string, unknown> | undefined;
```

Combines present Query Kit `where` fragments. No fragment returns `undefined`, one is returned unchanged, and multiple fragments are wrapped in `AND`.

```ts
const where = andWhere({ isArchived: false }, { author: { name: { contains: 'Ada' } } });
// { AND: [{ isArchived: false }, { author: { name: { contains: 'Ada' } } }] }
```
