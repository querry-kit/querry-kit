# `TableColumn`

```ts
type TableColumn<
  TItem,
  TMeta extends object = Record<string, unknown>,
> = TableColumnInput<TItem, TMeta> & {
  id: string;
};
```

A visible table column with a resolved identifier. `fields` lists nested properties required for rendering; `useTable` turns them into the Query Kit fields grammar.

```ts
const columns: Ref<readonly TableColumn<Book, { label: string }>[]> = ref([
  { id: 'title', label: 'Title' },
  { id: 'author', fields: ['name'], label: 'Author' },
]);
```
