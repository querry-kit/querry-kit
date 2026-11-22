<template>
  <FilteringOperator :filter="filter" :label="label" :texts="texts" :comparison="false" :update="update" />
  <component
    :is="field?.component"
    v-if="field?.component"
    class="qk-table-filtering-value"
    size="sm"
    :aria-label="t('filtering.valueField', { field: label ?? filter.field })"
    :model-value="filter.value"
    multiple
    @update:model-value="(value: string[] | number[]) => update({ value })"
  />
  <USelectMenu
    v-else
    class="qk-table-filtering-value"
    label-key="label"
    size="sm"
    value-key="value"
    :aria-label="t('filtering.valueField', { field: label ?? filter.field })"
    :model-value="filter.value"
    :items="field?.values ?? []"
    multiple
    @update:model-value="(value: string[] | number[]) => update({ value })"
  />
</template>

<script setup lang="ts">
import { type FilterFieldEnum, type FilteringField } from '../../../../types/table';

import { useTableI18n } from '../../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../../texts';
import FilteringOperator from './operator.vue';

const props = defineProps<{
  filter: FilteringField;
  label?: string;
  texts?: TableTextOverrides;
  field?: FilterFieldEnum;
  update: (patch: Partial<FilteringField>) => void;
}>();
const t = useTableI18n(() => props.texts);
</script>
