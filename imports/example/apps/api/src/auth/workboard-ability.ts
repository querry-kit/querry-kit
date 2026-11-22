import { AbilityBuilder, type Ability, type ForcedSubject } from '@casl/ability';
import { createPrismaAbility, type PrismaQueryOf } from '@casl/prisma/runtime';
import { taskFieldSchema, type DemoSession, type TaskField } from '@workboard/contracts';

import type { Label, Prisma, Project, Task } from '../generated/prisma/client.js';

/** Model names with a public Workboard read surface. */
export type WorkboardSubject = 'Task' | 'Project' | 'Label';

type WorkboardRecord =
  (Task & ForcedSubject<'Task'>) | (Project & ForcedSubject<'Project'>) | (Label & ForcedSubject<'Label'>);

/** CASL conditions use the application's generated Prisma model types. */
export type WorkboardAbility = Ability<['read', WorkboardSubject | WorkboardRecord], PrismaQueryOf<Prisma.TypeMap>>;

/** Fields regular accounts may project or use in a query. */
const publicTaskFields: TaskField[] = [
  'id',
  'title',
  'status',
  'priority',
  'estimatedHours',
  'createdAt',
  'project',
  'owner',
  'assignee',
  'labels',
];

/** The shared owner predicate for task rows, project visibility, and task counts. */
export function taskOwnership(account: Pick<DemoSession, 'id' | 'role'>): { ownerId: string } | undefined {
  return account.role === 'admin' ? undefined : { ownerId: account.id };
}

/**
 * Defines owner-scoped reads separately from field visibility.
 *
 * The two users share the same role. Only the server-resolved account ID determines which rows they own.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/api/casl/
 */
export function createWorkboardAbility(account: Pick<DemoSession, 'id' | 'role'>): WorkboardAbility {
  const { can, build } = new AbilityBuilder<WorkboardAbility>(createPrismaAbility);
  const ownedItem = taskOwnership(account);
  if (!ownedItem) {
    can('read', ['Task', 'Project', 'Label']);
  } else {
    can('read', 'Task', publicTaskFields, ownedItem);
    can('read', 'Project', { tasks: { some: ownedItem } });
    can('read', 'Label', { tasks: { some: { task: { is: ownedItem } } } });
  }

  return build();
}

/** Derives client hints from the policy instead of maintaining a second role table. */
export function workboardCapabilities(ability: WorkboardAbility): Pick<DemoSession, 'fields' | 'groupableFields'> {
  const fields = taskFieldSchema.options.filter(
    /** Selects a field if this ability can read it on any accessible task. */
    (field) => ability.can('read', 'Task', field),
  );

  return {
    fields,
    groupableFields: fields.includes('internalCostCents')
      ? ['status', 'priority', 'internalCostCents']
      : ['status', 'priority'],
  };
}
