# `EndpointMap`

```ts
type EndpointMap = Record<string, EndpointDefinition>;
```

Maps endpoint names to [`EndpointDefinition`](/docs/nuxt/api/types/endpoint-definition) contracts. Use it as the first generic of [`useModuleApi`](/docs/nuxt/api/api/use-module-api).

```ts
type Endpoints = {
  books: EndpointDefinition<Book, CreateBook, UpdateBook>;
  authors: EndpointDefinition<Author>;
};
```
