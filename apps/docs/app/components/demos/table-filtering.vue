<template>
  <DemosDemoShell title="Live filtering" description="Open the popover to add a Query Kit-compatible filter group.">
    <div class="flex items-center gap-3">
      <QTableFiltering v-model:filtering="filtering" :fields="fields" />
      <code class="text-xs text-muted">{{ filtering.operator }} · {{ filtering.filters.length }} filters</code>
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import {
  FilterFieldType,
  FilteringMode,
  type FilterField,
  type Filtering,
} from '../../../node_modules/@querry-kit/nuxt-ui/dist/runtime/types/table.js';

const filtering = ref<Filtering>({ operator: FilteringMode.Intersect, filters: [] });
const fields: FilterField[] = [
  { value: 'active', label: 'Active projects', type: FilterFieldType.Boolean },
  { value: 'priority', label: 'Priority', type: FilterFieldType.Number },
];
</script>
