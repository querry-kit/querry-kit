import { z } from 'zod';

import { resourceIdSchema } from './query.js';
import { demoLoginSchema } from './session.js';
import { taskPrioritySchema, taskStatusSchema, taskWhereSchema } from './tasks.js';

const title = z.string().trim().min(1).max(160);
const nonnegativeInteger = z.number().int().min(0).max(2_147_483_647);

/** A human-readable project title and a unique URL-friendly slug. */
export const projectCreateSchema = z.strictObject({
  title,
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens.'),
});

/** Project edits may change either field. */
export const projectUpdateSchema = projectCreateSchema
  .partial()
  .refine(hasChanges, 'Provide at least one field.')
  .meta({ minProperties: 1 });

const taskFields = z.strictObject({
  title,
  projectId: resourceIdSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  estimatedHours: nonnegativeInteger,
  internalNote: z.string().trim().max(2000).optional(),
  internalCostCents: nonnegativeInteger.optional(),
});

/** Tasks default to the active account. Admins may choose another demo owner when creating one. */
export const taskCreateSchema = taskFields.extend({ ownerLogin: demoLoginSchema.optional() });

/** Only supplied fields are changed. */
export const taskUpdateSchema = taskFields
  .partial()
  .refine(hasChanges, 'Provide at least one field.')
  .meta({ minProperties: 1 });

/** Maximum number of tasks in a single bulk delete transaction. */
export const bulkDeleteLimit = 1_000;

const bulkIds = z
  .array(resourceIdSchema)
  .min(1)
  .max(bulkDeleteLimit)
  .refine(
    /** Rejects duplicate IDs before the transaction. */ (ids) => new Set(ids).size === ids.length,
    'IDs must be unique.',
  )
  .meta({ uniqueItems: true });
const explicitBulkDeleteSchema = z.strictObject({ ids: bulkIds });

/** Distinct typed grouping keys, with at least one concrete match predicate. */
export const taskGroupPathSchema = z
  .array(
    z.discriminatedUnion('field', [
      z.strictObject({ field: z.literal('status'), value: taskStatusSchema }),
      z.strictObject({ field: z.literal('priority'), value: taskPrioritySchema }),
      z.strictObject({ field: z.literal('internalCostCents'), value: nonnegativeInteger }),
    ]),
  )
  .min(1)
  .max(3)
  .refine(
    /** Rejects repeating a grouping field. */ (path) =>
      new Set(path.map(/** Reads the grouping field. */ ({ field }) => field)).size === path.length,
    'Group fields must be unique.',
  );

/** Batch selection by scoped group predicates, with optional row or subgroup overrides. */
export const taskGroupedDeleteSchema = z.strictObject({
  where: taskWhereSchema.optional(),
  groups: z.array(taskGroupPathSchema).min(1).max(bulkDeleteLimit),
  excludedGroups: z.array(taskGroupPathSchema).max(bulkDeleteLimit).optional(),
  ids: bulkIds.optional(),
  excludedIds: bulkIds.optional(),
  expectedCount: z.number().int().min(1).max(bulkDeleteLimit),
});

/** Preserves explicit ID deletion and also accepts a validated group selection. */
export const taskBulkDeleteSchema = z.union([explicitBulkDeleteSchema, taskGroupedDeleteSchema]);

/** Project bulk deletion uses the same bounded ID list as task bulk deletion. */
export const projectBulkDeleteSchema = explicitBulkDeleteSchema;

/** Checks whether a PATCH request supplies any recognized field. */
function hasChanges(input: object): boolean {
  return Object.keys(input).length > 0;
}

/** Validated project creation input. */
export type ProjectCreate = z.output<typeof projectCreateSchema>;
/** Validated project edit input. */
export type ProjectUpdate = z.output<typeof projectUpdateSchema>;
/** Validated task creation input. */
export type TaskCreate = z.output<typeof taskCreateSchema>;
/** Validated task edit input. */
export type TaskUpdate = z.output<typeof taskUpdateSchema>;
