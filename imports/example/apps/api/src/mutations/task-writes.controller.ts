import { randomUUID } from 'node:crypto';

import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  taskBulkDeleteSchema,
  taskCreateSchema,
  type taskGroupedDeleteSchema,
  taskSchema,
  taskUpdateSchema,
  type DemoSession,
  type TaskUpdate,
  type z,
} from '@workboard/contracts';

import { createWorkboardAbility, taskOwnership } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';
import { DemoWriteOriginGuard } from '../demo/demo-origin.js';
import { DemoSessionGuard, type AuthenticatedRequest } from '../demo/demo-session.guard.js';
import { Prisma } from '../generated/prisma/client.js';
import { accessibleWhere } from '../query/scoped-query.js';
import { projectTask, taskInclude } from '../tasks/task-projection.js';
import { checkTaskWhere } from '../tasks/tasks.service.js';
import { describeWrite, parseId, parseWrite, writeError } from './write-contract.js';

const serializable = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };

/** Maintains tasks under the same ownership scope as reads. */
@ApiTags('Tasks')
@ApiCookieAuth('workboard_demo')
@UseGuards(DemoSessionGuard, DemoWriteOriginGuard)
@Controller('tasks')
export class TaskWritesController {
  /** Receives the application database for scoped writes. */
  constructor(private readonly database: DatabaseService) {}

  /** Creates a task for the active account or an admin-selected owner. */
  @Post()
  @describeWrite(201, taskCreateSchema, taskSchema)
  async create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const session = request.demoSession;
    const { ownerLogin, ...input } = parseWrite(taskCreateSchema, body);
    if (ownerLogin !== undefined && session.role !== 'admin') {
      throw new ForbiddenException('Only the admin can choose a task owner.');
    }
    checkInternalFields(session, input);
    const ability = createWorkboardAbility(session);

    try {
      const task = await this.database.$transaction(
        /** Checks project access and resolves ownership in the write transaction. */
        async (db) => {
          await requireProject(db, input.projectId, ability);
          const owner = ownerLogin
            ? await db.account.findUniqueOrThrow({ where: { login: ownerLogin }, select: { id: true } })
            : session;
          return db.task.create({
            data: {
              ...input,
              id: randomUUID(),
              ownerId: owner.id,
              createdAt: new Date(),
              internalCostCents: input.internalCostCents ?? 0,
              internalNote: input.internalNote ?? '',
            },
            include: taskInclude,
          });
        },
        serializable,
      );
      return taskSchema.parse(projectTask(task, ability));
    } catch (error) {
      writeError(error, 'Task', 'The selected project is no longer available.');
    }
  }

  /** Updates only supplied fields on a task in the caller's scope. */
  @Patch(':id')
  @describeWrite(200, taskUpdateSchema, taskSchema)
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const session = request.demoSession;
    const where = taskScope(session, id);
    const input = parseWrite(taskUpdateSchema, body);
    checkInternalFields(session, input);
    const ability = createWorkboardAbility(session);

    try {
      const task = await this.database.$transaction(
        /** Checks destination access before updating the scoped task. */
        async (db) => {
          if (input.projectId) await requireProject(db, input.projectId, ability);
          return db.task.update({ where, data: input, include: taskInclude });
        },
        serializable,
      );
      return taskSchema.parse(projectTask(task, ability));
    } catch (error) {
      writeError(error, 'Task', 'The selected project is no longer available.');
    }
  }

  /** Deletes a task and its label links atomically, leaving the labels themselves intact. */
  @Delete(':id')
  @HttpCode(204)
  @describeWrite(204)
  async remove(@Req() request: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.deleteTaskIds(request.demoSession, [parseId(id)]);
  }

  /** Deletes the entire selection if every requested task is in scope. */
  @Post('bulk-delete')
  @HttpCode(204)
  @describeWrite(204, taskBulkDeleteSchema)
  async bulkDelete(@Req() request: AuthenticatedRequest, @Body() body: unknown): Promise<void> {
    const selection = parseWrite(taskBulkDeleteSchema, body);
    if ('groups' in selection) await this.deleteTaskGroups(request.demoSession, selection);
    else await this.deleteTaskIds(request.demoSession, selection.ids);
  }

  /** Deletes specific IDs only when all are within the account's write scope. */
  private async deleteTaskIds(session: DemoSession, ids: string[]): Promise<void> {
    await this.deleteTasks({ id: { in: ids }, ...taskOwnership(session) }, ids.length);
  }

  /** Combines the active filter and selected groups inside the server-owned write scope. */
  private async deleteTaskGroups(
    session: DemoSession,
    selection: z.output<typeof taskGroupedDeleteSchema>,
  ): Promise<void> {
    const ability = createWorkboardAbility(session);
    checkTaskWhere(selection.where, ability);
    const scope = { AND: [taskOwnership(session) ?? {}, selection.where ?? {}] };
    const excluded = (selection.excludedGroups ?? []).map(
      /** Validates every excluded path before building the write query. */ (path) => ({
        path,
        where: groupWhere(path),
      }),
    );
    const byGroup: Prisma.TaskWhereInput = {
      OR: selection.groups.map(
        /** Applies only subtree exclusions, allowing a deeper group to be explicitly reselected. */ (path) => ({
          ...groupWhere(path),
          NOT: excluded
            .filter(
              /** Matches exclusions at or below this included group. */ (rule) =>
                path.every(
                  /** Compares the ordered grouping keys. */ ({ field, value }, index) =>
                    rule.path[index]?.field === field && rule.path[index]?.value === value,
                ),
            )
            .map(/** Uses the validated exclusion predicate. */ (rule) => rule.where),
        }),
      ),
      id: selection.excludedIds ? { notIn: selection.excludedIds } : undefined,
    };
    const explicit = selection.ids ? { ...scope, id: { in: selection.ids } } : undefined;
    const where = { ...scope, OR: explicit ? [byGroup, { id: explicit.id }] : [byGroup] };
    await this.deleteTasks(where, selection.expectedCount, { explicit, explicitCount: selection.ids?.length });

    /** Converts a validated path into a conjunction of authorized group field values. */
    function groupWhere(path: z.output<typeof taskGroupedDeleteSchema>['groups'][number]): Prisma.TaskWhereInput {
      for (const { field } of path) {
        if (!ability.can('read', 'Task', field)) throw new ForbiddenException(`Cannot filter by ${field}.`);
      }
      return Object.fromEntries(
        path.map(/** Uses only validated grouping keys. */ ({ field, value }) => [field, value]),
      );
    }
  }

  /** Deletes matched tasks and label links atomically, with a count guard for group predicates. */
  private async deleteTasks(
    where: Prisma.TaskWhereInput,
    expectedCount: number,
    grouped?: { explicit?: Prisma.TaskWhereInput; explicitCount?: number },
  ): Promise<void> {
    /** Reports changed results without committing any deletes. */
    function selectionChanged(): never {
      if (grouped)
        throw new ConflictException('The selection changed. Refresh the task list and select the tasks again.');
      throw new NotFoundException('Task not found.');
    }
    try {
      await this.database.$transaction(
        /** Compares the actual delete count with the validated request before committing. */
        async (db) => {
          if (grouped?.explicit && (await db.task.count({ where: grouped.explicit })) !== grouped.explicitCount) {
            throw new NotFoundException('Task not found.');
          }
          if (grouped && (await db.task.count({ where })) !== expectedCount) selectionChanged();
          await db.taskLabel.deleteMany({ where: { task: where } });
          const { count } = await db.task.deleteMany({ where });
          if (count !== expectedCount) selectionChanged();
        },
        serializable,
      );
    } catch (error) {
      writeError(error, 'Task', 'The task changed during deletion. Try again.');
    }
  }
}

/** Enforces owner scope inside each mutation and conceals inaccessible IDs. */
function taskScope(session: DemoSession, id: string) {
  return { id: parseId(id), ...taskOwnership(session) };
}

/** Applies the existing project read scope before accepting a task's project. */
async function requireProject(
  db: Prisma.TransactionClient,
  id: string,
  ability: ReturnType<typeof createWorkboardAbility>,
): Promise<void> {
  const scope = accessibleWhere(ability, 'Project') as Prisma.ProjectWhereInput;
  if (!(await db.project.findFirst({ where: { id, AND: [scope] }, select: { id: true } }))) {
    throw new NotFoundException('Project not found.');
  }
}

/** Keeps private fields writable only by the same role that can read them. */
function checkInternalFields(session: DemoSession, input: TaskUpdate): void {
  if (session.role !== 'admin' && (input.internalNote !== undefined || input.internalCostCents !== undefined)) {
    throw new ForbiddenException('Only the admin can edit internal task fields.');
  }
}
