<template>
  <ul v-if="hasFilters" class="flex flex-col gap-2">
    <li v-for="filter in filters" :key="filter.id" class="flex items-center gap-2">
      <slot
        name="item"
        :filter="filter"
        :field="fieldFor(filter.field)"
        :remove="() => remove(filter.id)"
        :update="(patch: Partial<FilteringField>) => update(filter.id, patch)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { FilterField, FilteringField } from '../../../types/table';

const props = defineProps<{
  filters: FilteringField[];
  fields: FilterField[];
  hasFilters: boolean;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<FilteringField>) => void;
}>();
const fieldFor = (id: string) => props.fields.find((field) => field.value === id);
</script>
