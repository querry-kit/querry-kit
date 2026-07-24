# `EndpointDefinition`

```ts
interface EndpointDefinition<
  TItem = unknown,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
> {
  item: TItem;
  create: TCreate;
  update: TUpdate;
}
```

Associates one endpoint with its returned resource and mutation payloads. [`useModuleApi`](/docs/nuxt/api/api/use-module-api) infers its method arguments and response data from this contract.

```ts
import type { EndpointDefinition } from '@querry-kit/nuxt/types';

type BookEndpoint = EndpointDefinition<Book, CreateBook, UpdateBook>;
```
