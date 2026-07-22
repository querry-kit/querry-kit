<template>
  <UApp>
    <main class="page-shell">
      <header class="hero">
        <p class="eyebrow">Query Kit example · Workboard</p>
        <h1>Projects that retain their context.</h1>
        <p>
          Each project carries its workspace, tasks, labels and assignees through a single fields-aware API request.
        </p>
      </header>
      <section class="overview">
        <div><span>Models</span><strong>Workspace · Project · Task</strong></div>
        <div><span>Relations</span><strong>1:n and n:m labels</strong></div>
        <div><span>API</span><a :href="`${apiBase}/docs`" target="_blank">OpenAPI ↗</a></div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Project delivery</h2>
            <p>Table state is owned by <code>useTable</code>; the UI remains replaceable.</p>
          </div>
          <UButton label="Refresh" icon="i-lucide-refresh-cw" variant="soft" :loading="loading" @click="refresh" />
        </div>
        <QuerryKitTableToolbar
          v-model:column-order="columnOrder"
          v-model:column-pinning="columnPinning"
          v-model:filtering="filtering"
          v-model:invisible-columns="columnVisibility"
          v-model:search="search"
          v-model:sorting="sorting"
          :column-definitions="toolbarColumns"
          :filter-fields="filterFields"
          :sortable-fields="sortFields"
        />
        <UAlert
          v-if="error"
          color="error"
          title="Projects could not be loaded"
          description="Start the Workboard API on port 3101 or configure NUXT_PUBLIC_API_BASE."
          class="my-4"
        />
        <UTable :data="items" :columns="columns" :loading="loading" class="mt-4" />
        <QuerryKitTablePagination
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :total-items="totalItems"
          class="mt-4"
        />
      </section>
    </main>
  </UApp>
</template>

<script setup lang="ts">
import { useTable } from '@querry-kit/nuxt/table';
import type { TableColumn } from '@querry-kit/nuxt/types';
import type { Project } from './plugins/api';

const { $workboardApi } = useNuxtApp();
const apiBase = useRuntimeConfig().public.apiBase;
const search = ref<string>();
const columns = ref<TableColumn<Project>[]>([
  { id: 'name', header: 'Project' },
  { id: 'workspace', header: 'Workspace', fields: ['name'] },
  { id: 'tasks', header: 'Tasks', fields: ['title', 'status', 'labels.name'] },
  { id: 'updatedAt', header: 'Updated' },
]);
const toolbarColumns = columns.value.map(({ id, header }) => ({ id, header: String(header) }));
const sortFields = columns.value.map(({ id, header }) => ({ value: id, label: String(header) }));
const filterFields: never[] = [];
const table = useTable<Project>({
  api: $workboardApi,
  endpoint: 'projects',
  persistenceKey: 'workboard-projects',
  columns,
  defaultItemsPerPage: 10,
});
const { columnOrder, columnVisibility, error, items, itemsPerPage, loading, page, refresh, sorting, totalItems } =
  table;
const columnPinning = ref({} as never);
const filtering = ref({ operator: 'AND', filters: [] } as never);
onMounted(() => void table.initialize());
</script>
