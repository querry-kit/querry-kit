# `serializeQuery`

```ts
function serializeQuery(query?: QueryParameters): string;
```

Serializes a Query Kit request with `qs` bracket notation. It returns a leading `?` for non-empty payloads and an empty string for an empty payload.

```ts
serializeQuery({ page: 1, include: { author: true } });
// '?page=1&include[author]=true'
```
