<template>
  <li class="group flex items-center gap-2">
    <UIcon v-if="showDragHandle" class="drag-handle text-dimmed shrink-0 cursor-grab" :name="icon('options.drag')" />
    <span class="text-muted grow truncate text-sm">{{ label }}</span>
    <UTooltip :text="t('sorting.toggle')">
      <UButton
        color="neutral"
        size="sm"
        variant="soft"
        :icon="sort.desc ? icon('sorting.descending') : icon('sorting.ascending')"
        :aria-label="t('sorting.toggle')"
        @click="toggleDirection"
      />
    </UTooltip>
    <UTooltip :text="t('sorting.remove')">
      <UButton
        color="error"
        size="sm"
        variant="outline"
        :icon="icon('sorting.remove')"
        :aria-label="t('sorting.remove')"
        @click="remove"
      />
    </UTooltip>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type { SortingField, SortingState } from '../../../types/table';

const props = defineProps<{
  sort: SortingState[number];
  fields: SortingField[];
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  remove: () => void;
  toggleDirection: () => void;
  showDragHandle: boolean;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
const label = computed(() => props.fields.find((field) => field.value === props.sort.id)?.label ?? props.sort.id);
</script>
