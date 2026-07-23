<template>
  <DemosDemoShell title="Live sorting" description="Add sort fields, reverse their direction or clear the state.">
    <div class="flex items-center gap-3">
      <QTableSorting v-model:sorting="sorting" :fields="fields" />
      <code class="text-xs text-muted">{{ sorting }}</code>
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import type { SortingField, SortingState } from '../../../node_modules/@querry-kit/nuxt-ui/dist/runtime/types/table.js';

const sorting = ref<SortingState>([{ id: 'name', desc: false }]);
const fields: SortingField[] = [
  { value: 'name', label: 'Project name' },
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'status', label: 'Status' },
];
</script>
