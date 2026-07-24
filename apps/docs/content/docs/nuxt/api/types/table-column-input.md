# `TableColumnInput`

```ts
type TableColumnInput<
  TItem,
  TMeta extends object = Record<string, unknown>,
> = TMeta & {
  id?: string;
  fields?: string[];
};
```

A renderer-agnostic input column for [`useTable`](/docs/nuxt/api/table/use-table). Supply application-specific metadata through `TMeta`; the package keeps it intact without depending on a UI library. Omit `id` to exclude a conditional column from table selection and persistence.

```ts
type AppColumn = TableColumnInput<Book, { label: string; sortable?: boolean }>;
```
