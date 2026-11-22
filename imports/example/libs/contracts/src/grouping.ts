import { z } from 'zod';

import { orderDirectionSchema, wireIntegerSchema } from './query.js';
import { taskGroupFieldSchema } from './session.js';
import { taskPrioritySchema, taskStatusSchema, taskWhereSchema } from './tasks.js';

const flag = z.union([
  z.literal(true),
  z.literal('true').transform(/** Decodes bracket syntax. */ () => true as const),
]);
const selectors = z.strictObject({
  estimatedHours: flag.optional(),
  internalCostCents: flag.optional(),
});
const countSelectors = selectors.extend({ _all: flag.optional() });

const aggregateOptions = {
  _count: countSelectors.optional(),
  _sum: selectors.optional(),
  _avg: selectors.optional(),
  _min: selectors.optional(),
  _max: selectors.optional(),
};

/** Shared metrics request; the UI supplies the active filter and a typed group path. */
export const taskAggregateQuerySchema = z
  .strictObject({ where: taskWhereSchema.optional(), ...aggregateOptions })
  .refine(
    /** An aggregate must request at least one metric. Grouping alone uses the separate group endpoint. */
    ({ _count, _sum, _avg, _min, _max }) =>
      [_count, _sum, _avg, _min, _max].some(
        /** Checks that a selector has a field. */ (value) => Boolean(value && Object.keys(value).length),
      ),
    { message: 'Select at least one aggregate metric.' },
  );

const groupOrder = z.strictObject({
  status: orderDirectionSchema.optional(),
  priority: orderDirectionSchema.optional(),
  internalCostCents: orderDirectionSchema.optional(),
});
const comparison = z.strictObject({
  equals: wireIntegerSchema.optional(),
  gt: wireIntegerSchema.optional(),
  gte: wireIntegerSchema.optional(),
  lt: wireIntegerSchema.optional(),
  lte: wireIntegerSchema.optional(),
});
const metricComparison = z.strictObject({ _sum: comparison.optional(), _avg: comparison.optional() });
const having = z.strictObject({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  estimatedHours: metricComparison.optional(),
  internalCostCents: comparison.extend(metricComparison.shape).optional(),
});

/** Scope-safe, bounded Prisma grouping surface exposed through the read endpoint. */
export const taskGroupQuerySchema = z.strictObject({
  by: z
    .array(taskGroupFieldSchema)
    .min(1)
    .max(2)
    .refine(/** Rejects repeated grouping keys. */ (keys) => new Set(keys).size === keys.length),
  where: taskWhereSchema.optional(),
  orderBy: z.union([groupOrder, z.array(groupOrder).max(2)]).optional(),
  skip: wireIntegerSchema.pipe(z.number().int().min(0).max(10_000)).optional(),
  take: wireIntegerSchema.pipe(z.number().int().min(1).max(101)).optional(),
  having: having.optional(),
  ...aggregateOptions,
});

const count = z.number().int().nonnegative();
const metric = z.number().nonnegative().nullable().optional();
const metricResponse = z.strictObject({ estimatedHours: metric, internalCostCents: metric });

/** Prisma returns null rather than zero for a metric with no matching inputs. */
export const taskAggregateSchema = z.strictObject({
  _count: z
    .strictObject({ _all: count.optional(), estimatedHours: count.optional(), internalCostCents: count.optional() })
    .optional(),
  _sum: metricResponse.optional(),
  _avg: metricResponse.optional(),
  _min: metricResponse.optional(),
  _max: metricResponse.optional(),
});

/** A group carries only requested keys and computed fields, not a task projection. */
export const taskGroupRowSchema = taskAggregateSchema.extend({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  internalCostCents: count.optional(),
});

/** Public response array consumed by `useGroupedTable`. */
export const taskGroupsSchema = z.array(taskGroupRowSchema);
/** Validated numeric group metrics shown by the dashboard. */
export type TaskAggregate = z.infer<typeof taskAggregateSchema>;
