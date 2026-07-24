# `QueryParameters`

```ts
type QueryParameters = Record<string, unknown>;
```

The open query-payload contract used by API methods and autocomplete. Values are serialized in Query Kit's bracket notation by [`serializeQuery`](/docs/nuxt/api/utils/serialize-query).

```ts
const query: QueryParameters = {
  page: 1,
  perPage: 25,
  where: { status: 'active' },
};
```
