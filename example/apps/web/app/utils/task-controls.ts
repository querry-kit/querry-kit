import type { FilterField } from '@querry-kit/nuxt-ui/types';
import { taskPrioritySchema, taskStatusSchema } from '@workboard/contracts';

export const taskFilterFields: FilterField[] = [
  {
    value: 'status',
    label: 'Status',
    type: 'enum',
    values: taskStatusSchema.options.map(/** Labels a status option. */ (value) => ({ value, label: value })),
  },
  {
    value: 'priority',
    label: 'Priority',
    type: 'enum',
    values: taskPrioritySchema.options.map(/** Labels a priority option. */ (value) => ({ value, label: value })),
  },
  { value: 'estimatedHours', label: 'Est. hours', type: 'number' },
];

/** Builds the title search shared by the task table and group metrics. */
export function taskStaticWhere(search: string | undefined) {
  const title = search?.trim().slice(0, 160);
  return title ? { title: { contains: title, mode: 'insensitive' } } : undefined;
}
