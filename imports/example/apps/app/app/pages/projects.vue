<template>
  <WorkboardPanel title="Projects" full-page>
    <template #toolbar>
      <QTableToolbar
        v-model:search="search"
        v-model:filtering="filtering"
        v-model:sorting="sorting"
        v-model:column-order="columnOrder"
        v-model:invisible-columns="invisibleColumns"
        v-model:column-pinning="columnPinning"
        search-placeholder="Search projects"
        :selected-count="canManage ? selectedIds.size : 0"
        :filter-fields="filterFields"
        :sortable-fields="sortableFields"
        :column-definitions="availableColumns"
      >
        <template #layout="{ search: searchControl, options, actions }">
          <WorkboardToolbarLayout
            :breadcrumbs="[{ label: 'Projects' }]"
            :actions="actions"
            :search="searchControl"
            :options="options"
          />
        </template>
        <template v-if="canManage" #bulk-actions>
          <WorkboardDeleteDialog
            v-model:open="deleteOpen"
            title="Delete selected projects"
            :description="`Permanently delete ${selectedIds.size} selected ${selectedIds.size === 1 ? 'project' : 'projects'}? Each project must have no tasks.`"
            :remove="deleteSelected"
            @deleted="refreshAfterDelete"
          >
            <UButton color="error" variant="outline" icon="i-tabler-trash" label="Delete selected" />
          </WorkboardDeleteDialog>
        </template>
        <template v-if="canManage" #new>
          <ProjectEditor @saved="refreshProjects">
            <WorkboardNewButton label="New project" />
          </ProjectEditor>
        </template>
      </QTableToolbar>
    </template>

    <UDashboardToolbar v-if="error" class="min-w-0 py-3">
      <UAlert
        class="min-w-0"
        color="error"
        variant="soft"
        title="Could not load projects"
        :actions="[{ label: 'Retry', onClick: () => refresh() }]"
      />
    </UDashboardToolbar>
    <UTable
      v-else
      sticky
      empty="No matching projects"
      :data="data?.items ?? []"
      :columns="canManage ? [selectionColumn, ...columns] : columns"
      :column-pinning="
        canManage ? { ...columnPinning, left: ['selection', ...(columnPinning.left ?? [])] } : columnPinning
      "
      :loading="pending"
      :ui="{ th: taskTableUi.th, td: taskTableUi.td }"
    >
      <template #selection-header>
        <UCheckbox
          aria-label="Select visible projects"
          :model-value="visibleSelection"
          :disabled="pending || !visibleProjectIds.length"
          @update:model-value="selectProjects(visibleProjectIds, $event === true)"
        />
      </template>
      <template #selection-cell="{ row }">
        <UCheckbox
          :aria-label="`Select ${row.original.title}`"
          :model-value="selectedIds.has(row.original.id)"
          @update:model-value="selectProjects([row.original.id], $event === true)"
        />
      </template>
      <template #title-cell="{ row }">
        <ULink
          class="font-medium text-highlighted hover:text-primary"
          :to="{ path: '/tasks', query: { project: row.original.id } }"
        >
          {{ row.original.title }}
        </ULink>
      </template>
      <template #actions-cell="{ row }">
        <ProjectActions :project="row.original" @changed="refreshProjects" />
      </template>
    </UTable>
    <template #footer>
      <QTablePagination
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :total-items="data?.meta.itemCount ?? 0"
      >
        <template #summary="{ start, end, totalItems }">
          <p class="text-sm text-muted tabular-nums" aria-live="polite">
            Showing {{ start }}–{{ end }} of {{ totalItems }}
          </p>
        </template>
      </QTablePagination>
    </template>
  </WorkboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { filteringToWhere, sortingToOrderBy, useModuleApi, type EndpointDefinition } from '@querry-kit/nuxt';
import type {
  ColumnDefinition,
  ColumnPinning,
  FilterField,
  Filtering,
  SortingField,
  SortingState,
} from '@querry-kit/nuxt-ui/types';
import { refDebounced, useLocalStorage } from '@vueuse/core';
import { bulkDeleteLimit, projectBulkDeleteSchema, type ProjectTableRow } from '@workboard/contracts';

import { taskTableUi } from '~/utils/group-table';

const { activeSession } = useDemoSession();
const { $workboardApi } = useNuxtApp();
const tableApi = useModuleApi<{ 'projects/table': EndpointDefinition<ProjectTableRow> }, 'projects/table'>(
  $workboardApi,
  'projects/table',
);
const canManage = computed(/** Reflects the project write policy. */ () => activeSession.value?.role === 'admin');
const selectedIds = reactive(new Set<string>());
const deleteOpen = ref(false);
const search = ref('');
const debouncedSearch = refDebounced(search, 250);
const page = ref(1);
const itemsPerPage = ref(10);
const sorting = ref<SortingState>([]);
const filtering = ref<Filtering>({ operator: 'AND', filters: [] });
const preferences = `table:projects:${activeSession.value?.id}`;
const columnOrder = useLocalStorage<string[]>(`${preferences}:column-order`, []);
const invisibleColumns = useLocalStorage<string[]>(`${preferences}:invisible-columns`, []);
const columnPinning = useLocalStorage<ColumnPinning>(`${preferences}:column-pinning`, {});

const sortableFields: SortingField[] = [
  { value: 'title', label: 'Project' },
  { value: 'slug', label: 'Slug' },
  { value: 'taskCount', label: 'Number of tasks' },
];
const filterFields: FilterField[] = [{ value: 'taskCount', label: 'Number of tasks', type: 'number' }];

type ProjectColumn = TableColumn<ProjectTableRow> & ColumnDefinition;
const selectionColumn: TableColumn<ProjectTableRow> = {
  id: 'selection',
  header: 'Selection',
  size: 48,
  enableSorting: false,
  meta: { class: { th: 'first:pl-3 w-12 bg-default', td: 'first:pl-3 w-12 bg-default' } },
};
const availableColumns = computed<ProjectColumn[]>(
  /** Shows row actions only for the admin. */
  () => [
    { id: 'title', accessorKey: 'title', header: 'Project', enableHiding: false },
    { id: 'slug', accessorKey: 'slug', header: 'Slug' },
    {
      id: 'taskCount',
      accessorKey: 'taskCount',
      header: 'Number of tasks',
      meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } },
    },
    ...(canManage.value
      ? [
          {
            id: 'actions',
            header: 'Actions',
            enableHiding: false,
            meta: { class: { th: 'text-right', td: 'text-right' } },
          },
        ]
      : []),
  ],
);

watch(
  availableColumns,
  /** Retains saved order and appends columns added since the previous visit. */
  (available) => {
    const ids = available.map(/** Uses each stable table column ID. */ ({ id }) => id);
    columnOrder.value = [...new Set([...columnOrder.value, ...ids])].filter(
      /** Drops IDs that are no longer available for the active account. */
      (id) => ids.includes(id),
    );
  },
  { immediate: true },
);

const columns = computed(
  /** Renders the current order and visibility without changing the server query. */
  () =>
    columnOrder.value.flatMap(
      /** Resolves a visible column by its saved ID. */
      (id) => {
        const column = availableColumns.value.find(/** Matches the saved ID. */ (entry) => entry.id === id);
        return column && !invisibleColumns.value.includes(id) ? [column] : [];
      },
    ),
);

watch(
  [debouncedSearch, filtering, sorting],
  /** Restarts pagination when the query changes. */
  () => (page.value = 1),
  { deep: true },
);

const query = computed(
  /** Encodes the same where and order syntax used by the Tasks toolbar. */
  () => {
    const where = filteringToWhere(filtering.value);
    const orderBy = sortingToOrderBy(sorting.value);
    return {
      page: page.value,
      perPage: itemsPerPage.value,
      search: debouncedSearch.value.trim().slice(0, 160) || undefined,
      where: where ? JSON.stringify(where) : undefined,
      orderBy: orderBy ? JSON.stringify(orderBy) : undefined,
    };
  },
);
const { data, pending, error, refresh } = useAsyncData(
  `projects:${activeSession.value?.id}`,
  /** Fetches only the current filtered page, with scoped task counts. */
  async () => (await tableApi.query(query.value)).data,
  { server: false, watch: [query] },
);
const visibleProjectIds = computed(
  /** Reads the IDs from the current page only. */
  () => data.value?.items.map(/** Uses the project's stable ID. */ ({ id }) => id) ?? [],
);
const visibleSelection = computed(
  /** Indicates whether the current page is partially or fully selected. */
  (): boolean | 'indeterminate' => {
    const count = visibleProjectIds.value.filter(
      /** Counts selected projects on the page. */ (id) => selectedIds.has(id),
    ).length;
    return count ? (count === visibleProjectIds.value.length ? true : 'indeterminate') : false;
  },
);
watch(
  [debouncedSearch, filtering, canManage],
  /** Keeps selection across pagination and drops it when the filter or account changes. */
  () => {
    if (!deleteOpen.value || !canManage.value) selectedIds.clear();
  },
  { deep: true },
);

/** Selects the specified projects without changing other pages. */
function selectProjects(ids: string[], checked: boolean): void {
  for (const id of ids) {
    if (checked) selectedIds.add(id);
    else selectedIds.delete(id);
  }
}

/** Deletes the confirmed selection in one request. */
async function deleteSelected(): Promise<void> {
  const ids = [...selectedIds];
  if (ids.length > bulkDeleteLimit) throw new Error(`Select at most ${bulkDeleteLimit} projects per deletion.`);
  await $workboardApi.post('/projects/bulk-delete', projectBulkDeleteSchema.parse({ ids }));
}

/** Clears the completed selection and reloads the project list. */
function refreshAfterDelete(): void {
  selectedIds.clear();
  void refreshProjects();
}

/** Refetches the current query and clamps the page after removing its last record. */
async function refreshProjects(): Promise<void> {
  await refresh();
  page.value = Math.min(page.value, Math.max(1, data.value?.meta.pageCount ?? 1));
}
</script>
