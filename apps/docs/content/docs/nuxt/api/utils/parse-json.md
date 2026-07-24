# `parseJson`

```ts
function parseJson<T>(
  value: string | null | undefined,
  fallback: T,
): T;
```

Safely decodes persisted or URL JSON. It returns `fallback` when the value is absent, empty, or invalid instead of throwing.

```ts
const sorting = parseJson<SortingRule[]>(storage.getItem('table:books:sort'), []);
```
