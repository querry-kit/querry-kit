import { z } from 'zod';

import { projectLookupSchema } from './lookups.js';
import { orderDirectionSchema, paginatedSchema, wireIntegerSchema } from './query.js';

const integer = wireIntegerSchema.optional();
const countPredicate = z.strictObject({
  taskCount: z
    .strictObject({ equals: integer, not: integer, lt: integer, lte: integer, gt: integer, gte: integer })
    .refine(
      /** Rejects comparisons without an operator. */
      (predicate) => Object.keys(predicate).length > 0,
    )
    .meta({ minProperties: 1 }),
});
const orderRule = z.union([
  z.strictObject({ title: orderDirectionSchema }),
  z.strictObject({ slug: orderDirectionSchema }),
  z.strictObject({ taskCount: orderDirectionSchema }),
]);

/** The dashboard query is separate from the lightweight autocomplete contract. */
export const projectTableQuerySchema = z.strictObject({
  search: z.string().trim().max(160).optional(),
  where: z
    .union([
      countPredicate,
      z.strictObject({ AND: z.array(countPredicate).min(1).max(12) }),
      z.strictObject({ OR: z.array(countPredicate).min(1).max(12) }),
    ])
    .optional(),
  orderBy: z.union([orderRule, z.array(orderRule).max(8)]).optional(),
  page: wireIntegerSchema.pipe(z.number().int().min(1).max(10_000)).default(1),
  perPage: wireIntegerSchema.pipe(z.number().int().min(1).max(100)).default(10),
});

/** A project with the total number of tasks visible to the requesting account. */
export const projectTableRowSchema = projectLookupSchema.extend({ taskCount: z.number().int().nonnegative() });
/** Paginated project dashboard response. */
export const projectTablePageSchema = paginatedSchema(projectTableRowSchema);

/** Runtime-validated project table query. */
export type ProjectTableQuery = z.output<typeof projectTableQuerySchema>;
/** Row displayed by the Projects dashboard. */
export type ProjectTableRow = z.infer<typeof projectTableRowSchema>;
