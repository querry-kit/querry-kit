import { z } from 'zod';

import { idFilterSchema, paginatedSchema, resourceIdSchema, textFilterSchema, wireIntegerSchema } from './query.js';

/** Inputs for bounded project and label queries, including pinned autocomplete hydration. */
export const lookupQuerySchema = z
  .strictObject({
    where: z
      .strictObject({
        id: idFilterSchema.optional(),
        title: textFilterSchema.optional(),
        displayName: textFilterSchema.optional(),
      })
      .optional(),
    page: wireIntegerSchema.pipe(z.number().int().min(1).max(10_000)).default(1),
    perPage: wireIntegerSchema.pipe(z.number().int().min(1).max(1_000)).default(10),
  })
  .superRefine(
    /** Permits the pinned autocomplete's large size only for a bounded lookup by selected ID. */
    (query, context) => {
      const ids = query.where?.id;
      const selectsId = typeof ids === 'string' || Boolean(ids?.equals || ids?.in?.length);
      if (query.perPage > 100 && (query.perPage !== 1_000 || !selectsId)) {
        context.addIssue({
          code: 'custom',
          path: ['perPage'],
          message: 'Use at most 100 rows except for ID selection.',
        });
      }
    },
  );

/** Full fields needed by the project autocomplete. */
export const projectLookupSchema = z.strictObject({ id: resourceIdSchema, slug: z.string(), title: z.string() });
/** Full fields needed by the label lookup. */
export const labelLookupSchema = z.strictObject({ id: resourceIdSchema, slug: z.string(), displayName: z.string() });
/** Paginated project lookup contract. */
export const projectLookupPageSchema = paginatedSchema(projectLookupSchema);
/** Paginated label lookup contract. */
export const labelLookupPageSchema = paginatedSchema(labelLookupSchema);

/** Shared bounded lookup query, independent of storage models. */
export type LookupQuery = z.infer<typeof lookupQuerySchema>;
/** Public option from a scoped project lookup. */
export type ProjectLookup = z.infer<typeof projectLookupSchema>;
