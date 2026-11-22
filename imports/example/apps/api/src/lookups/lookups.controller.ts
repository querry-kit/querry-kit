import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { labelLookupPageSchema, lookupQuerySchema, projectLookupPageSchema } from '@workboard/contracts';

import { createWorkboardAbility } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';
import { type AuthenticatedRequest, DemoSessionGuard } from '../demo/demo-session.guard.js';
import { describeRead } from '../query/query-docs.js';
import { readQuery } from '../query/query-parser.js';
import { createScopedQuery } from '../query/scoped-query.js';

/** Supplies bounded, scoped options to the frontend, including autocomplete hydration. */
@ApiTags('Lookups')
@ApiCookieAuth('workboard_demo')
@UseGuards(DemoSessionGuard)
@Controller()
export class LookupsController {
  /** Receives the application's read delegates. */
  constructor(private readonly database: DatabaseService) {}

  /**
   * Queries project options with the same pagination envelope as the task list.
   *
   * @see https://querry-kit.github.io/querry-kit/docs/nuxt/guide/autocomplete/
   */
  @Get('projects')
  @describeRead(lookupQuerySchema, projectLookupPageSchema)
  async projects(@Req() request: AuthenticatedRequest) {
    const input = readQuery(request, lookupQuerySchema);
    if (input.where?.displayName !== undefined) throw new BadRequestException('Projects do not have a display name.');
    const ability = createWorkboardAbility(request.demoSession);
    const result = await createScopedQuery(this.database.project, 'Project').query(
      { where: input.where, page: input.page, perPage: Math.min(input.perPage, 100), orderBy: { id: 'asc' } },
      ability,
    );
    return projectLookupPageSchema.parse({ items: result.items, meta: result.pageMeta });
  }

  /** Queries only the labels reachable from tasks in the active account's scope. */
  @Get('labels')
  @describeRead(lookupQuerySchema, labelLookupPageSchema)
  async labels(@Req() request: AuthenticatedRequest) {
    const input = readQuery(request, lookupQuerySchema);
    if (input.where?.title !== undefined) throw new BadRequestException('Labels do not have a title.');
    const ability = createWorkboardAbility(request.demoSession);
    const result = await createScopedQuery(this.database.label, 'Label').query(
      { where: input.where, page: input.page, perPage: Math.min(input.perPage, 100), orderBy: { id: 'asc' } },
      ability,
    );
    return labelLookupPageSchema.parse({ items: result.items, meta: result.pageMeta });
  }
}
