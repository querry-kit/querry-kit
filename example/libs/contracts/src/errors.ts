import { z } from 'zod';

/** Public error payload emitted by the API, without request or database internals. */
export const apiErrorSchema = z.strictObject({
  statusCode: z.number().int().min(400).max(599),
  message: z.string(),
  error: z.string().optional(),
});

/** Validated error returned to the browser. */
export type ApiError = z.infer<typeof apiErrorSchema>;
