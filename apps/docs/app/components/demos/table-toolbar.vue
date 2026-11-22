<template>
  <DemosDemoShell title="Live toolbar" description="Search the projects, create one with Shift+N, or select rows to reveal the bulk-action toolbar. Changes last until you leave the demo.">
    <QTableToolbar
      v-model:search="search"
      v-model:grouping="grouping"
      v-model:sorting="sorting"
      v-model:filtering="filtering"
      v-model:column-order="columnOrder"
      v-model:invisible-columns="invisibleColumns"
      v-model:column-pinning="columnPinning"
      :column-definitions="columns"
      :sortable-fields="sortableFields"
      :groupable-fields="sortableFields"
      :filter-fields="filterFields"
      :breadcrumb-items="[{ label: 'Projects' }]"
      search-placeholder="Search demo projects"
      :selected-count="selected.length"
    >
      <template #new>
        <UModal v-model:open="creating" title="Create demo project" description="Add a project to this example.">
          <UTooltip text="Create project" :kbds="['Shift', 'N']">
            <UButton size="sm" label="Create project" icon="i-lucide-plus" aria-label="Create project" :ui="{ label: 'hidden sm:inline' }" />
          </UTooltip>
          <template #body>
            <form class="flex flex-wrap items-end gap-2" @submit.prevent="createProject">
              <UFormField label="Project name"><UInput v-model="draft" required /></UFormField>
              <UButton type="submit" label="Add project" :disabled="!draft.trim()" />
            </form>
          </template>
        </UModal>
      </template>
      <template #bulk-actions>
        <UButton size="sm" color="neutral" variant="outline" label="Clear selection" @click="selected = []" />
      </template>
    </QTableToolbar>
    <ul class="divide-y divide-default">
      <li v-for="project in visibleProjects" :key="project.id" class="p-2">
        <UCheckbox :label="project.title" :model-value="selected.includes(project.id)" @update:model-value="setSelected(project.id, $event === true)" />
      </li>
    </ul>
    <p v-if="!visibleProjects.length" class="p-2 text-sm text-muted">No matching projects.</p>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import type {
  ColumnDefinition,
  ColumnPinning,
  FilterField,
  Filtering,
  SortingField,
  SortingState,
} from '../../../node_modules/@querry-kit/nuxt-ui/dist/runtime/types/table.js';
import { FilterFieldType, FilteringMode } from '../../../node_modules/@querry-kit/nuxt-ui/dist/runtime/types/table.js';

const search = ref<string>('');
type DemoProject = { id: number; title: string };
const projects = ref<DemoProject[]>([{ id: 1, title: 'Workboard' }, { id: 2, title: 'Design' }, { id: 3, title: 'Operations' }]);
const selected = ref<number[]>([]);
const creating = ref<boolean>(false);
const draft = ref<string>('');
const visibleProjects = computed<DemoProject[]>(() => projects.value.filter(project => project.title.toLowerCase().includes(search.value.trim().toLowerCase())));

function setSelected(id: number, checked: boolean): void {
  selected.value = checked ? [...selected.value, id] : selected.value.filter(value => value !== id);
}

function createProject(): void {
  const title = draft.value.trim();
  if (!title) return;
  projects.value.push({ id: projects.value.length + 1, title });
  search.value = '';
  draft.value = '';
  creating.value = false;
}
const grouping = ref<string[]>(['status', 'owner']);
const sorting = ref<SortingState>([]);
const filtering = ref<Filtering>({ operator: FilteringMode.Intersect, filters: [] });
const columnOrder = ref<string[]>(['name', 'status', 'owner']);
const invisibleColumns = ref<string[]>([]);
const columnPinning = ref<ColumnPinning>({});
const columns: ColumnDefinition[] = [
  { id: 'name', header: 'Project name' },
  { id: 'status', header: 'Status' },
  { id: 'owner', header: 'Owner' },
];
const sortableFields: SortingField[] = columns.map((column) => ({ value: column.id, label: column.header }));
const filterFields: FilterField[] = [{ value: 'active', label: 'Active projects', type: FilterFieldType.Boolean }];
</script>
