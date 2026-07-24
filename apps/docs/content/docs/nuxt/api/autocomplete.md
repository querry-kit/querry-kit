# Autocomplete

The autocomplete composable keeps selected resources loaded independently of the active search result.

## `UseAutocompleteOptions`

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

| Property | Required | Purpose |
| --- | --- | --- |
| `api` | Yes | Axios client created by the application. |
| `endpoint` | Yes | Resource endpoint relative to the configured API version. |
| `query` | No | Reactive query for search results. |
| `currentValue` | No | A selected identity or identities to load even when absent from the search query. |
| `identityKey` | No | Property used for selection and deduplication; defaults to `id`. |
| `itemDisabled` | No | Adds a derived `disabled` property to returned items. |
| `immediate` | No | Set to `false` to call `initialize()` manually; the default is `true`. |

## `useAutocomplete`

```ts
function useAutocomplete<TItem extends Record<string, unknown>>(
  options: UseAutocompleteOptions<TItem>,
): AutocompleteState<TItem>;
```

Loads selected identities and search results independently, then returns selected items first and removes duplicate identities. Older responses never replace a newer result of the same request kind.

```ts
const users = useAutocomplete<User>({
  api,
  endpoint: 'users',
  query: computed(() => ({ where: { name: { contains: search.value } } })),
  currentValue: selectedUserId,
});
```

| Returned value | Meaning |
| --- | --- |
| `items` | Computed selected items followed by unique query items. `itemDisabled` is applied only here. |
| `currentValueItems`, `queryItems` | Raw cached results of the two requests. |
| `loading`, `error` | Combined pending state and the latest request error. |
| `loadCurrentItems()` | Refreshes selected identities only. |
| `loadItems()` | Refreshes search results only. |
| `initialize()` / `refresh()` | Loads both groups concurrently. |
