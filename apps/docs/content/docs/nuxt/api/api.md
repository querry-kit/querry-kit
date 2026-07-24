# API

These exports create and use a typed Query Kit REST client. Import them from `@querry-kit/nuxt/api` (or from the package root).

## `ApiVersion`

```ts
type ApiVersion = 'v1';
```

The API path version accepted by `createApiClient`. The current public contract supports only `v1`, which produces an `/api/v1` base path.

## `CreateApiClientOptions`

```ts
interface CreateApiClientOptions {
  apiBaseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
  resolveBaseUrl?: (apiBaseUrl: string) => string;
  requestSource?: string;
  getTimezone?: () => string | undefined;
}
```

Configuration owned by the consuming application when it creates a Query Kit Axios client.

| Property | Required | Purpose |
| --- | --- | --- |
| `apiBaseUrl` | Yes | Public API origin, with or without a trailing slash. |
| `getToken` | No | Resolves the current bearer token for every request. No returned value means no `Authorization` header. |
| `resolveBaseUrl` | No | Rewrites the origin before the `/api/v1` path is added, for example for a tenant-aware host. |
| `requestSource` | No | Value for the `Request-Source` header; defaults to `web`. |
| `getTimezone` | No | Resolves the `Timezone` header. The browser timezone is used when it is omitted. |

## `createApiClient`

```ts
function createApiClient(
  options: CreateApiClientOptions,
  version?: ApiVersion,
): AxiosInstance;
```

Creates an Axios instance with a base URL of `<resolved origin>/api/v1`. It does not read Nuxt runtime configuration, stores, cookies, or router state.

```ts
const api = createApiClient({
  apiBaseUrl: 'https://api.example.com',
  getToken: () => session.value?.accessToken ?? null,
  requestSource: 'admin',
});
```

Before each request, the client sets `Request-Source`, resolves a timezone, and obtains a fresh token. Pass `resolveBaseUrl` when the origin must change per request context.

## `useModuleApi`

```ts
function useModuleApi<
  TMap extends EndpointMap,
  TEndpoint extends keyof TMap & string,
>(api: AxiosInstance, endpoint: TEndpoint): ModuleApi<TMap, TEndpoint>;
```

Creates typed CRUD methods for one endpoint. Endpoint names may have a leading slash; identifiers are URL-encoded before a request is made.

```ts
type Book = { id: string; title: string };
type Endpoints = EndpointMap & {
  books: { item: Book; create: Pick<Book, 'title'>; update: Partial<Pick<Book, 'title'>> };
};

const books = useModuleApi<Endpoints, 'books'>(api, 'books');
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

Every method returns an `AxiosResponse`. Query payloads are encoded through `serializeQuery`.

## Query Kit compatibility

The supported list response is:

```ts
type PaginatedResponse<T> = {
  items: T[];
  meta: { itemCount: number; pageCount: number };
};
```

| Parameter | Shape emitted by this package |
| --- | --- |
| `page`, `perPage` | Pagination numbers |
| `where` | JSON string of a nested Query Kit condition |
| `orderBy` | JSON string of nested ascending/descending rules |
| `fields` | Compact field grammar, for example `id,title,author{name}` |
| `include` | Nested `qs` payload, for example `include[author]=true` |

`where` and `orderBy` are serialized as JSON strings and encoded with `qs`. The `fields` parameter uses the existing Query Kit selection grammar. The list response must use `items`, not `data`, and provide `meta.itemCount` and `meta.pageCount`.
