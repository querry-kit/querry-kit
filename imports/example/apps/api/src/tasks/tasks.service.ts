import { ForbiddenException, Injectable } from '@nestjs/common';
import { ResourceQuery } from '@querry-kit/nest/core';
import { taskPageSchema, taskSchema, type TaskListQuery, type TaskWhere } from '@workboard/contracts';

import { type WorkboardAbility } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { createScopedQuery } from '../query/scoped-query.js';
import { checkProjection, projectTask, taskFields, taskInclude, type TaskRecord } from './task-projection.js';

/** Verifies query operands as well as projected fields, preventing indirect disclosure. */
export function checkTaskWhere(where: TaskWhere | undefined, ability: WorkboardAbility): void {
  if (!where) return;

  for (const [field, value] of Object.entries(where)) {
    if (field === 'AND' || field === 'OR') {
      for (const child of value as TaskWhere[]) checkTaskWhere(child, ability);
    } else if (!ability.can('read', 'Task', field)) {
      throw new ForbiddenException(`Cannot filter by ${field}.`);
    }
  }
}

/** Coordinates the permitted read paths without exposing arbitrary delegate inputs. */
@Injectable()
export class TasksService {
  /** Initializes the Query Kit service with the actual Prisma delegate and read scope. */
  constructor(private readonly database: DatabaseService) {}

  /**
   * Lists scoped tasks with a stable ID tie-breaker and shared output validation.
   *
   * @see https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/
   * @see https://querry-kit.github.io/querry-kit/docs/nest/concepts/fields/
   */
  async list(query: TaskListQuery, ability: WorkboardAbility) {
    checkProjection(query.fields, ability);
    checkTaskWhere(query.where, ability);
    const rules = Array.isArray(query.orderBy) ? query.orderBy : query.orderBy ? [query.orderBy] : [];
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [];
    for (const rule of rules) {
      for (const [field, direction] of Object.entries(rule)) {
        if (!ability.can('read', 'Task', field)) throw new ForbiddenException(`Cannot sort by ${field}.`);
        if (field === 'project') orderBy.push({ project: { title: direction } });
        else if (field === 'owner') orderBy.push({ owner: { profile: { displayName: direction } } });
        else if (field === 'labels') orderBy.push({ labels: { _count: direction } });
        else orderBy.push({ [field]: direction });
      }
    }
    if (!rules.some(/** Checks for an explicit ID tie-breaker. */ (rule) => rule.id)) orderBy.push({ id: 'asc' });

    const result = await ResourceQuery.query({
      service: createScopedQuery(this.database.task, 'Task'),
      ability,
      query: { ...query, orderBy },
      schema: taskFields,
      include: taskInclude,
      /** Maps scoped rows before Query Kit applies the selected fields. */
      map: (row: TaskRecord) => projectTask(row, ability),
    });
    return taskPageSchema.parse(result);
  }

  /** Uses the same projection and row scope for both public detail routes. */
  async detail(id: string, query: { fields?: string }, ability: WorkboardAbility) {
    checkProjection(query.fields, ability);
    const result = await ResourceQuery.findById({
      service: createScopedQuery(this.database.task, 'Task'),
      ability,
      id,
      query,
      schema: taskFields,
      include: taskInclude,
      /** Selects permitted fields on the scoped record before projection. */
      map: (row: TaskRecord) => projectTask(row, ability),
    });
    return taskSchema.parse(result);
  }

  /** Returns a JSON integer matching the typed Nuxt count client. */
  async count(where: TaskWhere | undefined, ability: WorkboardAbility): Promise<number> {
    checkTaskWhere(where, ability);
    return createScopedQuery(this.database.task, 'Task').count({ where }, ability);
  }
}
