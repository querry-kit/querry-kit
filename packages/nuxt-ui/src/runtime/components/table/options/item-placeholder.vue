<template>
  <li>
    <div
      v-if="show"
      class="text-dimmed border-muted flex items-center gap-2 rounded-md border-2 border-dashed p-2 text-sm"
      :class="{
        'pb-1.5': isLeft,
        'pt-1.5': isRight,
        'py-1.5': isCenter,
      }"
    >
      <UIcon :name="isCenter ? icon('options.unpin') : icon('options.pin')" />
      <span>{{ label }}</span>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type { ColumnPinning } from '../../../types/table';

const props = defineProps<{
  side: 'left' | 'center' | 'right';
  columnPinning: ColumnPinning;
  columnOrder: string[];
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
const isLeft = computed(() => props.side === 'left');
const isRight = computed(() => props.side === 'right');
const isCenter = computed(() => props.side === 'center');
const label = computed(() => {
  if (isLeft.value) return t('options.left');
  if (isRight.value) return t('options.right');
  return t('options.center');
});
const show = computed(() => {
  if (isLeft.value) return (props.columnPinning.left ?? []).length === 0;
  if (isRight.value) return (props.columnPinning.right ?? []).length === 0;

  const left = props.columnPinning.left ?? [];
  const right = props.columnPinning.right ?? [];
  return left.length + right.length === props.columnOrder.length;
});
</script>
