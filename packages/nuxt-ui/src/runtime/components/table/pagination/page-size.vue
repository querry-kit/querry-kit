<template>
  <USelect
    class="w-16"
    size="sm"
    value-key="value"
    :aria-label="t('pagination.pageSize')"
    :model-value="itemsPerPage"
    :items="[{ type: 'label', label: t('pagination.pageSize') }, ...items]"
    :ui="{ content: 'min-w-32' }"
    @update:model-value="(value: number | string) => setItemsPerPage(Number(value))"
  />
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';

const props = defineProps<{
  itemsPerPage: number;
  texts?: TableTextOverrides;
  items: Array<{ value: number; label: string }>;
  setItemsPerPage: (value: number) => void;
}>();
const t = useTableI18n(() => props.texts);
</script>
