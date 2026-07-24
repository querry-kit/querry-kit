# `pathsToFieldsQuery`

```ts
function pathsToFieldsQuery(paths: Iterable<string>): string | undefined;
```

Builds Query Kit's compact `fields` grammar from dot-separated paths. Empty paths are ignored and no usable path returns `undefined`.

```ts
pathsToFieldsQuery(['id', 'title', 'author.name']);
// 'id,title,author{name}'
```
