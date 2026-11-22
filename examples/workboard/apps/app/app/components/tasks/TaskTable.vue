<template>
  <WorkboardPanel title="Tasks" full-page>
    <template #toolbar>
      <!-- Controls only manage intent. The headless table translates it into server requests. -->
      <QTableToolbar
        v-model:search="search"
        v-model:filtering="toolbarFiltering"
        v-model:sorting="sorting"
        v-model:grouping="grouping"
        v-model:column-order="columnOrder"
        v-model:invisible-columns="columnVisibility"
        v-model:column-pinning="columnPinning"
        search-placeholder="Search tasks"
        :selected-count="selectedCount"
        :filter-fields="filterFields"
        :sortable-fields="sortableFields"
        :groupable-fields="groupableFields"
        :column-definitions="columnOptions"
      >
        <template #layout="{ search: searchControl, options, actions }">
          <WorkboardToolbarLayout
            :breadcrumbs="[{ label: 'Tasks' }]"
            :actions="actions"
            :search="searchControl"
            :options="options"
          />
        </template>
        <template #bulk-actions>
          <WorkboardDeleteDialog
            v-model:open="deleteOpen"
            title="Delete selected tasks"
            :description="`Permanently delete ${selectedCount} selected ${selectedCount === 1 ? 'task' : 'tasks'}?`"
            :remove="deleteSelected"
            @deleted="refreshAfterDelete"
          >
            <UButton color="error" variant="outline" icon="i-tabler-trash" label="Delete selected" />
          </WorkboardDeleteDialog>
        </template>
        <template #new>
          <TasksTaskEditor :project-id="editorProjectId" @saved="openCreatedTask">
            <WorkboardNewButton label="New task" />
          </TasksTaskEditor>
        </template>
      </QTableToolbar>
    </template>

    <QTableGrouped
      ref="groupedView"
      label="Tasks table"
      flexible-column="title"
      :table="table"
      :columns="columns"
      :available-columns="availableColumns"
      :get-id="(item) => item.id ?? ''"
      :ui="taskTableUi"
      :texts="{ grouping: { empty: 'No matching tasks', itemsError: 'Could not load tasks' } }"
    >
      <template #leading-header="{ items }">
        <UCheckbox
          aria-label="Select visible tasks"
          :model-value="visibleSelection(items)"
          :disabled="!items.some((item) => item.id)"
          @update:model-value="selectTasks(items, $event === true)"
        />
      </template>
      <template #leading="{ item, node }">
        <UCheckbox
          v-if="node"
          :aria-label="`Select group ${node.value ?? 'No value'} ${node.count} items`"
          :ui="{ base: 'data-[state=unchecked]:ring-current' }"
          :model-value="groupState(node)"
          @update:model-value="selectGroup(node, $event === true)"
        />
        <UCheckbox
          v-else-if="item?.id"
          :aria-label="`Select ${item.title ?? item.id}`"
          :model-value="isSelected(item)"
          @update:model-value="selectTasks([item], $event === true)"
        />
      </template>
      <template #group-value="{ node }">
        <TasksTaskValue :field="node.field" :value="node.value" />
      </template>
      <template #group-cell="{ node, field }">
        <span v-if="field === 'estimatedHours'" aria-label="Total estimated hours" class="font-medium text-highlighted">
          {{ node.sum?.estimatedHours ?? '—' }}
        </span>
      </template>
      <template #cell="{ field, item }">
        <ULink
          v-if="field === 'title' && item.id"
          class="font-medium text-highlighted hover:text-primary"
          :to="{ path: `/tasks/${item.id}`, query: projectQuery }"
          :aria-label="`Open ${item.title ?? item.id}`"
        >
          {{ item.title }}
        </ULink>
        <UBadge
          v-else-if="field === 'project' && item.project?.title"
          class="rounded-full"
          color="primary"
          variant="subtle"
          icon="i-tabler-folder"
          :label="item.project.title"
        />
        <UBadge
          v-else-if="field === 'owner' && item.owner?.profile?.displayName"
          class="rounded-full"
          color="neutral"
          variant="subtle"
          icon="i-tabler-user"
          :label="item.owner.profile.displayName"
        />
        <template v-else-if="field === 'labels'">
          <ul v-if="item.labels?.length" class="flex max-w-64 flex-wrap gap-1" aria-label="Labels">
            <li v-for="label in item.labels" :key="label.id">
              <UBadge
                class="rounded-full"
                color="neutral"
                variant="subtle"
                icon="i-tabler-tag"
                :label="label.displayName"
              />
            </li>
          </ul>
          <span v-else>—</span>
        </template>
        <UDropdownMenu
          v-else-if="field === 'actions' && item.id"
          :items="[
            {
              label: 'Open',
              icon: 'i-tabler-external-link',
              to: { path: `/tasks/${item.id}`, query: projectQuery },
            },
          ]"
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-tabler-dots-vertical"
            :aria-label="`Actions for ${item.title ?? item.id}`"
          />
        </UDropdownMenu>
        <TasksTaskValue v-else :field="field" :value="taskValue(item, field)" />
      </template>
      <template #footer-start>
        <UFieldGroup role="group" aria-label="Row loading mode" size="sm">
          <UTooltip v-for="mode in loadingModes" :key="mode.value" :text="mode.label">
            <UButton
              class="cursor-pointer"
              :color="loadingMode === mode.value ? 'primary' : 'neutral'"
              :variant="loadingMode === mode.value ? 'solid' : 'outline'"
              :icon="mode.icon"
              :aria-label="mode.label"
              :aria-pressed="loadingMode === mode.value"
              @click="loadingMode = mode.value"
            />
          </UTooltip>
        </UFieldGroup>
      </template>
    </QTableGrouped>
  </WorkboardPanel>
</template>

<script setup lang="ts">
import { andWhere, filteringToWhere, isEqual, useGroupedTable } from '@querry-kit/nuxt';
import {
  FilteringFieldOperator,
  type ColumnDefinition,
  type FilterField,
  type FilterLookupSource,
  type Filtering,
  type GroupedTableColumn,
  type GroupingField,
  type SortingField,
} from '@querry-kit/nuxt-ui/types';
import { refDebounced } from '@vueuse/core';
import {
  projectFilterLimit,
  resourceIdSchema,
  type DemoSession,
  type ProjectLookup,
  type Task,
} from '@workboard/contracts';

import { QTableFilterLookup } from '#components';

import { taskTableUi, type GroupItemColumn } from '~/utils/group-table';
import { projectSearchQuery } from '~/utils/project-lookup';
import { taskFilterFields, taskStaticWhere } from '~/utils/task-controls';

const props = defineProps<{ session: DemoSession }>();
const { $workboardApi } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const search = ref('');
const { selectedCount, isSelected, groupState, selectTasks, selectGroup, deletePayload, clearSelection } =
  useTaskSelection();
const deleteOpen = ref(false);
const debouncedSearch = refDebounced(search, 250);
const loadingModes = [
  { value: 'pagination', label: 'Pagination', icon: 'i-tabler-list-numbers' },
  { value: 'infinite', label: 'Infinite scroll', icon: 'i-tabler-infinity' },
] as const;
const groupedView = useTemplateRef<{ focus: () => void }>('groupedView');

const staticFilter = computed(
  /** Applies the title search independently of the structured filters. */
  () => taskStaticWhere(debouncedSearch.value),
);

/** Renders the title from the projected relation rather than passing the object to the renderer. */
function projectTitle(item: Task): string {
  return item.project?.title ?? '—';
}

/** Renders a public account name without exposing any additional account data. */
function ownerName(item: Task): string {
  return item.owner?.profile?.displayName ?? '—';
}

type TaskColumn = GroupItemColumn & GroupedTableColumn;
const allColumns: TaskColumn[] = [
  { id: 'title', width: 220, accessorKey: 'title', header: 'Title', enableHiding: false },
  { id: 'status', width: 192, accessorKey: 'status', header: 'Status' },
  { id: 'priority', width: 132, accessorKey: 'priority', header: 'Priority' },
  { id: 'project', width: 150, accessorFn: projectTitle, header: 'Project', fields: ['title'] },
  { id: 'owner', width: 150, accessorFn: ownerName, header: 'Owner', fields: ['profile.displayName'] },
  { id: 'estimatedHours', width: 115, align: 'right', accessorKey: 'estimatedHours', header: 'Est. hours' },
  { id: 'labels', width: 144, accessorKey: 'labels', header: 'Labels', fields: ['id', 'displayName'] },
  {
    id: 'internalNote',
    width: 220,
    groupedCellClass: 'whitespace-normal wrap-break-word',
    accessorKey: 'internalNote',
    header: 'Internal note',
  },
  { id: 'internalCostCents', width: 130, align: 'right', accessorKey: 'internalCostCents', header: 'Internal cost' },
  { id: 'actions', width: 88, align: 'right', sortable: false, header: 'Actions', enableHiding: false },
];

const availableColumns = computed(
  /** Offers only authorized columns. The API independently checks projection requests. */
  () => {
    const fields = new Set<string>(props.session.fields);
    return allColumns.filter(
      /** Keeps the action slot or a field advertised for the active account. */
      ({ id }) => id === 'actions' || Boolean(id && fields.has(id)),
    );
  },
);

const columnOptions = computed<ColumnDefinition[]>(
  /** Exposes display labels, not renderer callbacks, to the column configuration panel. */
  () =>
    availableColumns.value.flatMap(
      /** Omits any column without a selectable identifier or string label. */
      ({ id, header, enableHiding }) => (id && typeof header === 'string' ? [{ id, header, enableHiding }] : []),
    ),
);

const sortableFields = computed<SortingField[]>(
  /** Offers the same authorized data columns in the toolbar and preserves the creation-date sort. */
  () => [
    ...columnOptions.value.flatMap(
      /** Skips the action menu, which has no sortable value. */
      ({ id, header }) => (id === 'actions' ? [] : [{ value: id, label: header }]),
    ),
    { value: 'createdAt', label: 'Created at' },
  ],
);

const groupableFields: GroupingField[] = props.session.groupableFields.map(
  /** Uses the same label as the table header for each authorized grouping field. */
  (value) => ({
    value,
    label: columnOptions.value.find(/** Matches the grouping field ID. */ ({ id }) => id === value)?.header ?? value,
  }),
);

// The headless table owns projections, preferences, sorting, and server pagination.
// https://querry-kit.github.io/querry-kit/docs/nuxt/api/table/
// https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/toolbar/
const table = useGroupedTable<Task, TaskColumn>({
  api: $workboardApi,
  endpoint: 'tasks',
  columns: availableColumns,
  groupableFields,
  groupSumFields: ['estimatedHours'],
  persistExpansion: true,
  persistenceKey: `tasks:${props.session.id}`,
  staticFilter,
  defaultItemsPerPage: 10,
  loading: { initialMode: 'pagination', preloadGroupItems: false },
});
const { columns, grouping, loadingMode, sorting, filtering, columnOrder, columnVisibility, columnPinning } = table;
const projectField = 'project.id';
const projectFilter = computed(
  /** Looks up the project rule in the same state used for all structured filters. */
  () =>
    (filtering.value as Filtering).filters.find(
      /** Finds the project ID rule. */ (rule) => rule.field === projectField,
    ),
);
const projects = useWorkboardResources('projects');
const projectLookup: FilterLookupSource = {
  /** Searches projects through the active account's existing lookup endpoint. */
  async search(term) {
    const { data } = await projects.query(projectSearchQuery(term));
    return projectOptions(data.items);
  },
  /** Hydrates bookmarked and selected project IDs separately from the search. */
  async resolve(values) {
    const ids = projectIds(values);
    if (!ids.length) return [];
    const { data } = await projects.query({ where: { id: { in: ids } }, perPage: projectFilterLimit });
    return projectOptions(data.items);
  },
};

/** Converts Workboard projects to labelled filter choices. */
function projectOptions(items: ProjectLookup[]) {
  return items.map(
    /** Maps a project to its public ID and title. */ ({ id, title }) => ({
      value: id,
      label: title,
    }),
  );
}

const filterFields = computed<FilterField[]>(
  /** Allows one project rule with multiple project IDs. */
  () => [
    {
      value: projectField,
      label: 'Project',
      type: 'select',
      component: QTableFilterLookup,
      componentProps: {
        source: projectLookup,
        maxSelections: projectFilterLimit,
        texts: { filtering: { lookupPlaceholder: 'Select projects', lookupError: 'Projects could not be loaded.' } },
      },
      disabled: Boolean(projectFilter.value),
    },
    ...taskFilterFields,
  ],
);

/** Normalizes project IDs from URL parameters or a filter row. */
function projectIds(value: unknown): string[] {
  const items = Array.isArray(value) ? value : [value];
  const ids = new Set<string>();
  for (const item of items) {
    const parsed = resourceIdSchema.safeParse(item);
    if (parsed.success) ids.add(parsed.data);
    if (ids.size === projectFilterLimit) break;
  }
  return [...ids];
}

const projectQuery = computed(
  /** Serializes the inclusion operator implicitly for compatibility with existing project links. */
  () => {
    const ids = projectIds(projectFilter.value?.value);
    return {
      project: ids.length ? ids : undefined,
      projectOp: ids.length && projectFilter.value?.operator === FilteringFieldOperator.NotIn ? 'notIn' : undefined,
    };
  },
);
const editorProjectId = computed(
  /** Prefills new tasks only when the filter includes exactly one project. */
  () =>
    projectQuery.value.project?.length === 1 && !projectQuery.value.projectOp
      ? projectQuery.value.project[0]
      : undefined,
);

const toolbarFiltering = computed<Filtering>({
  /** Displays the canonical structured filters. */
  get: () => filtering.value as Filtering,
  /** Mirrors project changes in the URL while keeping the other query parameters. */
  set: (value) => {
    const before = projectQuery.value;
    filtering.value = value;
    if (!isEqual(before, projectQuery.value)) {
      void router.replace({ query: { ...route.query, ...projectQuery.value } });
    }
  },
});

watch(
  /** Watches both bookmarked projects and the optional exclusion operator. */
  () => [route.query.project, route.query.projectOp] as const,
  /** Applies bookmarked projects through the standard filter model. */
  ([rawIds, rawOperator]) => {
    const ids = projectIds(rawIds);
    const operator = rawOperator === 'notIn' ? FilteringFieldOperator.NotIn : FilteringFieldOperator.In;
    const current = projectFilter.value;
    if (isEqual(ids, projectIds(current?.value)) && (!ids.length || current?.operator === operator)) return;

    const state = filtering.value as Filtering;
    const otherFilters = state.filters.filter(
      /** Leaves the other structured filters in place. */ (rule) => rule.field !== projectField,
    );
    filtering.value = {
      ...state,
      filters: ids.length
        ? [
            { id: current?.id ?? projectField, field: projectField, type: 'select', operator, value: ids },
            ...otherFilters,
          ]
        : otherFilters,
    };
  },
  { immediate: true, deep: true },
);
const groupFilter = computed(
  /** Shares the table's title search and structured filters with group metrics. */
  () => andWhere(staticFilter.value, filteringToWhere(filtering.value)),
);
const selectionScope = computed(
  /** Distinguishes filter and grouping changes from page changes. */
  () => JSON.stringify([groupFilter.value, grouping.value]),
);
watch(
  selectionScope,
  /** Prevents a stale selection from being confirmed against a different filter. */
  () => {
    deleteOpen.value = false;
    clearSelection();
  },
);

/** Reflects an empty, partial or complete selection of the visible task rows. */
function visibleSelection(items: readonly Task[]): boolean | 'indeterminate' {
  const selectable = items.filter(/** Selects only records with an ID. */ (item) => item.id);
  const count = selectable.filter(isSelected).length;
  return count > 0 && (count === selectable.length ? true : 'indeterminate');
}

/** Reads plain projected values after relation and action cells have been handled. */
function taskValue(task: Task, id: string): string | number | boolean | undefined {
  const value = task[id as keyof Task];
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
}

/** Opens the created task even if it falls outside the current filters or page. */
function openCreatedTask(task: Task): void {
  if (task.id) void router.push({ path: `/tasks/${task.id}`, query: projectQuery.value });
}

/** Submits the confirmed selection as one atomic request. */
async function deleteSelected(): Promise<void> {
  await $workboardApi.post('/tasks/bulk-delete', deletePayload(groupFilter.value));
}

/** Reloads tasks and group totals after the confirmed deletion. */
function refreshAfterDelete(): void {
  clearSelection();
  void table.refresh();
  void nextTick(
    /** Returns keyboard focus to the table once the bulk action disappears. */ () => groupedView.value?.focus(),
  );
}

onMounted(table.initialize);
</script>
