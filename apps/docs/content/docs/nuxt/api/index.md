---
description: 'API overview for @querry-kit/nuxt.'
---

# API Reference

`@querry-kit/nuxt` exposes framework-neutral runtime primitives. Applications provide their own Axios instance, authentication, routing, storage, endpoint map, and visual components.

```ts
import { createApiClient, useModuleApi } from '@querry-kit/nuxt/api';
import { useTable } from '@querry-kit/nuxt/table';
import { useAutocomplete } from '@querry-kit/nuxt/autocomplete';
import type { EndpointMap, TableColumnInput } from '@querry-kit/nuxt/types';
```

## Main Areas

| Area                | Use for                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| API client          | Creating a Query Kit-aware Axios client with current token, timezone, source, and tenant-host resolution.   |
| Resource API        | Typed `query`, `get`, `findById`, `count`, `create`, `update`, and `delete` methods for one endpoint.       |
| `useTable`          | Remote pagination, fields, filtering, sorting, persistence, URL-page syncing, and stale-request protection. |
| `useAutocomplete`   | Combining selected resources with search results without duplicate identities.                              |
| Utilities and types | Query serialization, filter/order conversion, endpoint contracts, and headless UI metadata.                 |

## Public Imports

| Import                          | Contents                                                         |
| ------------------------------- | ---------------------------------------------------------------- |
| `@querry-kit/nuxt`              | Re-exports all public runtime functions.                         |
| `@querry-kit/nuxt/api`          | `createApiClient`, `useModuleApi`, and client types.             |
| `@querry-kit/nuxt/table`        | `useTable`; its options type is exported through `./types`.       |
| `@querry-kit/nuxt/autocomplete` | `useAutocomplete` and `UseAutocompleteOptions`.                  |
| `@querry-kit/nuxt/types`        | Endpoint, response, table, persistence, and route-ref contracts. |
| `@querry-kit/nuxt/utils`        | Serialization and Query Kit state helpers.                       |

## Reference groups

Each reference group is kept on one page, so related types and functions can be read together.

- [API](/docs/nuxt/api/api): Axios client and endpoint methods
- [Autocomplete](/docs/nuxt/api/autocomplete): autocomplete options and composable
- [Table](/docs/nuxt/api/table): table options and composable
- [Types](/docs/nuxt/api/types): endpoint, response, table, persistence, and route contracts
- [Utils](/docs/nuxt/api/utils): serialization and Query Kit state helpers

Before wiring a composable, confirm the application backend implements the [controller contract](/docs/nuxt/guide/controller-contract).
