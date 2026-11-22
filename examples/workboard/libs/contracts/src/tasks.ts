import { z } from 'zod';

import {
  idFilterSchema,
  orderDirectionSchema,
  paginatedSchema,
  resourceIdSchema,
  textFilterSchema,
  wireIntegerSchema,
} from './query.js';

/** Public seeded task states. */
export const taskStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED']);
/** Public seeded scheduling priorities. */
export const taskPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH']);

const numeric = wireIntegerSchema.pipe(z.number().int().min(0).max(2_147_483_647));
const numericFilter = z.union([
  numeric,
  z.strictObject({
    equals: numeric.optional(),
    not: numeric.optional(),
    gt: numeric.optional(),
    gte: numeric.optional(),
    lt: numeric.optional(),
    lte: numeric.optional(),
  }),
]);
const statusFilter = z.union([
  taskStatusSchema,
  z.strictObject({
    equals: taskStatusSchema.optional(),
    in: z.array(taskStatusSchema).max(4).optional(),
    notIn: z.array(taskStatusSchema).max(4).optional(),
  }),
]);
const priorityFilter = z.union([
  taskPrioritySchema,
  z.strictObject({
    equals: taskPrioritySchema.optional(),
    in: z.array(taskPrioritySchema).max(3).optional(),
    notIn: z.array(taskPrioritySchema).max(3).optional(),
  }),
]);

/** Maximum number of project IDs accepted in a task filter. */
export const projectFilterLimit = 100;
const projectIds = z.array(resourceIdSchema).max(projectFilterLimit);
const projectIdFilter = z.union([
  resourceIdSchema,
  z.strictObject({
    equals: resourceIdSchema.optional(),
    in: projectIds.optional(),
    notIn: projectIds.optional(),
  }),
]);

const simpleWhere = z.strictObject({
  id: idFilterSchema.optional(),
  title: textFilterSchema.optional(),
  status: statusFilter.optional(),
  priority: priorityFilter.optional(),
  estimatedHours: numericFilter.optional(),
  internalNote: textFilterSchema.optional(),
  internalCostCents: numericFilter.optional(),
  project: z.strictObject({ id: projectIdFilter.optional(), title: textFilterSchema.optional() }).optional(),
  labels: z.strictObject({ some: z.strictObject({ labelId: idFilterSchema }) }).optional(),
});

/** Allows one more nested layer of bounded boolean predicates. */
function withBooleanConditions<T extends z.ZodType>(child: T) {
  return simpleWhere.extend({
    AND: z.array(child).min(1).max(12).optional(),
    OR: z.array(child).min(1).max(12).optional(),
  });
}

/** Supported query predicates. Includes room for both UI filters and the current group path. */
export const taskWhereSchema = withBooleanConditions(withBooleanConditions(withBooleanConditions(simpleWhere)));

const orderRule = z.strictObject({
  id: orderDirectionSchema.optional(),
  title: orderDirectionSchema.optional(),
  status: orderDirectionSchema.optional(),
  priority: orderDirectionSchema.optional(),
  estimatedHours: orderDirectionSchema.optional(),
  createdAt: orderDirectionSchema.optional(),
  project: orderDirectionSchema.describe('Sort by project title.').optional(),
  owner: orderDirectionSchema.describe('Sort by the owner’s display name.').optional(),
  labels: orderDirectionSchema.describe('Sort by the number of labels.').optional(),
  internalNote: orderDirectionSchema.optional(),
  internalCostCents: orderDirectionSchema.optional(),
});

/** Shared response selector; Querry Kit parses the nested `fields` grammar. */
export const taskDetailQuerySchema = z.strictObject({ fields: z.string().trim().min(1).max(500).optional() });

/** Query parameters after bracket syntax and JSON `where` are normalized. */
export const taskListQuerySchema = taskDetailQuerySchema.extend({
  where: taskWhereSchema.optional(),
  orderBy: z.union([orderRule, z.array(orderRule).max(11)]).optional(),
  page: wireIntegerSchema.pipe(z.number().int().min(1).max(10_000)).default(1),
  perPage: wireIntegerSchema.pipe(z.number().int().min(1).max(100)).default(10),
});

/** A count takes exactly the same filter as the record list. */
export const taskCountQuerySchema = z.strictObject({ where: taskWhereSchema.optional() });

const personProjection = z.strictObject({
  id: resourceIdSchema.optional(),
  profile: z.strictObject({ displayName: z.string().optional() }).nullable().optional(),
});
const projectProjection = z.strictObject({
  id: resourceIdSchema.optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
});
const labelProjection = z.strictObject({
  id: resourceIdSchema.optional(),
  slug: z.string().optional(),
  displayName: z.string().optional(),
});

/** Omitted fields were not projected; a nullable relation may explicitly be null. */
export const taskSchema = z.strictObject({
  id: resourceIdSchema.optional(),
  title: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  estimatedHours: z.number().int().nonnegative().optional(),
  createdAt: z.iso.datetime().optional(),
  project: projectProjection.optional(),
  owner: personProjection.optional(),
  assignee: personProjection.nullable().optional(),
  labels: z.array(labelProjection).optional(),
  internalNote: z.string().optional(),
  internalCostCents: z.number().int().nonnegative().optional(),
});

/** Response type from the supported projection and pagination paths. */
export const taskPageSchema = paginatedSchema(taskSchema);
/** Validated list input forwarded to the Querry Kit read service. */
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
/** Validated filter accepted by list/count/group routes. */
export type TaskWhere = z.infer<typeof taskWhereSchema>;
/** Task payload whose keys follow the requested projection. */
export type Task = z.infer<typeof taskSchema>;
