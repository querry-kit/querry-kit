<template>
  <UCheckbox
    :aria-label="t('filtering.valueField', { field: label ?? filter.field })"
    :model-value="Boolean(filter.value)"
    @update:model-value="(value: boolean) => update({ value: Boolean(value) })"
  />
</template>

<script setup lang="ts">
import type { FilteringField } from '../../../../types/table';

import { useTableI18n } from '../../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../../texts';

const props = defineProps<{
  filter: FilteringField;
  label?: string;
  texts?: TableTextOverrides;
  update: (patch: Partial<FilteringField>) => void;
}>();
const t = useTableI18n(() => props.texts);
</script>
