---
title: '@querry-kit/nuxt'
description: Typed API clients and portable remote state for Query Kit resource endpoints.
---

# Query Kit for Vue and Nuxt

`@querry-kit/nuxt` owns the typed client and durable remote state that sit between your Nuxt interface and a Query Kit resource API.

## Portable data primitives

- **Typed resource API** configures one Axios client and exposes typed list, detail, count, and mutation methods.
- **Headless remote tables** compose pagination, fields, filters, sorting, persistence, and stale-request protection without prescribing UI.
- **Selection-safe autocomplete** keeps selected resources available while searches change.
- **Explicit backend contract** makes the required controller routes and `{ items, meta }` response shape visible before integration.

<div class="not-prose mt-8 flex flex-wrap gap-3">
  <a class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-inverted" href="/docs/nuxt/guide/getting-started">Get started</a>
  <a class="rounded-md border border-default px-4 py-2 text-sm font-medium text-highlighted" href="/docs/nuxt/guide/controller-contract">Read the controller contract</a>
</div>
