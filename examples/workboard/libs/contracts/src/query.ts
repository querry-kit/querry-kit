import { z } from 'zod';

/** Accepts integer JSON values and integer strings from bracketed query parameters. */
export const wireIntegerSchema = z
  .union([
    z.number().int(),
    z
      .string()
      .regex(/^-?\d+$/)
      .transform(Number),
  ])
  .pipe(z.number().int().safe());

/** Project, label, and task IDs are opaque strings, not numeric identifiers. */
export const resourceIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9_-]+$/i);

/** Bounded ID filters used by autocomplete and selected-value hydration. */
export const idFilterSchema = z.union([
  resourceIdSchema,
  z.strictObject({ equals: resourceIdSchema.optional(), in: z.array(resourceIdSchema).min(1).max(100).optional() }),
]);

const text = z.string().max(160);

/** A small, explicit subset of string predicates; these map directly to Prisma. */
export const textFilterSchema = z.union([
  text,
  z.strictObject({
    equals: text.optional(),
    contains: text.optional(),
    startsWith: text.optional(),
    endsWith: text.optional(),
    mode: z.enum(['default', 'insensitive']).optional(),
  }),
]);

/** Stable order direction used by Nuxt table query state. */
export const orderDirectionSchema = z.enum(['asc', 'desc']);

/** Pagination metadata exactly as serialized by Querry Kit. */
export const paginationMetaSchema = z.strictObject({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  itemCount: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative(),
  hasPrevPage: z.boolean(),
  hasNextPage: z.boolean(),
});

/** Shares one output envelope shape among lists and scoped lookups. */
export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.strictObject({ items: z.array(item), meta: paginationMetaSchema });
}
