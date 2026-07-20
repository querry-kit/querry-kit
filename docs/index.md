---
layout: home

hero:
  name: Querry Kit
  text: Type-safe query tooling for NestJS APIs.
  tagline: Focused packages for parsing requests, validating field projections, resolving includes, shaping responses, and removing repetitive API plumbing.
  image:
    src: /logo/querry-kit-logo.svg
    alt: Querry Kit logo
  actions:
    - theme: brand
      text: View repositories
      link: '#repositories'
    - theme: alt
      text: GitHub organization
      link: https://github.com/querry-kit

features:
  - title: Composable packages
    details: Install only the query utilities your API needs, with small package boundaries and framework-friendly APIs.
  - title: DTO-backed behavior
    details: Keep field selection, relation includes, validation, and response shaping aligned with your public DTO model.
  - title: NestJS focused
    details: Built around common NestJS controller, validation, Swagger, and request normalization workflows.
---

<section id="repositories" class="repository-section">
<h2>Repositories</h2>
<p>
Querry Kit is organized as small, focused open-source repositories. Each package handles one part of predictable query handling for NestJS APIs.
</p>

<div class="repository-grid">
<article class="repository-card">
<div>
<h3>@querry-kit/nest-util</h3>
<p>
General-purpose NestJS utilities for query parsing, nested query object creation, request body normalization, object diffs, validation error mapping, and Swagger helpers.
</p>
<ul>
<li>Parse and normalize request query values</li>
<li>Map validation errors into stable API responses</li>
<li>Reuse decorators and response helpers in Nest controllers</li>
</ul>
</div>
<div class="repository-actions">
<a href="https://github.com/querry-kit/nest-util">GitHub</a>
<a href="https://querry-kit.github.io/nest-util/">Docs</a>
</div>
</article>

<article class="repository-card">
<div>
<h3>@querry-kit/nest-fields-query</h3>
<p>
DTO-backed field projection utilities for parsing nested fields expressions, validating projections, deriving relation includes, and shaping API responses.
</p>
<ul>
<li>Parse nested <code>fields</code> query expressions</li>
<li>Validate projections against DTO schemas</li>
<li>Project response objects and build relation includes</li>
</ul>
</div>
<div class="repository-actions">
<a href="https://github.com/querry-kit/nest-fields-query">GitHub</a>
<a href="https://querry-kit.github.io/nest-fields-query/">Docs</a>
</div>
</article>
</div>
</section>
