<template>
  <li class="group flex items-center gap-2 py-1.5">
    <UIcon v-if="showDragHandle" class="drag-handle text-dimmed shrink-0 cursor-grab" :name="icon('options.drag')" />
    <span class="text-muted grow truncate text-sm">{{ column.header }}</span>
    <USwitch
      :aria-label="t('options.visibility')"
      :checked-icon="icon('options.visible')"
      :unchecked-icon="icon('options.hidden')"
      :disabled="column.enableHiding === false"
      :model-value="visible"
      @update:model-value="toggleVisibility"
    />
  </li>
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type { ColumnDefinition } from '../../../types/table';

const props = defineProps<{
  column: ColumnDefinition;
  visible: boolean;
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  toggleVisibility: () => void;
  showDragHandle: boolean;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
</script>
