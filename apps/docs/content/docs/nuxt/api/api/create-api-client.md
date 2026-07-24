# `createApiClient`

```ts
function createApiClient(
  options: CreateApiClientOptions,
  version?: ApiVersion,
): AxiosInstance;
```

Creates an Axios instance with a base URL of `<resolved origin>/api/v1`. It does not read Nuxt runtime configuration, stores, cookies, or router state.

```ts
import { createApiClient } from '@querry-kit/nuxt/api';

const api = createApiClient({
  apiBaseUrl: 'https://api.example.com',
  getToken: () => session.value?.accessToken ?? null,
  requestSource: 'admin',
});
```

Before each request, the client sets `Request-Source`, resolves a timezone, and obtains a fresh token. Pass `resolveBaseUrl` in the options when the origin must change per request context.
