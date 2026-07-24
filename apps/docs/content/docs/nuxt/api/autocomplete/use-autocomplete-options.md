# `UseAutocompleteOptions`

```ts
interface UseAutocompleteOptions<TItem extends Record<string, unknown>> {
  api: AxiosInstance;
  endpoint: string;
  query?: MaybeRef<QueryParameters | undefined>;
  currentValue?: MaybeRef<string | number | Array<string | number> | null | undefined>;
  identityKey?: keyof TItem & string;
  itemDisabled?: (item: TItem) => boolean;
  immediate?: boolean;
}
```

Configuration for [`useAutocomplete`](/docs/nuxt/api/autocomplete/use-autocomplete).

| Property | Required | Purpose |
| --- | --- | --- |
| `api` | Yes | Axios client created by the application. |
| `endpoint` | Yes | Resource endpoint relative to the configured API version. |
| `query` | No | Reactive query for search results. |
| `currentValue` | No | A selected identity or identities to load even when absent from the search query. |
| `identityKey` | No | Property used for selection and deduplication; defaults to `id`. |
| `itemDisabled` | No | Adds a derived `disabled` property to returned items. |
| `immediate` | No | Set to `false` to call `initialize()` manually; the default is `true`. |
