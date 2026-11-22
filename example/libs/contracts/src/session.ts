import { z } from 'zod';

/** Only these synthetic identities can be selected without credentials. */
export const demoLoginSchema = z.enum(['user1', 'user2', 'admin']);
/** Distinguishes privilege level from the selected account. */
export const accountRoleSchema = z.enum(['user', 'admin']);
/** Login accepts only a persona name, never a role or account ID. */
export const demoLoginInputSchema = z.strictObject({ login: demoLoginSchema });

/** Top-level projection fields understood by Workboard. */
export const taskFieldSchema = z.enum([
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
  'internalNote',
  'internalCostCents',
]);

/** Scalar grouping keys supported by the API. */
export const taskGroupFieldSchema = z.enum(['status', 'priority', 'internalCostCents']);

/** Public account identity and capability hints; the API enforces them separately. */
export const demoSessionSchema = z.strictObject({
  id: z.string().min(1),
  login: demoLoginSchema,
  role: accountRoleSchema,
  displayName: z.string().min(1),
  fields: z.array(taskFieldSchema),
  groupableFields: z.array(taskGroupFieldSchema),
});

/** Schema-validated account response consumed by the demo selector and query UI. */
export type DemoSession = z.infer<typeof demoSessionSchema>;
/** A supported task projection field. */
export type TaskField = z.infer<typeof taskFieldSchema>;
