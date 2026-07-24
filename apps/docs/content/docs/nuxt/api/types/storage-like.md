# `StorageLike`

```ts
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
```

The minimal persistence adapter accepted by `UseTableOptions.storage`. It is compatible with `localStorage`, but lets SSR or embedded applications provide a safer implementation.
