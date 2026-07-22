---
layout: home

hero:
  name: Querry Kit
  text: From relational Nest APIs to useful Nuxt data screens.
  tagline: Three focused libraries and one complete, Prisma-backed reference application.
  image:
    src: /logo/querry-kit-logo.svg
    alt: Querry Kit logo
  actions:
    - theme: brand
      text: Explore Workboard
      link: '#workboard'
    - theme: alt
      text: GitHub organization
      link: https://github.com/querry-kit

features:
  - title: Nest API foundations
    details: 'Resource queries, response projection, pagination, DTO metadata and OpenAPI come from @querry-kit/nest.'
  - title: Headless Nuxt data flow
    details: '@querry-kit/nuxt owns typed REST clients and durable table state without prescribing a visual component library.'
  - title: Ready-made table controls
    details: '@querry-kit/nuxt-ui provides the toolbar, filters, sorting, column preferences and pagination around any Nuxt UI table.'
---

<section id="libraries" class="repository-section">
<h2>Three libraries, one implementation path</h2>
<p>Workboard deliberately uses the current three-package architecture: one Nest API, one Nuxt web application and no compatibility packages.</p>

<div class="repository-grid three-columns">
<article class="repository-card"><div><h3>@querry-kit/nest</h3><p>Build documented Nest resources with DTO-backed field selection, relation includes, pagination and response projection.</p><ul><li><code>ResourceQuery</code> for list and detail flows</li><li><code>QueryTransformPipe</code> and fields validation</li><li>Swagger metadata for usable API docs</li></ul></div><div class="repository-actions"><a href="https://github.com/querry-kit/nest">GitHub</a><a href="https://querry-kit.github.io/nest/">Docs</a></div></article>
<article class="repository-card"><div><h3>@querry-kit/nuxt</h3><p>Keep API clients and table mechanics typed, portable and independent of a specific Nuxt component suite.</p><ul><li><code>createApiClient</code> for versioned API access</li><li><code>useModuleApi</code> for typed resource methods</li><li><code>useTable</code> for query and persistence state</li></ul></div><div class="repository-actions"><a href="https://github.com/querry-kit/nuxt">GitHub</a><a href="https://querry-kit.github.io/nuxt/">Docs</a></div></article>
<article class="repository-card"><div><h3>@querry-kit/nuxt-ui</h3><p>Add a polished, customizable control layer to a Nuxt UI data table.</p><ul><li>Toolbar with filtering and sorting</li><li>Persisted column order and visibility</li><li>Localized pagination components</li></ul></div><div class="repository-actions"><a href="https://github.com/querry-kit/nuxt-ui">GitHub</a><a href="https://querry-kit.github.io/nuxt-ui/">Docs</a></div></article>
</div>
</section>

<section id="workboard" class="example-section">
<h2>Workboard reference application</h2>
<p>One API and one web workspace, backed by PostgreSQL, a Prisma schema and meaningful domain relations.</p>

<div class="example-grid one-column">
<article class="example-card"><p class="example-kicker">Delivery operations</p><h3>Workboard</h3><p>A product team organizes workspaces, projects and tasks. Members live in workspaces; labels are shared by many tasks.</p><div class="relation-flow"><span>Workspace</span><b>→</b><span>Project</span><b>→</b><span>Task</span><b>↔</b><span>Label</span></div><ul><li>Prisma models, PostgreSQL Compose setup and an idempotent seed</li><li>Nest modules, DTOs, Query Kit projections and Swagger</li><li>Nuxt table state, toolbar and pagination</li></ul><p class="example-path"><code>examples/workboard/{api,web}</code></p></article>
</div>

<div class="run-panel"><div><h3>Run the stack</h3><p>Local package links exercise the actual three library checkouts.</p></div><pre><code>pnpm install
cd examples/workboard/api && cp .env.example .env
docker compose up -d && pnpm db:push && pnpm db:seed
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev</code></pre></div>
</section>
