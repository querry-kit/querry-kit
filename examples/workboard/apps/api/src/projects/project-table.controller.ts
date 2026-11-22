import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { PageMeta } from '@querry-kit/nest/core';
import { projectTablePageSchema, projectTableQuerySchema, type ProjectTableQuery } from '@workboard/contracts';

import { taskOwnership } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';
import { DemoSessionGuard, type AuthenticatedRequest } from '../demo/demo-session.guard.js';
import { Prisma } from '../generated/prisma/client.js';
import { describeRead } from '../query/query-docs.js';
import { readQuery } from '../query/query-parser.js';

const orderColumns = { title: Prisma.sql`"title"`, slug: Prisma.sql`"slug"`, taskCount: Prisma.sql`"taskCount"` };
const comparisons = {
  equals: Prisma.sql`=`,
  not: Prisma.sql`<>`,
  lt: Prisma.sql`<`,
  lte: Prisma.sql`<=`,
  gt: Prisma.sql`>`,
  gte: Prisma.sql`>=`,
};
type CountPredicate = { taskCount: Partial<Record<keyof typeof comparisons, number>> };

/** Returns scoped, sortable aggregate counts for the Projects dashboard. */
@ApiTags('Projects')
@ApiCookieAuth('workboard_demo')
@UseGuards(DemoSessionGuard)
@Controller('projects')
export class ProjectTableController {
  /** Receives the same database as the project lookup and task list. */
  constructor(private readonly database: DatabaseService) {}

  /** Filters and sorts across matching projects before paginating. */
  @Get('table')
  @describeRead(projectTableQuerySchema, projectTablePageSchema)
  async list(@Req() request: AuthenticatedRequest) {
    const input = readQuery(request, projectTableQuerySchema);
    const owner = taskOwnership(request.demoSession);
    const taskScope = owner ? Prisma.sql`WHERE "ownerId" = ${owner.ownerId}` : Prisma.empty;
    const projectJoin = owner ? Prisma.sql`INNER JOIN` : Prisma.sql`LEFT JOIN`;
    const search = input.search
      ? Prisma.sql`WHERE strpos(lower(p.title), lower(${input.search})) > 0
                       OR strpos(lower(p.slug), lower(${input.search})) > 0`
      : Prisma.empty;
    const where = countFilter(input.where);
    const order = projectOrder(input.orderBy);
    const offset = (input.page - 1) * input.perPage;

    // WorkItem is the physical table name mapped to Task in Prisma.
    // The shared count relation both scopes regular accounts and preserves zero-task projects for the admin.
    const [result] = await this.database.$queryRaw<Array<{ items: unknown; itemCount: number }>>`
      WITH counts AS (
        SELECT "projectId", COUNT(*) AS "taskCount"
        FROM "WorkItem"
        ${taskScope}
        GROUP BY "projectId"
      ), projects AS (
        SELECT p.id, p.title, p.slug, COALESCE(c."taskCount", 0) AS "taskCount"
        FROM "Project" p ${projectJoin} counts c ON c."projectId" = p.id
        ${search}
      ), matching AS (
        SELECT * FROM projects WHERE ${where}
      )
      SELECT
        (SELECT COUNT(*)::integer FROM matching) AS "itemCount",
        COALESCE((
          SELECT jsonb_agg(page_rows ORDER BY ${order})
          FROM (SELECT * FROM matching ORDER BY ${order} LIMIT ${input.perPage} OFFSET ${offset}) page_rows
        ), '[]'::jsonb) AS items
    `;

    return projectTablePageSchema.parse({
      items: result.items,
      meta: new PageMeta({ pageOptions: input, itemCount: result.itemCount }),
    });
  }
}

/** Builds parameterized comparisons with the validated boolean operator. */
function countFilter(where: ProjectTableQuery['where']): Prisma.Sql {
  if (!where) return Prisma.sql`TRUE`;
  if ('AND' in where) return Prisma.join(where.AND.map(compareCounts), ' AND ');
  if ('OR' in where) return Prisma.join(where.OR.map(compareCounts), ' OR ');
  return compareCounts(where);
}

/** Combines the comparisons for a single task count predicate. */
function compareCounts({ taskCount }: CountPredicate): Prisma.Sql {
  const clauses = Object.entries(taskCount).map(
    /** Only the SQL token comes from the fixed map. The operand remains a bound parameter. */
    ([operator, value]) =>
      Prisma.sql`"taskCount" ${comparisons[operator as keyof typeof comparisons]} ${value}::bigint`,
  );
  return Prisma.sql`(${Prisma.join(clauses, ' AND ')})`;
}

/** Preserves multi-sort order and stabilizes pagination with a unique tie-breaker. */
function projectOrder(orderBy: ProjectTableQuery['orderBy']): Prisma.Sql {
  const rules = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
  const clauses = rules.map(
    /** Resolves the single validated sort field to an allowlisted column and direction. */
    (rule) => {
      const [[field, direction]] = Object.entries(rule);
      return Prisma.sql`${orderColumns[field as keyof typeof orderColumns]} ${direction === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`}`;
    },
  );
  return Prisma.join([...clauses, Prisma.sql`id ASC`]);
}
