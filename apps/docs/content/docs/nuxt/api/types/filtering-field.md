# `FilteringField`

```ts
interface FilteringField {
  id: string;
  field: string;
  type?: string;
  operator?: string;
  value?: unknown;
}
```

Describes one UI filter before it is converted to a Query Kit `where` payload. `field` supports dotted paths such as `author.name`; `operator` becomes the nested Query Kit operator when supplied.
