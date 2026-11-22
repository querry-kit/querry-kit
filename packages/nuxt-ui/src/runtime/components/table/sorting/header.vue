<template>
  <div class="mb-4 flex items-center justify-between gap-2">
    <span class="flex items-center gap-2">
      <UIcon :name="icon('sorting.header')" />
      {{ t('sorting.title') }}
    </span>
    <UButton
      v-if="hasSorting"
      color="error"
      size="xs"
      variant="outline"
      :icon="icon('sorting.clear')"
      :aria-label="t('sorting.clear')"
      @click="clear"
    />
  </div>
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';

const props = defineProps<{
  hasSorting: boolean;
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  clear: () => void;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
</script>
