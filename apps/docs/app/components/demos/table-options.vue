<template>
  <DemosDemoShell title="Live column options" description="Reorder, hide and pin columns while keeping state in this page.">
    <div class="flex items-center gap-3">
      <QTableOptions
        v-model:column-order="columnOrder"
        v-model:invisible-columns="invisibleColumns"
        v-model:column-pinning="columnPinning"
        :columns="columns"
      />
      <code class="text-xs text-muted">{{ columnOrder.join(', ') }}</code>
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import type { ColumnDefinition, ColumnPinning } from '../../../node_modules/@querry-kit/nuxt-ui/dist/runtime/types/table.js';

const columnOrder = ref<string[]>(['name', 'status', 'owner']);
const invisibleColumns = ref<string[]>([]);
const columnPinning = ref<ColumnPinning>({});
const columns: ColumnDefinition[] = [
  { id: 'name', header: 'Project name' },
  { id: 'status', header: 'Status' },
  { id: 'owner', header: 'Owner' },
];
</script>
