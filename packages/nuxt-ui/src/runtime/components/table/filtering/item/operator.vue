<template>
  <USelect
    class="w-16"
    size="sm"
    value-key="value"
    :aria-label="t('filtering.operatorField', { field: label ?? filter.field })"
    :aria-description="description"
    :model-value="filter.operator"
    :items="operators"
    @update:model-value="(operator: SupportedOperator) => update({ operator })"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTableI18n } from '../../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../../texts';
import type { FilteringField } from '../../../../types/table';

const props = defineProps<{
  filter: FilteringField;
  label?: string;
  texts?: TableTextOverrides;
  comparison: boolean;
  update: (patch: Partial<FilteringField>) => void;
}>();
const choices = ['in', 'notIn'] as const;
const comparisons = ['equals', 'not', 'gt', 'gte', 'lt', 'lte'] as const;
type SupportedOperator = (typeof choices)[number] | (typeof comparisons)[number];
const t = useTableI18n(() => props.texts);
const operators = computed(() =>
  (props.comparison ? comparisons : choices).map((value) => ({
    value,
    label: t(`filtering.operators.${value}`),
  })),
);
const description = computed(() => {
  const value = operators.value.find((item) => item.value === props.filter.operator)?.value;
  return value && t(`filtering.operatorDescriptions.${value}`);
});
</script>
