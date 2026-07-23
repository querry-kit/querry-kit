<template>
  <DemosDemoShell title="Live toolbar" description="Search and open the table controls. This is the shipped component, not a mockup.">
    <QTableToolbar
      v-model:search="search"
      v-model:sorting="sorting"
      v-model:filtering="filtering"
      v-model:column-order="columnOrder"
      v-model:invisible-columns="invisibleColumns"
      v-model:column-pinning="columnPinning"
      :column-definitions="columns"
      :sortable-fields="sortableFields"
      :filter-fields="filterFields"
      :breadcrumb-items="[{ label: 'Projects' }]"
    >
      <template #new><UButton size="sm" label="Create project" icon="i-lucide-plus" /></template>
    </QTableToolbar>
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
