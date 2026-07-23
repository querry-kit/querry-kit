---
description: 'Complete CRUD controller example for @querry-kit/nest.'
---

# CRUD Controller

This controller shows a full resource shape with list, detail, create, update, and delete routes. Read endpoints use `ResourceQuery` so `fields`, Prisma-style includes, service calls, DTO mapping, and projection stay in one small pattern. Mutations use `prepareFieldsQuery` and `Fields.project` so optional `fields` works on every route without hiding domain-specific write logic.

```ts
@Controller('books')
@UseGuards(PoliciesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @CheckPolicies((ability) => ability.can(BookAction.Read, BookSubject))
  @ApiResourceQuery()
  @ApiPaginatedResponse({ model: BookDTO })
  async query(@Req() req: DemoRequest, @Query() query: QueryDTO<BookTypeMap>) {
    return ResourceQuery.query({
      service: this.booksService,
      query,
      schema: BookDTO,
      ability: req.ability,
      include: { author: true },
      map: (book) => BookDTO.fromModel(book),
    });
  }
}
```

## Service Contract

`ResourceQuery` expects read services with the same shape as `QueryService`:

```ts
service.query<TModel>(query, ability);
service.findById<TModel>(id, query, ability);
```

Create, update, and delete stay resource-specific because they usually contain domain rules, transactions, unique checks, and relation writes.
