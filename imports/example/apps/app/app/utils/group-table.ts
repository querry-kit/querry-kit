import type { TableColumn } from '@nuxt/ui';
import type { TableColumnInput } from '@querry-kit/nuxt';
import type { Task } from '@workboard/contracts';

/** Column definitions shared by the headless table and its leaf renderer. */
export type GroupItemColumn = TableColumnInput<Task, TableColumn<Task>>;
/** Compact sticky headers and first-column padding from CRM Tenant Web. */
export const taskTableUi = {
  base: 'min-w-[760px]',
  th: 'first:pl-6 bg-neutral-100 dark:bg-neutral-950/20',
  td: 'first:pl-6',
};
