# `useAutocomplete`

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
