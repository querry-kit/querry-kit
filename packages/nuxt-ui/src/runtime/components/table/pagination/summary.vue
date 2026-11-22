<template>
  <span v-if="totalItems" class="text-muted text-sm">
    {{
      summary ??
      t('pagination.summary', {
        start: formatNumber(start),
        end: formatNumber(end),
        total: formatNumber(totalItems),
      })
    }}
  </span>
</template>

<script setup lang="ts">
import { useTableI18n, useTableNumber } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';

const props = defineProps<{
  totalItems: number;
  start: number;
  end: number;
  summary?: string;
  texts?: TableTextOverrides;
}>();
const formatNumber = useTableNumber();
const t = useTableI18n(() => props.texts);
</script>
