# `isEqual`

```ts
function isEqual(left: unknown, right: unknown): boolean;
```

Performs a structural comparison of plain objects and arrays. Scalars are compared with `Object.is`; arrays are compared in order and object keys must match. The composables use it to avoid unnecessary reloads when reactive query state has not materially changed.
