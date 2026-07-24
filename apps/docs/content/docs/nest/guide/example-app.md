---
description: 'A complete, copyable NestJS resource API assembled from @querry-kit/nest building blocks.'
---

# Complete API Example

This example uses books, authors, and tags to show a complete resource API without relying on a separate repository example. The individual snippets are designed to be copied into an existing Nest application and adapted to its Prisma models and authorization rules.

## What It Shows

- `ResourceQuery.query` for paginated list endpoints.
- `ResourceQuery.findById` for detail endpoints.
- DTO-backed optional `fields` validation and projection on every controller route.
- paginated envelope projection for `items` and `meta`.
- generated includes for `author`, nested `author.books`, and `tags`.
- `QueryService` with an authorization-aware `accessibleWhere` resolver.
- `CheckPolicies`, `PoliciesGuard`, `ApiResourceQuery`, `ApiPaginatedResponse`, `ApiErrorResponses`, and `ApiParamId`.
- `QueryTransformPipe`, `FieldsExceptionFilter`, and Swagger setup.
- a complete CRUD controller with `GET`, `POST`, `PATCH`, and `DELETE`.

## DTOs

Expose only the fields that clients may select. `@ApiProperty` metadata gives `Fields` the schema it uses to validate and project the `fields` parameter.

```ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthorDTO {
  @Expose()
  @ApiProperty({ example: 'author-ada' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;
}

export class BookDTO {
  @Expose()
  @ApiProperty({ example: 'book-1' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Practical Nest Queries' })
  title!: string;

  @Expose()
  @ApiProperty({ type: () => AuthorDTO, required: false })
  author?: AuthorDTO;

  static fromModel(book: BookModel): BookDTO {
    return Object.assign(new BookDTO(), {
      id: book.id,
      title: book.title,
      author: book.author && Object.assign(new AuthorDTO(), book.author),
    });
  }
}
```

## Service

Extend `QueryService` with the generated Prisma delegate and a type map for the model. If the endpoint is authorization-aware, provide the CASL subject and accessibility resolver here.

```ts
import { Injectable } from '@nestjs/common';
import { createCaslAccessibleWhere, QueryService, type BaseDelegateTypeMap } from '@querry-kit/nest';

interface BookTypeMap extends BaseDelegateTypeMap {
  select: Prisma.BookSelect;
  include: Prisma.BookInclude;
  whereInput: Prisma.BookWhereInput;
  orderByWithRelationInput: Prisma.BookOrderByWithRelationInput;
  whereUniqueInput: Prisma.BookWhereUniqueInput;
  scalarFieldEnum: Prisma.BookScalarFieldEnum;
  aggregateInputType: Prisma.AggregateBook;
}

@Injectable()
export class BooksService extends QueryService<typeof PrismaService.prototype.book, BookTypeMap> {
  constructor(prisma: PrismaService) {
    super(prisma.book, {
      subject: 'Book',
      accessibleWhere: createCaslAccessibleWhere<AppAbility, 'Book'>({ action: 'read' }),
    });
  }
}
```

The [CASL reference](/docs/nest/api/casl) shows the equivalent setup for enum-backed actions and write rules.

## Controller

Use `ResourceQuery` for read routes. It prepares includes, calls the service, maps models to DTOs, and applies the requested field projection.

```ts
@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiResourceQuery()
  @ApiPaginatedResponse({ model: BookDTO })
  async query(@Req() req: AuthenticatedRequest, @Query() query: QueryDTO<BookTypeMap>) {
    return ResourceQuery.query({
      service: this.booksService,
      query,
      schema: BookDTO,
      ability: req.ability,
      include: { author: true },
      map: (book) => BookDTO.fromModel(book),
    });
  }

  @Get(':id')
  @ApiParamId({ description: 'Book ID' })
  @ApiFieldsQuery()
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Query() query: FindByIdDTO<BookTypeMap>) {
    return ResourceQuery.findById({
      service: this.booksService,
      id,
      query,
      schema: BookDTO,
      ability: req.ability,
      map: (book) => BookDTO.fromModel(book),
    });
  }
}
```

For create, update, and delete routes, call `prepareFieldsQuery` before the domain operation and `Fields.project` on the mapped DTO. The [CRUD Controller](/docs/nest/guide/crud-controller) guide covers that shape.

## Routes

Query published books:

```sh
curl -g 'http://localhost:3000/books?fields=id,title,author{name},tags{name}'
```

Find one book and request nested author books:

```sh
curl -g 'http://localhost:3000/books/book-1?fields=id,title,author{name,books{title}}'
```

Project a paginated response envelope:

```sh
curl -g 'http://localhost:3000/books?fields=items{id,title},meta{page,perPage,itemCount,pageCount}'
```

Create a book:

```http
POST /books
Content-Type: application/json

{
  "title": "Composable Nest APIs",
  "isbn": "978-0000000004",
  "authorId": "author-ada",
  "tagIds": ["tag-nest", "tag-api"]
}
```

Delete a book:

```http
DELETE /books/book-2?fields=id,title
```

Update a book:

```http
PATCH /books/book-2
Content-Type: application/json

{
  "title": "Typed Prisma Services, 2nd Edition",
  "tagIds": ["tag-prisma", "tag-api"]
}
```

Every route accepts `fields`. Unknown DTO fields return HTTP 400 during fields validation. Invalid Prisma `select` and `include` keys should likewise be reported as HTTP 400 by the service layer.

## Bootstrap

Register `QueryTransformPipe` and `FieldsExceptionFilter` once in the application bootstrap. The complete [NestJS `main.ts`](/docs/nest/guide/main-bootstrap) example includes validation and Swagger configuration.

With those pieces in place, the API remains application-owned: replace `BookDTO`, `BooksService`, the Prisma types, and the ability with the equivalents from your own domain.
