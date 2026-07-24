---
description: 'Reusable NestJS parameter and DTO property decorators.'
---

# Decorators

The decorators subpath provides reusable OpenAPI metadata for common route parameters and DTO properties. These decorators affect the generated Swagger/OpenAPI document; they do **not** parse a request, validate an ID, or change a controller response at runtime.

```ts
import { ApiParamId, ApiPropertyCreatedAt, ApiPropertyId, ApiPropertyUpdatedAt } from '@querry-kit/nest/decorators';
```

## At a Glance

| Decorator | Target | What it adds |
| --- | --- | --- |
| `@ApiParamId()` | Controller method | A UUID-shaped route parameter in Swagger. |
| `@ApiPropertyId()` | DTO property | An ID description and UUID example in the DTO schema. |
| `@ApiPropertyCreatedAt()` | DTO property | A default description for a creation timestamp. |
| `@ApiPropertyUpdatedAt()` | DTO property | A default description for an update timestamp. |

All four accept Swagger options, so an application can override the defaults where its API uses a different format, description, or example.

## `@ApiParamId()`

Use `ApiParamId` on a route handler with an ID parameter. It adds an `ApiParam` entry with `type: string` and `format: uuid` to Swagger. The parameter name defaults to `id`.

```ts
@Get(':id')
@ApiParamId({ description: 'User ID', name: 'id' })
findById(@Param('id') id: string) {}
```

This only documents the expected parameter. Use a Nest pipe such as `ParseUUIDPipe` when the route parameter also needs runtime validation:

```ts
@Get(':id')
@ApiParamId()
findById(@Param('id', new ParseUUIDPipe()) id: string) {}
```

For routes with another parameter name, pass that name explicitly so the Swagger entry matches the route:

```ts
@Get(':userId')
@ApiParamId({ name: 'userId', description: 'User UUID' })
findById(@Param('userId') userId: string) {}
```

## `@ApiPropertyId()`

Use `ApiPropertyId` for a DTO field that represents a resource ID. It sets a default description of “The ID of the item.” and a UUID example generated with `crypto.randomUUID()`.

```ts
class UserDTO {
  @ApiPropertyId()
  id!: string;
}
```

Pass regular `ApiProperty` options to replace either default. This is useful when an ID is not a UUID or needs a stable example in generated documentation:

```ts
class LegacyUserDTO {
  @ApiPropertyId({
    description: 'Legacy numeric user ID',
    example: '42',
  })
  id!: string;
}
```

## `@ApiPropertyCreatedAt()` and `@ApiPropertyUpdatedAt()`

Use these property decorators for the conventional timestamps on a response DTO. They are small shortcuts around `@ApiProperty()` with helpful default descriptions:

- `ApiPropertyCreatedAt` describes when the item was created.
- `ApiPropertyUpdatedAt` describes when the item was last updated.

```ts
class UserDTO {
  @ApiPropertyId()
  id!: string;

  @ApiPropertyCreatedAt()
  createdAt!: Date;

  @ApiPropertyUpdatedAt()
  updatedAt!: Date;
}
```

They do not set values or manage timestamps in the database. Set `format`, `example`, `required`, or the description through normal `ApiProperty` options when the API contract needs more detail:

```ts
@ApiPropertyCreatedAt({ format: 'date-time', example: '2026-07-24T10:30:00.000Z' })
createdAt!: Date;
```

## Related Controller Decorators

The following decorators are exported from other focused subpaths. They have different responsibilities and are documented on their corresponding API pages:

| Decorator | What it does |
| --- | --- |
| `@ApiResourceQuery()` | Documents common list query parameters (`fields`, pagination, Prisma query options) and the related HTTP 400 response. |
| `@ApiPaginatedResponse({ model })` | Documents an `{ items, meta }` response whose items use the supplied DTO model. |
| `@ApiErrorResponses()` | Adds configured common error responses and examples to Swagger. |
| `@ApiFieldsQuery()` | Documents a `fields` query parameter and its invalid-fields HTTP 400 response. |
| `@FieldsQuery(DTO)` | Reads, parses, and validates `request.query.fields` at runtime, then injects the resulting projection into a controller parameter. |
| `@CheckPolicies(...)` | Stores policy handlers as Nest metadata for `PoliciesGuard` to evaluate at runtime. |

Read [OpenAPI Decorators](/docs/nest/api/openapi) for the resource-query and response decorators, [Fields](/docs/nest/api/fields) for `ApiFieldsQuery` and `FieldsQuery`, and [CASL](/docs/nest/api/casl) for `CheckPolicies`.
