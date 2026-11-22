import { subject } from '@casl/ability';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { filterCaslFields } from '@querry-kit/nest/casl';
import { Fields, FieldsBadRequestException, relation, type FieldSchema } from '@querry-kit/nest/fields';
import type { Task, TaskField } from '@workboard/contracts';

import type { WorkboardAbility } from '../auth/workboard-ability.js';
import type { Prisma } from '../generated/prisma/client.js';

const profile = relation({ displayName: true });
const account = relation({ id: true, profile });

/** Projection paths are public names, not raw Prisma selectors. */
export const taskFields = {
  id: true,
  title: true,
  status: true,
  priority: true,
  estimatedHours: true,
  createdAt: true,
  project: relation({ id: true, slug: true, title: true }),
  owner: account,
  assignee: account,
  labels: relation({ id: true, slug: true, displayName: true }),
  internalNote: true,
  internalCostCents: true,
} satisfies Record<TaskField, FieldSchema[string]>;

/** Explicit joins supporting the public projection shape, including labels through the link table. */
export const taskInclude = {
  project: { select: { id: true, slug: true, title: true } },
  owner: { select: { id: true, profile: { select: { displayName: true } } } },
  assignee: { select: { id: true, profile: { select: { displayName: true } } } },
  labels: { select: { label: { select: { id: true, slug: true, displayName: true } } } },
} satisfies Prisma.TaskInclude;

/** Task with explicitly joined public relations before response mapping. */
export type TaskRecord = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

/**
 * Rejects explicit projection of a forbidden field before any query is issued.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/concepts/fields/
 */
export function checkProjection(fields: string | undefined, ability: WorkboardAbility): void {
  try {
    const projection = Fields.parseAndValidate(fields, taskFields);
    for (const key of Object.keys(projection ?? {})) {
      if (!ability.can('read', 'Task', key)) throw new ForbiddenException(`Cannot project ${key}.`);
    }
  } catch (error) {
    if (error instanceof FieldsBadRequestException) throw new BadRequestException('Invalid fields projection.');
    throw error;
  }
}

/**
 * Maps database relations to transport and applies field permissions to the scoped record.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/api/casl/
 */
export function projectTask(row: TaskRecord, ability: WorkboardAbility): Task {
  const dto: Task = {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    estimatedHours: row.estimatedHours,
    createdAt: row.createdAt.toISOString(),
    project: row.project,
    owner: publicPerson(row.owner),
    assignee: row.assignee ? publicPerson(row.assignee) : null,
    labels: row.labels.map(/** Unwraps Prisma's explicit many-to-many link. */ ({ label }) => label),
    internalNote: row.internalNote,
    internalCostCents: row.internalCostCents,
  };

  // The CASL condition needs the original owner ID, which is deliberately absent from the DTO.
  const record = subject('Task', row);
  return filterCaslFields(dto, 'Task', {
    /** Evaluates against the real record instead of relying on the projected DTO's attributes. */
    can(action, _projected, field) {
      return action === 'read' && ability.can(action, record, field);
    },
  });
}

/** Keeps account internals private even if Querry Kit adds a relation include for a nested projection. */
function publicPerson(person: TaskRecord['owner']) {
  return {
    id: person.id,
    profile: person.profile ? { displayName: person.profile.displayName } : null,
  };
}
