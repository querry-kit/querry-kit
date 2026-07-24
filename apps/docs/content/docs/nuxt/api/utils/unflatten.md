# `unflatten`

```ts
function unflatten(value: Record<string, unknown>): Record<string, unknown>;
```

Expands dotted object keys into the nested form required by Query Kit. Empty path segments are ignored.

```ts
unflatten({ 'author.name': 'asc' });
// { author: { name: 'asc' } }
```
