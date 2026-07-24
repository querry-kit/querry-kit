# `CreateApiClientOptions`

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

```ts
import type { CreateApiClientOptions } from '@querry-kit/nuxt/api';
```
