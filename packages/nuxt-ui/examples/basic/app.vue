<template>
  <UApp>
    <QTableToolbar
      v-model:column-order="columnOrder"
      v-model:column-pinning="columnPinning"
      v-model:filtering="filtering"
      v-model:invisible-columns="invisibleColumns"
      v-model:search="search"
      v-model:sorting="sorting"
      :column-definitions="columns"
      :filter-fields="filterFields"
      :sortable-fields="sortFields"
    >
      <template #new><UButton label="Create" /></template>
    </QTableToolbar>
    <UTable :columns="columns" :data="rows" />
    <QTablePagination v-model:items-per-page="itemsPerPage" v-model:page="page" :total-items="rows.length">
      <template #right><span class="text-muted text-xs">Custom footer</span></template>
    </QTablePagination>
  </UApp>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  FilterFieldType,
  FilteringMode,
  type ColumnDefinition,
  type ColumnPinning,
  type Filtering,
  type SortingState,
} from '../../../src/runtime/types/table';

const rows = [
  { id: '1', name: 'Ada', active: true },
  { id: '2', name: 'Grace', active: false },
];
const columns: ColumnDefinition[] = [
  { id: 'name', header: 'Name' },
  { id: 'active', header: 'Active' },
];
const sortFields = columns.map(({ id, header }) => ({ value: id, label: header }));
const filterFields = [{ value: 'active', label: 'Active', type: FilterFieldType.Boolean }];
const search = ref<string>();
const sorting = ref<SortingState>([]);
const filtering = ref<Filtering>({ operator: FilteringMode.Intersect, filters: [] });
const columnOrder = ref(columns.map((column) => column.id));
const invisibleColumns = ref<string[]>([]);
const columnPinning = ref<ColumnPinning>({});
const page = ref(1);
const itemsPerPage = ref(10);
</script>
