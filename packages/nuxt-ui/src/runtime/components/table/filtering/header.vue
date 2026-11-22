<template>
  <div class="mb-4 flex items-center justify-between gap-2">
    <span class="flex items-center gap-2">
      <UIcon :name="icon('filtering.header')" />
      {{ t('filtering.title') }}
    </span>
    <div class="flex gap-1">
      <UButton
        color="neutral"
        size="xs"
        variant="outline"
        :icon="filtering.operator === FilteringMode.Intersect ? icon('filtering.intersect') : icon('filtering.union')"
        :aria-label="t('filtering.mode')"
        @click="toggleMode"
      />
      <UButton
        v-if="hasFilters"
        color="error"
        size="xs"
        variant="outline"
        :icon="icon('filtering.clear')"
        :aria-label="t('filtering.clear')"
        @click="clear"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import { FilteringMode, type Filtering } from '../../../types/table';

const props = defineProps<{
  filtering: Filtering;
  hasFilters: boolean;
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  clear: () => void;
  toggleMode: () => void;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
</script>
