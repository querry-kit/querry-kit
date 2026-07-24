# `useModuleApi`

```ts
function useModuleApi<
  TMap extends EndpointMap,
  TEndpoint extends keyof TMap & string,
>(api: AxiosInstance, endpoint: TEndpoint): ModuleApi<TMap, TEndpoint>;
```

Creates typed CRUD methods for one endpoint. Endpoint names may have a leading slash; identifiers are URL-encoded before a request is made.

```ts
import { createApiClient, useModuleApi } from '@querry-kit/nuxt/api';
import type { EndpointMap } from '@querry-kit/nuxt/types';

type Book = { id: string; title: string };
type Endpoints = EndpointMap & {
  books: { item: Book; create: Pick<Book, 'title'>; update: Partial<Pick<Book, 'title'>> };
};

const books = useModuleApi<Endpoints, 'books'>(createApiClient({ apiBaseUrl: '/api-origin' }), 'books');
const response = await books.query({ page: 1, perPage: 25 });
```

| Method | Request | Response data |
| --- | --- | --- |
| `query(query?)` | `GET /endpoint` | `PaginatedResponse<TItem>` |
| `get(id, query?)` | `GET /endpoint/:id` | `TItem` |
| `findById(id, query?)` | `GET /endpoint/find-by-id/:id` | `TItem` |
| `count(query?)` | `GET /endpoint/count` | `number` |
| `create(data, query?)` | `POST /endpoint` | `TItem` |
| `update(id, data, query?)` | `PATCH /endpoint/:id` | `TItem` |
| `delete(id, query?)` | `DELETE /endpoint/:id` | `TItem` |

Every method returns an `AxiosResponse`. Query payloads are encoded through [`serializeQuery`](/docs/nuxt/api/utils/serialize-query).
