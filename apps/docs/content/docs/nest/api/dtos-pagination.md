---
description: 'Request DTOs, pagination DTOs, validation, transformation, and response shapes.'
---

# DTOs and Pagination

The DTOs are intended for app-level controllers. They include Swagger metadata and class-validator/class-transformer decorators where runtime validation is meaningful.

## PageOptionsDTO

`PageOptionsDTO` defaults to `page = 1` and `perPage = 10`. Both values are transformed to numbers and validated as integers.

```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
);
```

The supported pagination range is:

```ts
page >= 1;
perPage >= 1;
perPage <= 1000;
```

## Query DTOs

Use the DTO matching the service method:

```ts
FindOneDTO<ProjectTypeMap>;
FindManyDTO<ProjectTypeMap>;
FindByIdDTO<ProjectTypeMap>;
FindUniqueDTO<ProjectTypeMap>;
AggregateDTO<ProjectTypeMap>;
CountDTO<ProjectTypeMap>;
QueryDTO<ProjectTypeMap>;
```

`QueryDTO` and `FindByIdDTO` expose `fields?: string`. `ResourceQuery` and `prepareFieldsQuery` use that optional value to build relation includes and project responses.

`QueryDTO` also exposes the Prisma-style query inputs used by resource list endpoints: `select`, `include`, `where`, `orderBy`, `cursor`, and `distinct`, plus `page` and `perPage` from `PageOptionsDTO`. Use `ApiResourceQuery()` to document the public query parameter contract in OpenAPI metadata.

## Service Shape

`QueryService.query` returns a service-level shape:

```ts
type Paginated<Project> = {
  items: Project[];
  pageMeta: PageMetaDTO;
};
```

Controllers usually return a public DTO shape:

```ts
return new PaginatedDTO(projectDtos, pageMeta);
```

`PageMetaDTO` computes `pageCount`, `hasPrevPage`, and `hasNextPage` from `itemCount`, `page`, and `perPage`.

`ResourceQuery.query` supports both item shorthand and envelope projection:

```txt
fields=id,name
fields=items{id,name},meta{page,perPage,itemCount,pageCount}
```

## Zod 4 schemas

Install Zod only when using the dedicated `@querry-kit/nest/zod` subpath:

```sh
pnpm add zod@^4
# Optional NestJS integration:
pnpm add nestjs-zod
```

Zod, `class-validator`, and `class-transformer` are optional peers. Use the dedicated
`core` and `zod` subpaths to avoid loading either class-based validation dependency.
These schemas work independently of Express or Fastify and do not configure either adapter.

The main entrypoint and existing `dto`, `pagination`, `decorators`, and `query-service`
entrypoints retain decorated DTOs and require their class-based dependencies.
`ValidationUtil` requires `class-validator`. The `core` entrypoint exports `QueryService`,
`ResourceQuery`, `PageMeta`, fields helpers, pipes, and object/query utilities, with
no runtime imports of `class-validator` or `class-transformer`.

Core services calculate the same pagination metadata; `ResourceQuery` returns the
same `{ items, meta }` envelope as plain objects. Legacy entrypoints keep their
`PageMetaDTO` and `PaginatedDTO` instances and serialization decorators.

```ts
import { QueryService, ResourceQuery, parseQueryObject } from '@querry-kit/nest/core';
import { QuerySchema } from '@querry-kit/nest/zod';
```

Use the core imports throughout a Zod application; importing a helper from the main
entrypoint also loads its legacy DTO exports.

Available exports: `QuerySchema`, `FindOneSchema`, `FindManySchema`, `FindByIdSchema`,
`FindUniqueSchema`, `CountSchema`, `AggregateSchema`, `PageOptionsSchema`,
`PageMetaSchema`, and `createPaginatedSchema(itemSchema)`.

```ts
import { z } from 'zod';

import { QuerySchema, createPaginatedSchema } from '@querry-kit/nest/zod';

const UserQuerySchema = QuerySchema.extend({
  where: z.object({ name: z.string().optional() }).optional(),
});
type UserQuery = z.infer<typeof UserQuerySchema>;

const query: UserQuery = UserQuerySchema.parse({ page: '2', where: { name: 'Ada' } });
const UserPageSchema = createPaginatedSchema(z.object({ id: z.string(), name: z.string() }));
const response = UserPageSchema.parse({
  items: [],
  meta: { page: 1, perPage: 10, itemCount: 0, pageCount: 0, hasPrevPage: false, hasNextPage: false },
});
```

Pagination defaults to `page = 1`, `perPage = 10`, with integer bounds `page >= 1`
and `1 <= perPage <= 1000`. `take >= 1` and `skip >= 0` are optional integers.
Numeric query strings are converted; empty strings, null, booleans, arrays,
fractions and non-finite numbers are rejected. `fields` is an optional string.
Unknown top-level keys are stripped. Response metadata requires numbers and is
validated without computing or cross-checking pagination totals.

Prisma-specific fields use `z.unknown().optional()`: the base schemas do **not**
validate Prisma inputs or infer generated Prisma types. Extend every exposed
Prisma field with an application-specific schema before treating it as validated.
Like the existing DTO, `FindUniqueSchema` does not require `where`; make it required
in your extension when the endpoint needs it.

For [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod), wrap the schema in a DTO
and apply its validation pipe:

```ts
import { Controller, Get, Query } from '@nestjs/common';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';

import { PageOptionsSchema } from '@querry-kit/nest/zod';

/** Validated pagination request. */
class ListQueryDTO extends createZodDto(PageOptionsSchema) {}

/** Example pagination endpoint. */
@Controller('users')
class UsersController {
  /**
   * Returns validated pagination options for this example.
   *
   * @param {ListQueryDTO} query Validated request query.
   * @returns {ListQueryDTO} Parsed pagination options.
   */
  @Get()
  list(@Query(new ZodValidationPipe()) query: ListQueryDTO): ListQueryDTO {
    return query;
  }
}
```

Schemas do not decode JSON or dotted query keys. For nested transport values,
normalize with existing `parseQueryObject` from `@querry-kit/nest/core` (or your query
parser) **before** schema validation. For example, validate
`UserQuerySchema.parse(parseQueryObject(rawQuery))`. In NestJS, normalization must
run before `ZodValidationPipe`. Do not apply normalization blindly to scalar
`fields` strings such as `"123"`, which the generic parser converts to numbers.
