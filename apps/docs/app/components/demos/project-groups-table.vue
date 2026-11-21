<template>
  <UAlert
    v-if="error"
    color="error"
    title="Could not load projects"
    :actions="[{ label: 'Retry', onClick: () => refresh() }]"
  />
  <UTable
    v-else
    v-model:expanded="expanded"
    :data="groups ?? []"
    :columns="columns"
    :get-row-id="(group) => group.status"
    :expanded-options="{ getRowCanExpand: (row) => row.original.rows.length > 0 }"
    :loading="status === 'pending'"
    empty="No active projects."
    caption="Projects grouped by status"
    :ui="{ caption: 'sr-only', td: 'align-middle [&[colspan]]:p-0', tr: 'data-[selectable=true]:cursor-pointer' }"
    @select="(_, row) => row.getCanExpand() && row.toggleExpanded()"
  >
    <template #status-cell="{ row }">
      <div class="flex items-center gap-2">
        <UButton
          v-if="row.getCanExpand()"
          size="xs"
          variant="ghost"
          color="neutral"
          :icon="row.getIsExpanded() ? 'i-tabler-chevron-down' : 'i-tabler-chevron-right'"
          :aria-label="`Projects: ${row.original.status}`"
          :aria-expanded="row.getIsExpanded()"
          @click.stop="row.toggleExpanded()"
        />
        <UBadge color="neutral" variant="subtle" :label="row.original.status" />
      </div>
    </template>
    <template #expanded="{ row }">
      <UTable
        :data="row.original.rows"
        :columns="detailColumns"
        :caption="`Project details: ${row.original.status}`"
        :ui="{ root: 'bg-elevated/40 ps-4', caption: 'sr-only' }"
      />
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useModuleApi } from '@querry-kit/nuxt/api';
import type { EndpointDefinition, EndpointMap } from '@querry-kit/nuxt/types';
import type { ExpandedState } from '@tanstack/table-core';
import type { AxiosInstance } from 'axios';

type Project = {
  id: string;
  title: string;
  status: string;
  estimatedHours: number | null;
};

type GroupTotal = {
  status: string;
  _count: { _all: number };
  _sum: { estimatedHours: number | null };
};

type ProjectGroup = GroupTotal & { rows: Project[] };
type Endpoints = EndpointMap & { projects: EndpointDefinition<Project> };

const props = defineProps<{ api: AxiosInstance }>();
const projects = useModuleApi<Endpoints, 'projects'>(props.api, 'projects');
const columns: TableColumn<ProjectGroup>[] = [
  { accessorKey: 'status', header: 'Status' },
  { id: 'count', accessorFn: (group) => group._count._all, header: 'Projects' },
  { id: 'hours', accessorFn: (group) => group._sum.estimatedHours ?? '—', header: 'Estimated hours' },
];
const detailColumns: TableColumn<Project>[] = [
  { accessorKey: 'title', header: 'Project' },
  { id: 'hours', accessorFn: (project) => project.estimatedHours ?? '—', header: 'Estimated hours' },
];
const expanded = ref<ExpandedState>({});
const where = { archived: false };
const perPage = 25;

/**
 * Loads all matching project records in stable order before displaying groups.
 *
 * @returns {Promise<Project[]>} Project rows across all list pages.
 */
async function loadRows(): Promise<Project[]> {
  const orderBy = { id: 'asc' };
  const first = await projects.query({ where, orderBy, page: 1, perPage });
  const rows = [...first.data.items];

  for (let page = 2; page <= first.data.meta.pageCount; page += 1) {
    const result = await projects.query({ where, orderBy, page, perPage });
    rows.push(...result.data.items);
  }

  return rows;
}

const {
  data: groups,
  status,
  error,
  refresh,
} = await useAsyncData<ProjectGroup[]>(
  'project-groups',
  async () => {
    const [{ data: totals }, rows] = await Promise.all([
      projects.groupBy<GroupTotal>({
        by: ['status'],
        where,
        orderBy: { status: 'asc' },
        _count: { _all: true },
        _sum: { estimatedHours: true },
      }),
      loadRows(),
    ]);
    const rowsByStatus = Map.groupBy(rows, (row) => row.status);

    return totals.map((total) => ({ ...total, rows: rowsByStatus.get(total.status) ?? [] }));
  },
  { lazy: true, server: false },
);
</script>
