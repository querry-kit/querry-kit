import { BadRequestException, Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  taskAggregateQuerySchema,
  taskAggregateSchema,
  taskGroupQuerySchema,
  taskGroupsSchema,
} from '@workboard/contracts';

import { createWorkboardAbility, type WorkboardAbility } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';
import { type AuthenticatedRequest, DemoSessionGuard } from '../demo/demo-session.guard.js';
import { describeRead } from '../query/query-docs.js';
import { readQuery } from '../query/query-parser.js';
import { createScopedQuery } from '../query/scoped-query.js';
import { checkTaskWhere } from './tasks.service.js';

/** Rejects recognized private fields wherever an operation could use them to derive public results. */
function checkOperands(ability: WorkboardAbility, keys: readonly string[]): void {
  for (const key of keys) {
    if (key !== '_all' && !ability.can('read', 'Task', key)) {
      throw new ForbiddenException(`Cannot compute results using ${key}.`);
    }
  }
}

/** Verifies all requested metric fields, excluding the dimension-free row count. */
function checkMetrics(ability: WorkboardAbility, selectors: Array<object | undefined>): void {
  for (const selector of selectors) if (selector) checkOperands(ability, Object.keys(selector));
}

/** Read-only server-side grouping and optional Workboard metrics. */
@ApiTags('Tasks')
@ApiCookieAuth('workboard_demo')
@UseGuards(DemoSessionGuard)
@Controller('tasks')
export class TaskGroupsController {
  /** Receives the same Prisma delegate used for list, detail and count. */
  constructor(private readonly database: DatabaseService) {}

  /**
   * Groups the entire authorized dataset, not the rows currently loaded by the browser.
   *
   * @see https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/
   * @see https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/grouping/
   */
  @Get('group-by')
  @describeRead(taskGroupQuerySchema, taskGroupsSchema)
  async groupBy(@Req() request: AuthenticatedRequest) {
    const input = readQuery(request, taskGroupQuerySchema);
    const ability = createWorkboardAbility(request.demoSession);
    checkTaskWhere(input.where, ability);
    checkOperands(ability, input.by);
    checkOperands(ability, Object.keys(input.having ?? {}));
    checkMetrics(ability, [input._count, input._sum, input._avg, input._min, input._max]);

    const orderBy = Array.isArray(input.orderBy) ? [...input.orderBy] : input.orderBy ? [input.orderBy] : [];
    const ordered = new Set<string>();
    for (const rule of orderBy) {
      const keys = Object.keys(rule);
      checkOperands(ability, keys);
      for (const key of keys) ordered.add(key);
    }
    for (const key of ordered) {
      if (!input.by.some(/** Checks that Prisma groups the order key. */ (group) => group === key)) {
        throw new BadRequestException('Order keys must also be grouping keys.');
      }
    }
    for (const key of input.by) {
      if (!ordered.has(key)) orderBy.push({ [key]: 'asc' });
    }

    // A scalar HAVING predicate must use a group key; aggregate HAVING may use a metric operand.
    for (const key of ['status', 'priority'] as const) {
      if (input.having?.[key] !== undefined && !input.by.includes(key)) {
        throw new BadRequestException('Scalar having filters must use a grouping key.');
      }
    }
    const cost = input.having?.internalCostCents;
    if (cost && !input.by.includes('internalCostCents')) {
      const scalarKeys = Object.keys(cost).filter(
        /** Separates scalar comparisons from aggregates. */ (key) => !key.startsWith('_'),
      );
      if (scalarKeys.length) throw new BadRequestException('Scalar having filters must use a grouping key.');
    }
    const result = await createScopedQuery(this.database.task, 'Task').groupBy({ ...input, orderBy }, ability);
    return taskGroupsSchema.parse(result);
  }

  /**
   * Computes metrics for the current account and branch filter.
   *
   * @see https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/
   * @see https://querry-kit.github.io/querry-kit/docs/nest/api/casl/
   */
  @Get('aggregate')
  @describeRead(taskAggregateQuerySchema, taskAggregateSchema)
  async aggregate(@Req() request: AuthenticatedRequest) {
    const input = readQuery(request, taskAggregateQuerySchema);
    const ability = createWorkboardAbility(request.demoSession);
    checkTaskWhere(input.where, ability);
    checkMetrics(ability, [input._count, input._sum, input._avg, input._min, input._max]);

    const result = await createScopedQuery(this.database.task, 'Task').aggregate(input, ability);
    return taskAggregateSchema.parse(result);
  }
}
