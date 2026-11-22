import { useGroupedSelection } from '@querry-kit/nuxt';
import { bulkDeleteLimit, taskBulkDeleteSchema, type Task } from '@workboard/contracts';

/** Adapts the grouped selection to the Workboard deletion contract. */
export function useTaskSelection() {
  const { getSelection, selectItems, ...selection } = useGroupedSelection<Task>(
    /** Reads the stable resource ID. */ (task) => task.id,
  );
  const { selectedCount } = selection;

  /** Uses the legacy explicit-ID request when no whole group is selected. */
  function deletePayload(where: Record<string, unknown> | undefined) {
    if (selectedCount.value > bulkDeleteLimit) throw new Error(`Select at most ${bulkDeleteLimit} tasks per deletion.`);
    const { includedGroups, excludedGroups, ids, excludedIds } = getSelection();
    return taskBulkDeleteSchema.parse(
      includedGroups.length
        ? {
            where,
            groups: includedGroups,
            excludedGroups,
            ids: ids.length ? ids : undefined,
            excludedIds: excludedIds.length ? excludedIds : undefined,
            expectedCount: selectedCount.value,
          }
        : { ids },
    );
  }

  return { ...selection, selectTasks: selectItems, deletePayload };
}
