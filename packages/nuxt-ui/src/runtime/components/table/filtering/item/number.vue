<template>
  <FilteringOperator :filter="filter" :label="label" :texts="texts" :comparison="true" :update="update" />
  <UInputNumber
    class="w-28"
    size="sm"
    :aria-label="t('filtering.valueField', { field: label ?? filter.field })"
    :model-value="Number(filter.value)"
    @update:model-value="(value: number | undefined) => update({ value: value ?? undefined })"
  />
</template>

<script setup lang="ts">
import { type FilteringField } from '../../../../types/table';

import { useTableI18n } from '../../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../../texts';
import FilteringOperator from './operator.vue';

const props = defineProps<{
  filter: FilteringField;
  label?: string;
  texts?: TableTextOverrides;
  update: (patch: Partial<FilteringField>) => void;
}>();
const t = useTableI18n(() => props.texts);
</script>
