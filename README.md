# Querry Kit

Composable, type-safe query tooling for NestJS APIs.

Querry Kit provides focused open-source packages for parsing and validating
queries, selecting response fields, resolving relation includes, normalizing
request data, and reducing repetitive API infrastructure code.

## Organization landing page

The Querry Kit GitHub organization landing page is built with VitePress and
published through GitHub Pages:

- Website: <https://querry-kit.github.io/querry-kit/>
- Organization: <https://github.com/querry-kit>

It presents Querry Kit as composable, type-safe query tooling for NestJS APIs
and links the individual package repositories with short descriptions.

## Packages

### [`@querry-kit/nest-util`](https://github.com/querry-kit/nest-util)

General-purpose NestJS utilities for:

- Query value parsing
- Nested query object creation
- Request body normalization
- Object diffs
- Validation error mapping
- Swagger decorators and response helpers

### [`@querry-kit/nest-fields-query`](https://github.com/querry-kit/nest-fields-query)

Field projection utilities for:

- Parsing nested `fields` expressions
- Validating projections against DTO schemas
- Building relation includes
- Projecting API response objects
- Generating schemas from Swagger-decorated DTOs

## Design goals

- Type-safe APIs
- Small and focused packages
- Framework-friendly integration
- Minimal repetitive controller code
- Predictable query behavior
